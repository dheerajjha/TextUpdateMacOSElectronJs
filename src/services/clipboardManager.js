const { clipboard } = require('electron');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ClipboardManager {
  constructor() {
    this.platform = process.platform;
  }

  async getSelectedText() {
    console.log('🔍 Getting selected text for platform:', this.platform);

    const text = await (async () => {
      switch (this.platform) {
        case 'darwin':
          return this.getSelectedTextMacOS();
        case 'win32':
          return this.getSelectedTextWindows();
        default:
          return this.getSelectedTextLinux();
      }
    })();

    if (text && text.trim()) {
      console.log('✓ Captured', text.length, 'characters');
    } else {
      console.log('⚠️ No text captured - make sure text is selected!');
    }

    return text;
  }

  async getSelectedTextMacOS() {
    try {
      // Save original clipboard
      const originalClipboard = clipboard.readText();

      // Clear clipboard so we can detect if copy worked
      clipboard.writeText('');

      // Wait a bit for clipboard to clear
      await new Promise(resolve => setTimeout(resolve, 50));

      // Copy selected text using AppleScript
      const script = `
        tell application "System Events"
          keystroke "c" using command down
        end tell
      `;

      await execAsync(`osascript -e '${script}'`);

      // Wait for clipboard to update (increased time)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get the copied text
      const selectedText = clipboard.readText();

      console.log('Selected text captured:', selectedText.substring(0, 50) + '...');

      // Restore original clipboard (but only after a delay)
      setTimeout(() => {
        clipboard.writeText(originalClipboard);
      }, 500);

      // Return empty string if nothing was copied
      if (!selectedText || selectedText === '') {
        console.log('No text was copied to clipboard');
        return '';
      }

      return selectedText;
    } catch (error) {
      console.error('Error getting selected text:', error);
      return '';
    }
  }

  async getSelectedTextWindows() {
    try {
      // Save original clipboard
      const originalClipboard = clipboard.readText();

      // Clear and copy
      clipboard.writeText('');
      await new Promise(resolve => setTimeout(resolve, 50));

      const script = `
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.SendKeys]::SendWait("^c")
      `;

      await execAsync('powershell -command "' + script + '"');

      // Wait for clipboard
      await new Promise(resolve => setTimeout(resolve, 300));

      const selectedText = clipboard.readText();

      // Restore clipboard
      setTimeout(() => {
        clipboard.writeText(originalClipboard);
      }, 500);

      if (!selectedText || selectedText === '') {
        console.log('No text was copied to clipboard');
        return '';
      }

      return selectedText;
    } catch (error) {
      console.error('Error getting selected text:', error);
      return '';
    }
  }

  async getSelectedTextLinux() {
    try {
      const { stdout } = await execAsync('xclip -o -selection primary');
      return stdout.trim();
    } catch (error) {
      console.error('Error getting selected text:', error);
      return '';
    }
  }

  async replaceSelectedText(newText) {
    console.log('Replacing selected text, length:', newText.length);
    
    switch (this.platform) {
      case 'darwin':
        return this.replaceSelectedTextMacOS(newText);
      case 'win32':
        return this.replaceSelectedTextWindows(newText);
      default:
        return this.replaceSelectedTextLinux(newText);
    }
  }

  async replaceSelectedTextMacOS(newText) {
    try {
      const originalClipboard = clipboard.readText();

      // Put new text in clipboard
      clipboard.writeText(newText);

      // Wait for clipboard to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paste it
      const script = `
        tell application "System Events"
          keystroke "v" using command down
        end tell
      `;

      await execAsync(`osascript -e '${script}'`);

      // Wait for paste to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Restore original clipboard
      clipboard.writeText(originalClipboard);

      console.log('✓ Text replaced successfully');
      return true;
    } catch (error) {
      console.error('Error replacing text:', error);
      return false;
    }
  }

  async replaceSelectedTextWindows(newText) {
    try {
      const originalClipboard = clipboard.readText();
      clipboard.writeText(newText);

      const script = `
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.SendKeys]::SendWait("^v")
      `;
      await execAsync('powershell -command &{' + script + '}');

      await new Promise(resolve => setTimeout(resolve, 100));
      clipboard.writeText(originalClipboard);

      return true;
    } catch (error) {
      console.error('Error replacing text:', error);
      return false;
    }
  }

  async replaceSelectedTextLinux(newText) {
    try {
      const originalClipboard = clipboard.readText();
      clipboard.writeText(newText);

      await execAsync('xdotool key ctrl+v');

      await new Promise(resolve => setTimeout(resolve, 100));
      clipboard.writeText(originalClipboard);

      return true;
    } catch (error) {
      console.error('Error replacing text:', error);
      return false;
    }
  }
}

module.exports = new ClipboardManager(); 