const { clipboard } = require('electron');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ClipboardManager {
  constructor() {
    this.platform = process.platform;
  }

  async getSelectedText() {
    console.log('Getting selected text for platform:', this.platform);
    
    switch (this.platform) {
      case 'darwin':
        return this.getSelectedTextMacOS();
      case 'win32':
        return this.getSelectedTextWindows();
      default:
        return this.getSelectedTextLinux();
    }
  }

  async getSelectedTextMacOS() {
    try {
      const originalClipboard = clipboard.readText();
      console.log('Original clipboard length:', originalClipboard.length);

      const script = `
        tell application "System Events"
          set activeApp to name of first application process whose frontmost is true
          log "Active app: " & activeApp
        end tell

        -- Store original clipboard
        set originalContent to (the clipboard as text)
        
        -- Clear clipboard
        set the clipboard to ""
        delay 0.1
        
        -- Copy selected text
        tell application "System Events"
          keystroke "c" using command down
        end tell
        
        -- Wait for clipboard
        delay 0.2
        
        -- Get selected text
        set selectedText to (the clipboard as text)
        
        -- Restore clipboard
        set the clipboard to originalContent
        
        -- Return selected text
        return selectedText`;

      const { stdout, stderr } = await execAsync(`osascript -e '${script}'`);
      if (stderr) console.error('AppleScript error:', stderr);

      // Ensure original clipboard is restored
      await new Promise(resolve => setTimeout(resolve, 100));
      clipboard.writeText(originalClipboard);

      return stdout.trim();
    } catch (error) {
      console.error('Error getting selected text:', error);
      return '';
    }
  }

  async getSelectedTextWindows() {
    try {
      const script = `
        Add-Type -AssemblyName System.Windows.Forms
        $originalClipboard = Get-Clipboard
        [System.Windows.Forms.SendKeys]::SendWait("^c")
        Start-Sleep -Milliseconds 100
        $selectedText = Get-Clipboard
        Set-Clipboard -Value $originalClipboard
        return $selectedText
      `;
      const { stdout } = await execAsync('powershell -command &{' + script + '}');
      return stdout.trim();
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

      const script = `
        tell application "System Events"
          set frontApp to first application process whose frontmost is true
          
          -- Store original clipboard
          set originalContent to (the clipboard as text)
          
          -- Paste new text
          keystroke "v" using command down
          delay 0.2
        end tell`;

      // Set new text and wait
      clipboard.writeText(newText);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Execute paste
      await execAsync(`osascript -e '${script}'`);

      // Restore clipboard
      await new Promise(resolve => setTimeout(resolve, 200));
      clipboard.writeText(originalClipboard);

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