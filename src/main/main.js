const { app, BrowserWindow, globalShortcut, Notification, ipcMain } = require('electron');
const path = require('path');
const TrayManager = require('./trayManager');
const clipboardManager = require('../services/clipboardManager');
const openaiService = require('../services/openaiService');
const config = require('../config/config');

class MainProcess {
  constructor() {
    this.mainWindow = null;
    this.trayManager = null;
    
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
      title: 'Grammar Ji',
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
      return config.appSettings;
    });

    ipcMain.handle('save-settings', (_, settings) => {
      config.saveSettings(settings);
    });

    ipcMain.handle('reset-settings', () => {
      config.resetSettings();
    });

    ipcMain.handle('restart-app', () => {
      app.relaunch();
      app.quit();
    });
  }

  trackUsage(type, wordCount, responseTime, originalText, modifiedText) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('track-stats', {
        type,
        wordCount,
        responseTime,
        originalText,
        modifiedText,
        timestamp: Date.now()
      });
    }
  }

  setupShortcuts() {
    const { features, shortcuts } = config.appSettings;

    // Only register shortcuts for enabled features
    if (features.grammar && shortcuts.grammar) {
      const registered = globalShortcut.register(shortcuts.grammar, this.handleGrammarCheck);
      console.log('Grammar shortcut registered:', registered, shortcuts.grammar);
    }

    if (features.rephrase && shortcuts.rephrase) {
      const registered = globalShortcut.register(shortcuts.rephrase, this.handleRephrase);
      console.log('Rephrase shortcut registered:', registered, shortcuts.rephrase);
    }

    if (features.summarize && shortcuts.summarize) {
      const registered = globalShortcut.register(shortcuts.summarize, this.handleSummarize);
      console.log('Summarize shortcut registered:', registered, shortcuts.summarize);
    }

    if (features.translate && shortcuts.translate) {
      const registered = globalShortcut.register(shortcuts.translate, this.handleTranslate);
      console.log('Translate shortcut registered:', registered, shortcuts.translate);
    }

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }

  async handleGrammarCheck() {
    try {
      this.showNotification('Grammar Check', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Grammar Check', 'No text selected');
        return;
      }

      this.showNotification('Grammar Check', 'Checking grammar...');
      const startTime = Date.now();
      const correctedText = await openaiService.checkGrammar(text);
      const responseTime = Date.now() - startTime;

      await clipboardManager.replaceSelectedText(correctedText);

      // Track stats
      const wordCount = text.trim().split(/\s+/).length;
      this.trackUsage('grammar', wordCount, responseTime, text, correctedText);

      this.showNotification('Grammar Check', 'Text has been corrected');
    } catch (error) {
      console.error('Grammar check error:', error);
      this.showNotification('Error', 'Failed to check grammar: ' + error.message);
    }
  }

  async handleRephrase() {
    try {
      this.showNotification('Rephrase', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Rephrase', 'No text selected');
        return;
      }

      this.showNotification('Rephrase', 'Rephrasing text...');
      const startTime = Date.now();
      const rephrasedText = await openaiService.rephraseText(text);
      const responseTime = Date.now() - startTime;

      await clipboardManager.replaceSelectedText(rephrasedText);

      // Track stats
      const wordCount = text.trim().split(/\s+/).length;
      this.trackUsage('rephrase', wordCount, responseTime, text, rephrasedText);

      this.showNotification('Rephrase', 'Text has been rephrased');
    } catch (error) {
      console.error('Rephrase error:', error);
      this.showNotification('Error', 'Failed to rephrase text: ' + error.message);
    }
  }

  async handleSummarize() {
    try {
      this.showNotification('Summarize', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Summarize', 'No text selected');
        return;
      }

      this.showNotification('Summarize', 'Summarizing text...');
      const startTime = Date.now();
      const summarizedText = await openaiService.summarizeText(text);
      const responseTime = Date.now() - startTime;

      await clipboardManager.replaceSelectedText(summarizedText);

      // Track stats
      const wordCount = text.trim().split(/\s+/).length;
      this.trackUsage('summarize', wordCount, responseTime, text, summarizedText);

      this.showNotification('Summarize', 'Text has been summarized');
    } catch (error) {
      console.error('Summarize error:', error);
      this.showNotification('Error', 'Failed to summarize text: ' + error.message);
    }
  }

  async handleTranslate() {
    try {
      this.showNotification('Translate', 'Getting selected text...');

      const text = await clipboardManager.getSelectedText();
      if (!text.trim()) {
        this.showNotification('Translate', 'No text selected');
        return;
      }

      this.showNotification('Translate', 'Translating text...');
      const startTime = Date.now();
      const translatedText = await openaiService.translateText(text);
      const responseTime = Date.now() - startTime;

      await clipboardManager.replaceSelectedText(translatedText);

      // Track stats
      const wordCount = text.trim().split(/\s+/).length;
      this.trackUsage('translate', wordCount, responseTime, text, translatedText);

      this.showNotification('Translate', 'Text has been translated');
    } catch (error) {
      console.error('Translate error:', error);
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