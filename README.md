# Grammar Ji - Electron.js Implementation Guide

## Overview
This document outlines the implementation of Grammar Ji, an AI-powered writing assistant using Electron.js. The application allows users to check grammar, rephrase, summarize, and translate text using keyboard shortcuts.

## Core Features
1. Global keyboard shortcuts for text operations
2. Text selection and replacement
3. Grammar checking
4. Text rephrasing
5. OpenAI integration (with Azure OpenAI support)

## Technical Requirements
- Node.js (v14 or higher)
- Electron.js (v22 or higher)
- OpenAI API key or Azure OpenAI credentials
- Operating System: Windows, macOS, or Linux

## Azure OpenAI Configuration
The application uses Azure OpenAI for text processing. Here are the default configuration values:

```
Azure OpenAI Endpoint: init.openai.azure.com
Azure OpenAI API Key: 
Azure OpenAI Deployment: gpt-4o
Azure OpenAI API Version: 2025-01-01-preview
```

These values are used in the application by default, but can be changed through the settings UI.

## Project Structure
```
grammar-ji/
├── package.json
├── main.js
├── preload.js
├── renderer.js
├── index.html
├── styles.css
├── services/
│   ├── shortcutManager.js
│   ├── textService.js
│   └── openAIService.js
└── config/
    └── config.js
```

## Implementation Details

### 1. Package.json Setup
```json
{
  "name": "grammar-ji",
  "version": "1.0.0",
  "description": "Grammar Ji - Your AI-powered writing assistant",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "dependencies": {
    "electron": "^22.0.0",
    "openai": "^4.0.0",
    "electron-store": "^8.1.0"
  },
  "devDependencies": {
    "electron-builder": "^24.0.0"
  }
}
```

### 2. Main Process (main.js)
```javascript
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  setupGlobalShortcuts();
});

function setupGlobalShortcuts() {
  // Command+Shift+G for grammar check
  globalShortcut.register('CommandOrControl+Shift+G', () => {
    mainWindow.webContents.send('shortcut-triggered', 'grammar-check');
  });

  // Command+Shift+R for rephrase
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow.webContents.send('shortcut-triggered', 'rephrase');
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### 3. Preload Script (preload.js)
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onShortcutTriggered: (callback) => {
    ipcRenderer.on('shortcut-triggered', (event, shortcut) => {
      callback(shortcut);
    });
  },
  getSelectedText: () => ipcRenderer.invoke('get-selected-text'),
  replaceSelectedText: (text) => ipcRenderer.invoke('replace-selected-text', text),
  checkGrammar: (text) => ipcRenderer.invoke('check-grammar', text),
  rephraseText: (text) => ipcRenderer.invoke('rephrase-text', text),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings)
});
```

### 4. Text Service (services/textService.js)
```javascript
const { clipboard } = require('electron');
const { OpenAI } = require('openai');
const Store = require('electron-store');

const store = new Store();

class TextService {
  constructor() {
    // Check if using Azure OpenAI or standard OpenAI
    const useAzure = store.get('useAzure', true); // Default to Azure OpenAI
    
    if (useAzure) {
      // Azure OpenAI configuration
      this.openai = new OpenAI({
        apiKey: store.get('azureApiKey', ''),
        baseURL: `https://${store.get('azureEndpoint', 'init.openai.azure.com')}/openai/deployments/${store.get('azureDeployment', 'gpt-4o')}`,
        apiVersion: store.get('azureApiVersion', '2025-01-01-preview'),
        defaultQuery: { 'api-version': store.get('azureApiVersion', '2025-01-01-preview') },
        defaultHeaders: { 
          'api-key': store.get('azureApiKey', ''),
          'origin': 'https://ai.azure.com',
          'referer': 'https://ai.azure.com/',
          'x-ms-useragent': 'AzureOpenAI.Studio/ai.azure.com'
        },
      });
    } else {
      // Standard OpenAI configuration
      this.openai = new OpenAI({
        apiKey: store.get('openaiApiKey'),
      });
    }
  }

  async getSelectedText() {
    // Implementation depends on OS
    // For Windows: Use Windows API
    // For macOS: Use AppleScript
    // For Linux: Use xclip or similar
    return clipboard.readText();
  }

  async replaceSelectedText(text) {
    // Implementation depends on OS
    // Similar to getSelectedText but for pasting
    clipboard.writeText(text);
  }

  async checkGrammar(text) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Check and correct the grammar in the following text. Only return the corrected text without any explanations:\n\n${text}`
      }]
    });
    return response.choices[0].message.content;
  }

  async rephraseText(text) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Rephrase the following text to make it more clear and concise. Only return the rephrased text without any explanations:\n\n${text}`
      }]
    });
    return response.choices[0].message.content;
  }
}

