const { app, BrowserWindow, globalShortcut, Notification, ipcMain } = require('electron');
const path = require('path');
const TrayManager = require('./trayManager');
const AutoUpdater = require('./autoUpdater');
const clipboardManager = require('../services/clipboardManager');
const openaiService = require('../services/openaiService');
const config = require('../config/config');

class MainProcess {
  constructor() {
    this.mainWindow = null;
    this.trayManager = null;
    this.autoUpdater = null;
    this.textHistory = [];
    this.pendingChange = null;

    // Bind methods
    this.createWindow = this.createWindow.bind(this);
    this.setupShortcuts = this.setupShortcuts.bind(this);
    this.setupIpcHandlers = this.setupIpcHandlers.bind(this);
    this.handleGrammarCheck = this.handleGrammarCheck.bind(this);
    this.handleRephrase = this.handleRephrase.bind(this);
    this.handleSummarize = this.handleSummarize.bind(this);
    this.handleTranslate = this.handleTranslate.bind(this);
  }

  async init() {
    await app.whenReady();

    this.createWindow();
    this.trayManager = new TrayManager(app, this.mainWindow);
    this.autoUpdater = new AutoUpdater(this.mainWindow);
    this.setupShortcuts();
    this.setupIpcHandlers();

    // Hide dock icon on macOS
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    app.on('window-all-closed', () => {
      // Keep the app running in the background
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      show: !config.appSettings.startMinimized
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    
    // Show DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
  }

  setupIpcHandlers() {
    ipcMain.handle('get-settings', () => {
      return {
        ...config.openAIConfig,
        ...config.appSettings
      };
    });

    ipcMain.handle('save-settings', (_, settings) => {
      config.saveSettings(settings);

      // Reinitialize the OpenAI service with new settings
      openaiService.initializeOpenAI();
    });

    ipcMain.handle('reset-settings', () => {
      config.resetSettings();
    });

    ipcMain.handle('apply-text-change', async (_, text) => {
      if (this.pendingChange) {
        await clipboardManager.replaceSelectedText(text);

        // Add to history
        this.addToHistory({
          type: this.pendingChange.type,
          original: this.pendingChange.original,
          modified: text,
          timestamp: new Date().toISOString()
        });

        this.pendingChange = null;
        return true;
      }
      return false;
    });

    ipcMain.handle('get-history', () => {
      return this.textHistory;
    });

    ipcMain.handle('clear-history', () => {
      this.textHistory = [];
      return true;
    });
  }

  addToHistory(entry) {
    this.textHistory.unshift(entry);
    // Keep only last 50 entries
    if (this.textHistory.length > 50) {
      this.textHistory = this.textHistory.slice(0, 50);
    }
  }

  setupShortcuts() {
    const shortcuts = config.appSettings.shortcuts;

    globalShortcut.register(shortcuts.grammar, this.handleGrammarCheck);
    globalShortcut.register(shortcuts.rephrase, this.handleRephrase);
    globalShortcut.register(shortcuts.summarize, this.handleSummarize);
    globalShortcut.register(shortcuts.translate, this.handleTranslate);

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }

  async handleGrammarCheck() {
    const startTime = Date.now();
    try {
      this.mainWindow.webContents.send('processing-start', 'grammar');
      this.showNotification('Grammar Check', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Grammar Check', 'No text selected');
        this.mainWindow.webContents.send('processing-end');
        return;
      }

      this.showNotification('Grammar Check', 'Checking grammar...');
      const correctedText = await openaiService.checkGrammar(text);
      const responseTime = Date.now() - startTime;

      // Store pending change and show preview
      this.pendingChange = {
        type: 'grammar',
        original: text,
        modified: correctedText
      };

      this.mainWindow.webContents.send('show-preview', {
        type: 'grammar',
        original: text,
        modified: correctedText,
        responseTime
      });

      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Grammar Check', 'Review changes in the preview');
    } catch (error) {
      console.error('Grammar check error:', error);
      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Error', 'Failed to check grammar: ' + error.message);
    }
  }

  async handleRephrase() {
    const startTime = Date.now();
    try {
      this.mainWindow.webContents.send('processing-start', 'rephrase');
      this.showNotification('Rephrase', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Rephrase', 'No text selected');
        this.mainWindow.webContents.send('processing-end');
        return;
      }

      this.showNotification('Rephrase', 'Rephrasing text...');
      const rephrasedText = await openaiService.rephraseText(text);
      const responseTime = Date.now() - startTime;

      // Store pending change and show preview
      this.pendingChange = {
        type: 'rephrase',
        original: text,
        modified: rephrasedText
      };

      this.mainWindow.webContents.send('show-preview', {
        type: 'rephrase',
        original: text,
        modified: rephrasedText,
        responseTime
      });

      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Rephrase', 'Review changes in the preview');
    } catch (error) {
      console.error('Rephrase error:', error);
      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Error', 'Failed to rephrase text: ' + error.message);
    }
  }

  async handleSummarize() {
    const startTime = Date.now();
    try {
      this.mainWindow.webContents.send('processing-start', 'summarize');
      this.showNotification('Summarize', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Summarize', 'No text selected');
        this.mainWindow.webContents.send('processing-end');
        return;
      }

      this.showNotification('Summarize', 'Summarizing text...');
      const summarizedText = await openaiService.summarizeText(text);
      const responseTime = Date.now() - startTime;

      // Store pending change and show preview
      this.pendingChange = {
        type: 'summarize',
        original: text,
        modified: summarizedText
      };

      this.mainWindow.webContents.send('show-preview', {
        type: 'summarize',
        original: text,
        modified: summarizedText,
        responseTime
      });

      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Summarize', 'Review changes in the preview');
    } catch (error) {
      console.error('Summarize error:', error);
      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Error', 'Failed to summarize text: ' + error.message);
    }
  }

  async handleTranslate() {
    const startTime = Date.now();
    try {
      this.mainWindow.webContents.send('processing-start', 'translate');
      this.showNotification('Translate', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Translate', 'No text selected');
        this.mainWindow.webContents.send('processing-end');
        return;
      }

      this.showNotification('Translate', 'Translating text...');
      const translatedText = await openaiService.translateText(text);
      const responseTime = Date.now() - startTime;

      // Store pending change and show preview
      this.pendingChange = {
        type: 'translate',
        original: text,
        modified: translatedText
      };

      this.mainWindow.webContents.send('show-preview', {
        type: 'translate',
        original: text,
        modified: translatedText,
        responseTime
      });

      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Translate', 'Review changes in the preview');
    } catch (error) {
      console.error('Translate error:', error);
      this.mainWindow.webContents.send('processing-end');
      this.showNotification('Error', 'Failed to translate text: ' + error.message);
    }
  }

  showNotification(title, body) {
    if (config.appSettings.showNotifications) {
      new Notification({ title, body }).show();
    }
  }
}

// Start the application
const mainProcess = new MainProcess();
mainProcess.init().catch(console.error); 