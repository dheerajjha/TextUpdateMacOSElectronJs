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
      openaiService.initializeOpenAI();
    });

    ipcMain.handle('reset-settings', () => {
      config.resetSettings();
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
    try {
      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('✨ Grammar Check', 'No text selected');
        return;
      }

      this.showNotification('✨ Grammar Check', 'Working magic...');
      const correctedText = await openaiService.checkGrammar(text);

      // Instantly replace!
      await clipboardManager.replaceSelectedText(correctedText);

      // Add to history
      this.addToHistory({
        type: 'grammar',
        original: text,
        modified: correctedText,
        timestamp: new Date().toISOString()
      });

      this.showNotification('✓ Grammar Check', 'Done!');
    } catch (error) {
      console.error('Grammar check error:', error);
      this.showNotification('Grammar Check', 'Oops, something went wrong');
    }
  }

  async handleRephrase() {
    try {
      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('✨ Rephrase', 'No text selected');
        return;
      }

      this.showNotification('✨ Rephrase', 'Making it better...');
      const rephrasedText = await openaiService.rephraseText(text);

      // Instantly replace!
      await clipboardManager.replaceSelectedText(rephrasedText);

      // Add to history
      this.addToHistory({
        type: 'rephrase',
        original: text,
        modified: rephrasedText,
        timestamp: new Date().toISOString()
      });

      this.showNotification('✓ Rephrase', 'Done!');
    } catch (error) {
      console.error('Rephrase error:', error);
      this.showNotification('Rephrase', 'Oops, something went wrong');
    }
  }

  async handleSummarize() {
    try {
      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('✨ Summarize', 'No text selected');
        return;
      }

      this.showNotification('✨ Summarize', 'Condensing...');
      const summarizedText = await openaiService.summarizeText(text);

      // Instantly replace!
      await clipboardManager.replaceSelectedText(summarizedText);

      // Add to history
      this.addToHistory({
        type: 'summarize',
        original: text,
        modified: summarizedText,
        timestamp: new Date().toISOString()
      });

      this.showNotification('✓ Summarize', 'Done!');
    } catch (error) {
      console.error('Summarize error:', error);
      this.showNotification('Summarize', 'Oops, something went wrong');
    }
  }

  async handleTranslate() {
    try {
      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('✨ Translate', 'No text selected');
        return;
      }

      this.showNotification('✨ Translate', 'Translating...');
      const translatedText = await openaiService.translateText(text);

      // Instantly replace!
      await clipboardManager.replaceSelectedText(translatedText);

      // Add to history
      this.addToHistory({
        type: 'translate',
        original: text,
        modified: translatedText,
        timestamp: new Date().toISOString()
      });

      this.showNotification('✓ Translate', 'Done!');
    } catch (error) {
      console.error('Translate error:', error);
      this.showNotification('Translate', 'Oops, something went wrong');
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