const { contextBridge, ipcRenderer } = require('electron');

// Expose limited APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),

  // Text operations
  applyTextChange: (text) => ipcRenderer.invoke('apply-text-change', text),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Event listeners
  onShowSettings: (callback) => {
    ipcRenderer.on('show-settings', () => callback());
    return () => ipcRenderer.removeListener('show-settings', callback);
  },

  onShowPreview: (callback) => {
    ipcRenderer.on('show-preview', (_, data) => callback(data));
    return () => ipcRenderer.removeListener('show-preview', callback);
  },

  onProcessingStart: (callback) => {
    ipcRenderer.on('processing-start', (_, type) => callback(type));
    return () => ipcRenderer.removeListener('processing-start', callback);
  },

  onProcessingEnd: (callback) => {
    ipcRenderer.on('processing-end', () => callback());
    return () => ipcRenderer.removeListener('processing-end', callback);
  }
}); 