const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Shortcut handling
  onShortcutTriggered: (callback) => {
    ipcRenderer.on('shortcut-triggered', (event, shortcut) => {
      callback(shortcut);
    });
  },
  
  // Text operations
  getSelectedText: () => ipcRenderer.invoke('get-selected-text'),
  replaceSelectedText: (text) => ipcRenderer.invoke('replace-selected-text', text),
  checkGrammar: (text) => ipcRenderer.invoke('check-grammar', text),
  rephraseText: (text) => ipcRenderer.invoke('rephrase-text', text),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  
  // Notifications
  showNotification: (title, message) => ipcRenderer.invoke('show-notification', { title, message }),
  
  // Error handling
  onError: (callback) => {
    ipcRenderer.on('error', (event, error) => {
      callback(error);
    });
  },
  
  // Test functionality
  testFunctionality: (type, text) => ipcRenderer.invoke('test-functionality', { type, text })
}); 