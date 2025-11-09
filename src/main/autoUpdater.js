const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    // Configure auto updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates on startup (after 3 seconds)
    setTimeout(() => {
      this.checkForUpdates();
    }, 3000);

    // Check for updates every 6 hours
    setInterval(() => {
      this.checkForUpdates();
    }, 6 * 60 * 60 * 1000);

    // Auto updater events
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      this.showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No updates available');
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto updater error:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
      console.log(message);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info.version);
      this.showUpdateDownloadedDialog();
    });
  }

  checkForUpdates() {
    // Only check for updates in production
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdates().catch((err) => {
        console.error('Error checking for updates:', err);
      });
    }
  }

  showUpdateAvailableDialog(info) {
    if (!this.mainWindow) return;

    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: 'Would you like to download and install it now?',
      buttons: ['Download', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  }

  showUpdateDownloadedDialog() {
    if (!this.mainWindow) return;

    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully!',
      detail: 'The update will be installed when you restart the application.',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
}

module.exports = AutoUpdater;
