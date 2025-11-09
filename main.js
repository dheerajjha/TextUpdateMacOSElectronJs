const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');
const { setupSettingsHandlers } = require('./services/settingsService');
const { TextService } = require('./services/textService');
const fs = require('fs');

console.log('Starting application...');

let mainWindow;
let tray;
const textService = new TextService();

// Function to create tray icon and menu
const createTray = () => {
  console.log('Creating tray icon...');
  const iconPath = path.join(__dirname, 'assets', 'Texty.png');
  console.log('Icon path:', iconPath);
  
  try {
    if (fs.existsSync(iconPath)) {
      console.log('Icon file exists at:', iconPath);
      // For macOS, don't resize the icon as it needs to be properly displayed in the menu bar
      const trayIcon = process.platform === 'darwin' 
        ? nativeImage.createFromPath(iconPath)
        : nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
      
      console.log('Tray icon created successfully');
      
      tray = new Tray(trayIcon);
      console.log('Tray instance created');
      
      const contextMenu = Menu.buildFromTemplate([
        { 
          label: 'Open Settings', 
          click: () => {
            if (!mainWindow) {
              createWindow();
            } else if (mainWindow.isDestroyed()) {
              createWindow();
            } else {
              mainWindow.show();
            }
          }
        },
        { type: 'separator' },
        { label: 'Test Permissions', click: () => testPermissions() },
        { type: 'separator' },
        { label: 'Toggle Grammar Check', type: 'checkbox', checked: true },
        { label: 'Toggle Rephrase', type: 'checkbox', checked: true },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
      ]);
      
      tray.setToolTip('Text Update App');
      tray.setContextMenu(contextMenu);
      console.log('Tray menu and tooltip set');
      
      tray.on('double-click', () => {
        console.log('Tray icon double-clicked');
        if (!mainWindow) {
          createWindow();
        } else if (mainWindow.isDestroyed()) {
          createWindow();
        } else {
          mainWindow.show();
        }
      });
    } else {
      console.error('Icon file not found at:', iconPath);
      // Try fallback icon
      const fallbackIconPath = path.join(__dirname, 'assets', 'icon.png');
      if (fs.existsSync(fallbackIconPath)) {
        console.log('Using fallback icon at:', fallbackIconPath);
        const trayIcon = nativeImage.createFromPath(fallbackIconPath).resize({ width: 16, height: 16 });
        tray = new Tray(trayIcon);
        // ... rest of the tray setup ...
      } else {
        console.error('Fallback icon also not found');
      }
    }
  } catch (error) {
    console.error('Error creating tray:', error);
  }
};

const testPermissions = () => {
  console.log('Testing permissions...');
  // Test clipboard permissions
  try {
    const clipboardText = clipboard.readText();
    console.log('Clipboard access successful');
  } catch (error) {
    console.error('Clipboard access failed:', error);
  }
  
  // Test notification permissions
  if (Notification.isSupported()) {
    console.log('Notifications are supported');
    new Notification({ title: 'Test', body: 'Testing notifications' }).show();
  } else {
    console.log('Notifications are not supported');
  }
};

function createWindow() {
  console.log('Creating main window...');
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Text Update App',
    icon: path.join(__dirname, 'assets/Texty.png'),
    show: false // Start hidden
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Opening DevTools (development mode)');
    mainWindow.webContents.openDevTools();
  }

  // Hide window instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

