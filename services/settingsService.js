const { ipcMain } = require('electron');
const Store = require('electron-store');

const store = new Store();

function setupSettingsHandlers() {
  // Get current settings
  ipcMain.handle('get-settings', () => {
    return {
      useAzure: store.get('useAzure', true), // Default to Azure OpenAI
      openaiApiKey: store.get('openaiApiKey', ''),
      azureEndpoint: store.get('azureEndpoint', 'init.openai.azure.com'),
      azureApiKey: store.get('azureApiKey', ''),
      azureDeployment: store.get('azureDeployment', 'gpt-4o'),
      azureApiVersion: store.get('azureApiVersion', '2025-01-01-preview'),
      shortcuts: {
        grammarCheck: store.get('shortcuts.grammarCheck', 'CommandOrControl+Shift+G'),
        rephrase: store.get('shortcuts.rephrase', 'CommandOrControl+Shift+R')
      }
    };
  });

  // Save settings
  ipcMain.handle('save-settings', (event, settings) => {
    try {
      store.set('useAzure', settings.useAzure);
      store.set('openaiApiKey', settings.openaiApiKey);
      store.set('azureEndpoint', settings.azureEndpoint);
      store.set('azureApiKey', settings.azureApiKey);
      store.set('azureDeployment', settings.azureDeployment);
      store.set('azureApiVersion', settings.azureApiVersion);
      
      // Save shortcuts if provided
      if (settings.shortcuts) {
        store.set('shortcuts.grammarCheck', settings.shortcuts.grammarCheck);
        store.set('shortcuts.rephrase', settings.shortcuts.rephrase);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Reset settings to defaults
  ipcMain.handle('reset-settings', () => {
    try {
      store.clear();
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupSettingsHandlers }; 