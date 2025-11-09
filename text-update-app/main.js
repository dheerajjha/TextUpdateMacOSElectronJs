const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, Notification } = require('electron');
const path = require('path');
const { setupSettingsHandlers } = require('./services/settingsService');
const { TextService } = require('./services/textService');

let mainWindow;
const textService = new TextService();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Text Update App',
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  setupGlobalShortcuts();
  setupSettingsHandlers();
  setupIpcHandlers();
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

function setupIpcHandlers() {
  // Get selected text
  ipcMain.handle('get-selected-text', async () => {
    return await textService.getSelectedText();
  });

  // Replace selected text
  ipcMain.handle('replace-selected-text', async (event, text) => {
    return await textService.replaceSelectedText(text);
  });

  // Check grammar
  ipcMain.handle('check-grammar', async (event, text) => {
    return await textService.checkGrammar(text);
  });

  // Rephrase text
  ipcMain.handle('rephrase-text', async (event, text) => {
    return await textService.rephraseText(text);
  });

  // Show notification
  ipcMain.handle('show-notification', (event, { title, message }) => {
    new Notification({ title, body: message }).show();
    return { success: true };
  });

  // Test functionality
  ipcMain.handle('test-functionality', async (event, { type, text }) => {
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
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
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

// Unregister shortcuts when app is quitting
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
}); 