// Register grammar shortcut
function registerGrammarShortcut() {
  console.log('Setting up grammar shortcut...');
  globalShortcut.register('CommandOrControl+Shift+G', async () => {
    try {
      new Notification({ 
        title: 'Grammar Check', 
        body: 'Getting selected text...' 
      }).show();
      
      const text = await textService.getSelectedText();
      if (text && text.trim()) {
        new Notification({ 
          title: 'Grammar Check', 
          body: 'Checking grammar...' 
        }).show();
        
        const correctedText = await textService.checkGrammar(text);
        await textService.replaceSelectedText(correctedText);
        
        new Notification({ 
          title: 'Grammar Check', 
          body: 'Text has been checked and corrected' 
        }).show();
      } else {
        new Notification({ 
          title: 'Grammar Check', 
          body: 'No text selected' 
        }).show();
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      new Notification({ 
        title: 'Error', 
        body: 'Failed to check grammar: ' + error.message 
      }).show();
    }
  });
}

// Register rephrase shortcut
function registerRephraseShortcut() {
  console.log('Setting up rephrase shortcut...');
  globalShortcut.register('CommandOrControl+Shift+R', async () => {
    try {
      new Notification({ 
        title: 'Rephrase', 
        body: 'Getting selected text...' 
      }).show();
      
      const text = await textService.getSelectedText();
      if (text && text.trim()) {
        new Notification({ 
          title: 'Rephrase', 
          body: 'Rephrasing text...' 
        }).show();
        
        const rephrasedText = await textService.rephraseText(text);
        await textService.replaceSelectedText(rephrasedText);
        
        new Notification({ 
          title: 'Rephrase', 
          body: 'Text has been rephrased' 
        }).show();
      } else {
        new Notification({ 
          title: 'Rephrase', 
          body: 'No text selected' 
        }).show();
      }
    } catch (error) {
      console.error('Rephrase error:', error);
      new Notification({ 
        title: 'Error', 
        body: 'Failed to rephrase text: ' + error.message 
      }).show();
    }
  });
}

app.on('ready', () => {
  console.log('App is ready. Setting up components...');
  // Create tray first to ensure it's available immediately
  createTray();
  createWindow();
  registerGrammarShortcut();
  registerRephraseShortcut();
  setupSettingsHandlers();
  setupIpcHandlers();
  console.log('Setup complete.');
  
  // Hide dock icon on macOS to make app appear more like a background service
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

function setupIpcHandlers() {
  console.log('Setting up IPC handlers...');
  
  // Get selected text
  ipcMain.handle('get-selected-text', async () => {
    console.log('Handling get-selected-text request');
    return await textService.getSelectedText();
  });

  // Replace selected text
  ipcMain.handle('replace-selected-text', async (event, text) => {
    console.log('Handling replace-selected-text request');
    return await textService.replaceSelectedText(text);
  });

  // Check grammar
  ipcMain.handle('check-grammar', async (event, text) => {
    console.log('Handling check-grammar request');
    return await textService.checkGrammar(text);
  });

  // Rephrase text
  ipcMain.handle('rephrase-text', async (event, text) => {
    console.log('Handling rephrase-text request');
    return await textService.rephraseText(text);
  });

  // Show notification
  ipcMain.handle('show-notification', (event, { title, message }) => {
    console.log(`Showing notification: ${title} - ${message}`);
    new Notification({ title, body: message }).show();
    return { success: true };
  });

  // Test functionality
  ipcMain.handle('test-functionality', async (event, { type, text }) => {
    console.log(`Testing ${type} functionality with text: ${text.substring(0, 30)}...`);
    try {
      let result;
      switch (type) {
        case 'grammar':
          result = await textService.checkGrammar(text);
          break;
        case 'rephrase':
          result = await textService.rephraseText(text);
          break;
        default:
          throw new Error('Invalid test type');
      }
      console.log('Test completed successfully');
      return { success: true, result };
    } catch (error) {
      console.error('Test failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Navigate to test page
  ipcMain.handle('navigate-to-test', () => {
    mainWindow.show();
    mainWindow.loadFile('test-permissions.html');
    return true;
  });
}

// Before the app quits
app.on('before-quit', () => {
  app.isQuitting = true;
});

// Modify window-all-closed to keep app running even when all windows are closed
app.on('window-all-closed', () => {
  console.log('All windows closed');
  // Don't quit the app when all windows are closed
  // This allows the app to run as a background service
  // The user can still quit through the tray menu
});

app.on('activate', () => {
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Unregister shortcuts when app is quitting
app.on('will-quit', () => {
  console.log('App will quit. Unregistering shortcuts...');
  globalShortcut.unregisterAll();
}); 