module.exports = new TextService();
```

### 5. Renderer Process (renderer.js)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  window.electronAPI.onShortcutTriggered(async (shortcut) => {
    const selectedText = await window.electronAPI.getSelectedText();
    
    if (!selectedText) return;

    try {
      let result;
      if (shortcut === 'grammar-check') {
        result = await window.electronAPI.checkGrammar(selectedText);
      } else if (shortcut === 'rephrase') {
        result = await window.electronAPI.rephraseText(selectedText);
      }

      if (result) {
        await window.electronAPI.replaceSelectedText(result);
      }
    } catch (error) {
      console.error('Error processing text:', error);
    }
  });
});
```

### 6. HTML Interface (index.html)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Grammar Ji</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Grammar Ji</h1>
    <div class="shortcuts">
      <h2>Keyboard Shortcuts</h2>
      <p>Command+Shift+G: Check Grammar</p>
      <p>Command+Shift+R: Rephrase Text</p>
    </div>
    <div class="status">
      <p>Status: Running</p>
    </div>
  </div>
  <script src="renderer.js"></script>
</body>
</html>
```

### 7. Styling (styles.css)
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shortcuts {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.status {
  margin-top: 20px;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
}
```

## OS-Specific Implementation Notes

### Windows
For Windows, you'll need to use the Windows API to handle text selection and replacement:
```javascript
const { exec } = require('child_process');

// Using PowerShell to get selected text
async function getSelectedTextWindows() {
  return new Promise((resolve) => {
    exec('powershell -command "Get-Clipboard"', (error, stdout) => {
      resolve(stdout.trim());
    });
  });
}
```

### macOS
For macOS, you can use AppleScript:
```javascript
const { exec } = require('child_process');

async function getSelectedTextMacOS() {
  return new Promise((resolve) => {
    const script = 'tell application "System Events" to keystroke "c" using command down';
    exec(`osascript -e '${script}'`, () => {
      resolve(clipboard.readText());
    });
  });
}
```

### Linux
For Linux, you can use xclip:
```javascript
const { exec } = require('child_process');

async function getSelectedTextLinux() {
  return new Promise((resolve) => {
    exec('xclip -o -selection clipboard', (error, stdout) => {
      resolve(stdout.trim());
    });
  });
}
```

## Security Considerations
1. Store OpenAI API key securely using electron-store
2. Implement proper error handling
3. Validate user input
4. Use contextIsolation and nodeIntegration: false
5. Implement proper CSP headers

## Building and Distribution
1. Configure electron-builder in package.json
2. Set up code signing for macOS and Windows
3. Create installers for each platform
4. Implement auto-updates

## Additional Features to Consider
1. Settings panel for API key configuration
2. Custom shortcut configuration
3. History of text changes
4. Multiple language support
5. Offline mode with local models

## Testing
1. Unit tests for text processing
2. Integration tests for shortcuts
3. E2E tests for the complete workflow
4. Cross-platform testing

## Deployment Checklist
1. API key configuration
2. Cross-platform testing
3. Performance optimization
4. Error handling
5. User documentation
6. Update mechanism
7. Analytics (optional)
8. Crash reporting

## Azure OpenAI Integration

### Configuration
The application is configured to use Azure OpenAI by default with the following settings:

1. Azure OpenAI Endpoint: `init.openai.azure.com`
2. Azure OpenAI API Key: ``
3. Azure OpenAI Deployment Name: `gpt-4o`
4. Azure OpenAI API Version: `2025-01-01-preview`

These values are stored in the application's configuration and can be changed through the settings UI.

