const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

class TrayManager {
  constructor(app, mainWindow) {
    this.app = app;
    this.mainWindow = mainWindow;
    this.tray = null;
    this.createTray();
  }

  createTray() {
    console.log('Creating tray icon...');
    const iconPath = path.join(__dirname, '../../assets/Texty.png');

    try {
      if (fs.existsSync(iconPath)) {
        console.log('Icon file exists at:', iconPath);
        
        // Create tray icon
        const trayIcon = process.platform === 'darwin'
          ? nativeImage.createFromPath(iconPath)
          : nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

        this.tray = new Tray(trayIcon);
        this.tray.setToolTip('Text Update App');

        // Create context menu
        this.updateContextMenu();

        // Handle double click
        this.tray.on('double-click', () => {
          if (!this.mainWindow) return;
          
          if (this.mainWindow.isVisible()) {
            this.mainWindow.hide();
          } else {
            this.mainWindow.show();
          }
        });

        console.log('Tray setup complete');
      } else {
        console.error('Icon file not found at:', iconPath);
      }
    } catch (error) {
      console.error('Error creating tray:', error);
    }
  }

  updateContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          if (!this.mainWindow) return;
          this.mainWindow.show();
        }
      },
      { type: 'separator' },
      {
        label: 'Grammar Check',
        accelerator: 'CommandOrControl+Shift+G',
        type: 'checkbox',
        checked: true
      },
      {
        label: 'Rephrase',
        accelerator: 'CommandOrControl+Shift+R',
        type: 'checkbox',
        checked: true
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => {
          if (!this.mainWindow) return;
          this.mainWindow.show();
          this.mainWindow.webContents.send('show-settings');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => this.app.quit()
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

module.exports = TrayManager; 