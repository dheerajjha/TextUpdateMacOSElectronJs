const { clipboard } = require('electron');
const { OpenAI } = require('openai');
const Store = require('electron-store');
const { exec } = require('child_process');
const os = require('os');

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
    const platform = os.platform();
    
    if (platform === 'win32') {
      return this.getSelectedTextWindows();
    } else if (platform === 'darwin') {
      return this.getSelectedTextMacOS();
    } else {
      return this.getSelectedTextLinux();
    }
  }

  async replaceSelectedText(text) {
    // Implementation depends on OS
    const platform = os.platform();
    
    if (platform === 'win32') {
      return this.replaceSelectedTextWindows(text);
    } else if (platform === 'darwin') {
      return this.replaceSelectedTextMacOS(text);
    } else {
      return this.replaceSelectedTextLinux(text);
    }
  }

  // Windows implementation
  async getSelectedTextWindows() {
    return new Promise((resolve) => {
      exec('powershell -command "Get-Clipboard"', (error, stdout) => {
        resolve(stdout.trim());
      });
    });
  }

  async replaceSelectedTextWindows(text) {
    return new Promise((resolve) => {
      clipboard.writeText(text);
      // Simulate Ctrl+V to paste
      exec('powershell -command "$wshell = New-Object -ComObject wscript.shell;$wshell.SendKeys(\'^v\')"', () => {
        resolve(true);
      });
    });
  }

  // macOS implementation
  async getSelectedTextMacOS() {
    return new Promise((resolve) => {
      const script = 'tell application "System Events" to keystroke "c" using command down';
      exec(`osascript -e '${script}'`, () => {
        resolve(clipboard.readText());
      });
    });
  }

  async replaceSelectedTextMacOS(text) {
    return new Promise((resolve) => {
      clipboard.writeText(text);
      // Simulate Command+V to paste
      const script = 'tell application "System Events" to keystroke "v" using command down';
      exec(`osascript -e '${script}'`, () => {
        resolve(true);
      });
    });
  }

  // Linux implementation
  async getSelectedTextLinux() {
    return new Promise((resolve) => {
      exec('xclip -o -selection clipboard', (error, stdout) => {
        resolve(stdout.trim());
      });
    });
  }

  async replaceSelectedTextLinux(text) {
    return new Promise((resolve) => {
      clipboard.writeText(text);
      // Simulate Ctrl+V to paste
      exec('xdotool key ctrl+v', () => {
        resolve(true);
      });
    });
  }

  async checkGrammar(text) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a helpful assistant that corrects grammar and spelling errors in text."
        }, {
          role: "user",
          content: `Please correct any grammar or spelling errors in the following text. Return only the corrected text without any explanations:\n\n${text}`
        }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error checking grammar:', error);
      throw new Error('Failed to check grammar. Please check your API configuration.');
    }
  }

  async rephraseText(text) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a helpful assistant that improves text clarity and readability."
        }, {
          role: "user",
          content: `Please improve the following text for clarity and readability. Return only the improved text without any explanations:\n\n${text}`
        }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error rephrasing text:', error);
      throw new Error('Failed to rephrase text. Please check your API configuration.');
    }
  }
}

module.exports = { TextService }; 