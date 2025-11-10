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

      // Use a unique marker to detect if copy worked
      const marker = `__CLIPBOARD_MARKER_${Date.now()}__`;
      clipboard.writeText(marker);

      // Wait for clipboard to be set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Copy selected text using AppleScript
      const script = `tell application "System Events" to keystroke "c" using command down`;
      await execAsync(`osascript -e '${script}'`);

      // Wait for clipboard to update - give it more time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the copied text
      const selectedText = clipboard.readText();

      // Check if clipboard changed from our marker
      if (!selectedText || selectedText === marker || selectedText === '') {
        console.log('⚠️ No text was copied - clipboard unchanged');
        // Restore immediately if nothing was selected
        clipboard.writeText(originalClipboard);
        return '';
      }

      console.log('✓ Captured:', selectedText.length, 'chars');

      // Restore original clipboard after a delay
      setTimeout(() => {
        clipboard.writeText(originalClipboard);
      }, 1000);

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

      // Use a unique marker to detect if copy worked
      const marker = `__CLIPBOARD_MARKER_${Date.now()}__`;
      clipboard.writeText(marker);
      await new Promise(resolve => setTimeout(resolve, 100));

      const script = `
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.SendKeys]::SendWait("^c")
      `;

      await execAsync('powershell -command "' + script + '"');

      // Wait for clipboard to update
      await new Promise(resolve => setTimeout(resolve, 500));

      const selectedText = clipboard.readText();

      // Check if clipboard changed from our marker
      if (!selectedText || selectedText === marker || selectedText === '') {
        console.log('⚠️ No text was copied - clipboard unchanged');
        clipboard.writeText(originalClipboard);
        return '';
      }

      console.log('✓ Captured:', selectedText.length, 'chars');

      setTimeout(() => {
        clipboard.writeText(originalClipboard);
      }, 1000);

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