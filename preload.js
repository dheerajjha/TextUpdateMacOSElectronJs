const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Shortcut handling
  onShortcutTriggered: (callback) => {
    ipcRenderer.on('shortcut-triggered', (event, type) => {
      callback(type);
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
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // Navigation
  navigateToTest: () => ipcRenderer.invoke('navigate-to-test'),
  
  // Error handling
  onError: (callback) => {
    ipcRenderer.on('error', (event, error) => {
      callback(error);
    });
  }
}); 