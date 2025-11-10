const { contextBridge, ipcRenderer } = require('electron');

// Expose limited APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Event listeners for menu bar actions
  onShowSettings: (callback) => {
    ipcRenderer.on('show-settings', () => callback());
    return () => ipcRenderer.removeListener('show-settings', callback);
  },

  onShowHistory: (callback) => {
    ipcRenderer.on('show-history', () => callback());
    return () => ipcRenderer.removeListener('show-history', callback);
  },

  onShowStats: (callback) => {
    ipcRenderer.on('show-stats', () => callback());
    return () => ipcRenderer.removeListener('show-stats', callback);
  }
}); 