### Settings UI Implementation
```javascript
// settings.js
const { ipcMain } = require('electron');
const Store = require('electron-store');

const store = new Store();

function setupSettingsHandlers() {
  // Get current settings
  ipcMain.handle('get-settings', () => {
    return {
      useAzure: store.get('useAzure', true), // Default to Azure OpenAI
      openaiApiKey: store.get('openaiApiKey', ''),
      azureEndpoint: store.get('azureEndpoint', 'init.openai.azure.com'),
      azureApiKey: store.get('azureApiKey', ''),
      azureDeployment: store.get('azureDeployment', 'gpt-4o'),
      azureApiVersion: store.get('azureApiVersion', '2025-01-01-preview'),
    };
  });

  // Save settings
  ipcMain.handle('save-settings', (event, settings) => {
    store.set('useAzure', settings.useAzure);
    store.set('openaiApiKey', settings.openaiApiKey);
    store.set('azureEndpoint', settings.azureEndpoint);
    store.set('azureApiKey', settings.azureApiKey);
    store.set('azureDeployment', settings.azureDeployment);
    store.set('azureApiVersion', settings.azureApiVersion);
    return true;
  });
}

module.exports = { setupSettingsHandlers };
```

### Settings UI HTML
```html
<!-- settings.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Settings - Grammar Ji</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Settings</h1>
    <div class="settings-form">
      <div class="form-group">
        <label>
          <input type="checkbox" id="useAzure" checked> Use Azure OpenAI
        </label>
      </div>
      
      <div id="openaiSettings" style="display: none;">
        <h3>OpenAI Settings</h3>
        <div class="form-group">
          <label for="openaiApiKey">OpenAI API Key:</label>
          <input type="password" id="openaiApiKey" class="form-control">
        </div>
      </div>
      
      <div id="azureSettings">
        <h3>Azure OpenAI Settings</h3>
        <div class="form-group">
          <label for="azureEndpoint">Azure Endpoint:</label>
          <input type="text" id="azureEndpoint" class="form-control" placeholder="init.openai.azure.com" value="init.openai.azure.com">
        </div>
        <div class="form-group">
          <label for="azureApiKey">Azure API Key:</label>
          <input type="password" id="azureApiKey" class="form-control" value="">
        </div>
        <div class="form-group">
          <label for="azureDeployment">Deployment Name:</label>
          <input type="text" id="azureDeployment" class="form-control" placeholder="gpt-4o" value="gpt-4o">
        </div>
        <div class="form-group">
          <label for="azureApiVersion">API Version:</label>
          <input type="text" id="azureApiVersion" class="form-control" placeholder="2025-01-01-preview" value="2025-01-01-preview">
        </div>
      </div>
      
      <div class="form-actions">
        <button id="saveSettings" class="btn btn-primary">Save Settings</button>
      </div>
    </div>
  </div>
  <script src="settings.js"></script>
</body>
</html>
```

### Settings UI JavaScript
```javascript
// settings.js (renderer)
document.addEventListener('DOMContentLoaded', async () => {
  // Load current settings
  const settings = await window.electronAPI.getSettings();
  
  // Populate form
  document.getElementById('useAzure').checked = settings.useAzure;
  document.getElementById('openaiApiKey').value = settings.openaiApiKey;
  document.getElementById('azureEndpoint').value = settings.azureEndpoint;
  document.getElementById('azureApiKey').value = settings.azureApiKey;
  document.getElementById('azureDeployment').value = settings.azureDeployment;
  document.getElementById('azureApiVersion').value = settings.azureApiVersion;
  
  // Toggle Azure settings visibility
  toggleAzureSettings(settings.useAzure);
  
  // Handle Azure toggle
  document.getElementById('useAzure').addEventListener('change', (e) => {
    toggleAzureSettings(e.target.checked);
  });
  
  // Handle save
  document.getElementById('saveSettings').addEventListener('click', async () => {
    const newSettings = {
      useAzure: document.getElementById('useAzure').checked,
      openaiApiKey: document.getElementById('openaiApiKey').value,
      azureEndpoint: document.getElementById('azureEndpoint').value,
      azureApiKey: document.getElementById('azureApiKey').value,
      azureDeployment: document.getElementById('azureDeployment').value,
      azureApiVersion: document.getElementById('azureApiVersion').value,
    };
    
    await window.electronAPI.saveSettings(newSettings);
    alert('Settings saved successfully!');
  });
  
  function toggleAzureSettings(showAzure) {
    document.getElementById('openaiSettings').style.display = showAzure ? 'none' : 'block';
    document.getElementById('azureSettings').style.display = showAzure ? 'block' : 'none';
  }
});
``` 