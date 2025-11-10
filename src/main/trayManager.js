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
    const iconPath = path.join(__dirname, '../../assets/Texty.png');

    try {
      if (fs.existsSync(iconPath)) {
        // Create tray icon - properly sized for macOS menu bar
        let trayIcon = nativeImage.createFromPath(iconPath);

        if (process.platform === 'darwin') {
          // macOS menu bar needs 16x16 or 22x22 template image
          trayIcon = trayIcon.resize({ width: 22, height: 22 });
          trayIcon.setTemplateImage(true); // Makes it adapt to light/dark mode
        } else {
          trayIcon = trayIcon.resize({ width: 16, height: 16 });
        }

        this.tray = new Tray(trayIcon);
        this.tray.setToolTip('✨ Text Update - Ready to go!');

        // Create context menu
        this.updateContextMenu();

        // Handle click - show app on single click (macOS menu bar style)
        this.tray.on('click', () => {
          if (!this.mainWindow) return;

          if (this.mainWindow.isVisible()) {
            this.mainWindow.hide();
          } else {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        });

        console.log('✓ Tray icon ready in menu bar');
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
        label: '✨ Text Update',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Show Dashboard',
        click: () => {
          if (!this.mainWindow) return;
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      },
      { type: 'separator' },
      {
        label: '📝 View History',
        click: () => {
          if (!this.mainWindow) return;
          this.mainWindow.show();
          this.mainWindow.focus();
          this.mainWindow.webContents.send('show-history');
        }
      },
      {
        label: '📊 Usage Stats',
        click: () => {
          if (!this.mainWindow) return;
          this.mainWindow.show();
          this.mainWindow.focus();
          this.mainWindow.webContents.send('show-stats');
        }
      },
      { type: 'separator' },
      {
        label: 'Quick Actions:',
        enabled: false
      },
      {
        label: '  Grammar Check (⌘⇧G)',
        enabled: false
      },
      {
        label: '  Rephrase (⌘⇧R)',
        enabled: false
      },
      {
        label: '  Summarize (⌘⇧S)',
        enabled: false
      },
      {
        label: '  Translate (⌘⇧T)',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => {
          if (!this.mainWindow) return;
          this.mainWindow.show();
          this.mainWindow.focus();
          this.mainWindow.webContents.send('show-settings');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Text Update',
        accelerator: 'CommandOrControl+Q',
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