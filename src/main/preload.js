const { contextBridge, ipcRenderer } = require('electron');

// Expose limited APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  restartApp: () => ipcRenderer.invoke('restart-app'),

  // Event listeners
  onShowSettings: (callback) => {
    ipcRenderer.on('show-settings', () => callback());
    return () => ipcRenderer.removeListener('show-settings', callback);
  },

  // Stats tracking
  onTrackStats: (callback) => {
    ipcRenderer.on('track-stats', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('track-stats');
  }
}); 