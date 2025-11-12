const Store = require('electron-store');
const store = new Store();

class ConfigManager {
  constructor() {
    this.store = store;
  }

  // App Settings
  get appSettings() {
    return {
      shortcuts: {
        grammar: this.store.get('shortcuts.grammar', 'CommandOrControl+Shift+G'),
        rephrase: this.store.get('shortcuts.rephrase', 'CommandOrControl+Shift+R'),
        summarize: this.store.get('shortcuts.summarize', 'CommandOrControl+Shift+S'),
        translate: this.store.get('shortcuts.translate', 'CommandOrControl+Shift+T')
      },
      showNotifications: this.store.get('showNotifications', true),
      startMinimized: this.store.get('startMinimized', false)
    };
  }

  // Save settings
  saveSettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      this.store.set(key, value);
    });
  }

  // Reset settings
  resetSettings() {
    this.store.clear();
  }
}

module.exports = new ConfigManager(); 