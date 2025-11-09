const { clipboard } = require('electron');
const { OpenAI } = require('openai');
const Store = require('electron-store');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const os = require('os');

console.log('Initializing TextService module');
const store = new Store();

class TextService {
  constructor() {
    console.log('TextService constructor called');
    // Check if using Azure OpenAI or standard OpenAI
    const useAzure = store.get('useAzure', true); // Default to Azure OpenAI
    console.log(`Using Azure OpenAI: ${useAzure}`);
    
    if (useAzure) {
      // Azure OpenAI configuration
      const azureEndpoint = store.get('azureEndpoint', 'init.openai.azure.com');
      const azureDeployment = store.get('azureDeployment', 'gpt-4o');
      const azureApiVersion = store.get('azureApiVersion', '2025-01-01-preview');
      console.log(`Azure config: endpoint=${azureEndpoint}, deployment=${azureDeployment}, apiVersion=${azureApiVersion}`);
      
      this.openai = new OpenAI({
        apiKey: store.get('azureApiKey', ''),
        baseURL: `https://${azureEndpoint}/openai/deployments/${azureDeployment}`,
        apiVersion: azureApiVersion,
        defaultQuery: { 'api-version': azureApiVersion },
        defaultHeaders: {
          'api-key': store.get('azureApiKey', ''),
          'origin': 'https://ai.azure.com',
          'referer': 'https://ai.azure.com/',
          'x-ms-useragent': 'AzureOpenAI.Studio/ai.azure.com'
        },
      });
    } else {
      // Standard OpenAI configuration
      console.log('Using standard OpenAI API');
      this.openai = new OpenAI({
        apiKey: store.get('openaiApiKey'),
      });
    }
    console.log('TextService initialization complete');
  }

  async getSelectedText() {
    console.log('getSelectedText called for platform:', process.platform);
    
    if (process.platform === 'darwin') {
      try {
        // Save the original clipboard content
        const originalClipboard = clipboard.readText();
        console.log('Original clipboard content length:', originalClipboard.length);

        // AppleScript to get selected text with better clipboard handling
        const scriptGetText = `
          tell application "System Events"
            set activeApp to name of first application process whose frontmost is true
            log "Active app: " & activeApp
          end tell

          -- Store original clipboard
          set originalClipboard to (the clipboard)
          
          -- Clear clipboard and wait
          set the clipboard to ""
          delay 0.1
          
          -- Perform copy
          tell application "System Events"
            keystroke "c" using command down
          end tell
          
          -- Wait for clipboard to update
          delay 0.2
          
          -- Get the new content
          set newContent to (the clipboard)
          
          -- Restore original clipboard
          set the clipboard to originalClipboard
          
          -- Return the selected text
          return newContent`;
        
        console.log('Executing AppleScript to get selected text');
        const { stdout, stderr } = await execAsync(`osascript -e '${scriptGetText}'`);
        if (stderr) console.error('AppleScript stderr:', stderr);
        
        // Get the selected text
        const selectedText = stdout.trim();
        console.log('Selected text length:', selectedText.length);
        
        // Double-check clipboard restoration
        await new Promise(resolve => setTimeout(resolve, 100));
        clipboard.writeText(originalClipboard);
        console.log('Restored original clipboard content');
        
        if (selectedText === originalClipboard) {
          console.log('Warning: Selected text matches original clipboard, might be stale');
        }
        
        return selectedText;
      } catch (error) {
        console.error('Error getting selected text:', error);
        return '';
      }
    } else if (process.platform === 'win32') {
      // For Windows, we can try using PowerShell to simulate Ctrl+C and get selected text
      try {
        const script = `
          Add-Type -AssemblyName System.Windows.Forms
          [System.Windows.Forms.SendKeys]::SendWait("^c")
          Start-Sleep -Milliseconds 100
          Get-Clipboard
        `;
        const { stdout } = await execAsync('powershell -command &{' + script + '}');
        return stdout.trim();
      } catch (error) {
        console.error('Error getting selected text:', error);
        return clipboard.readText();
      }
    } else {
      // For Linux, we can try using xclip or xsel
      try {
        const { stdout } = await execAsync('xclip -o -selection primary');
        return stdout.trim();
      } catch (error) {
        console.error('Error getting selected text:', error);
        return clipboard.readText();
      }
    }
  }

  async replaceSelectedText(newText) {
    console.log('replaceSelectedText called with text length:', newText.length);
    
    if (process.platform === 'darwin') {
      try {
        // Save the original clipboard content
        console.log('Saving current clipboard content');
        const originalClipboard = clipboard.readText();
        
        // AppleScript to paste new text
        const scriptPaste = `
          -- Store original clipboard
          set originalClipboard to (the clipboard)
          
          tell application "System Events"
            set frontApp to first application process whose frontmost is true
            log "Pasting in app: " & name of frontApp
            
            -- Perform paste
            keystroke "v" using command down
          end tell
          
          delay 0.2
          
          -- Restore original clipboard
          set the clipboard to originalClipboard`;
        
        // Set the new text in clipboard
        console.log('Writing new text to clipboard');
        clipboard.writeText(newText);
        
        // Wait for clipboard to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Executing AppleScript to paste text');
        const { stdout, stderr } = await execAsync(`osascript -e '${scriptPaste}'`);
        if (stderr) console.error('AppleScript stderr:', stderr);
        
        // Double-check clipboard restoration
        await new Promise(resolve => setTimeout(resolve, 100));
        clipboard.writeText(originalClipboard);
        console.log('Restored original clipboard content');
        
        return true;
      } catch (error) {
        console.error('Error replacing selected text:', error);
        return false;
      }
    } else if (process.platform === 'win32') {
      try {
        const oldClipboard = clipboard.readText();
        clipboard.writeText(newText);
        
        const script = `
          Add-Type -AssemblyName System.Windows.Forms
          [System.Windows.Forms.SendKeys]::SendWait("^v")
        `;
        await execAsync('powershell -command &{' + script + '}');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        clipboard.writeText(oldClipboard);
        
        return true;
      } catch (error) {
        console.error('Error replacing selected text:', error);
        return false;
      }
    } else {
      try {
        const oldClipboard = clipboard.readText();
        clipboard.writeText(newText);
        
        await execAsync('xdotool key ctrl+v');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        clipboard.writeText(oldClipboard);
        
        return true;
      } catch (error) {
        console.error('Error replacing selected text:', error);
        return false;
      }
    }
  }

  async checkGrammar(text) {
    console.log(`Checking grammar for text: ${text.substring(0, 30)}...`);
    try {
      console.log('Making API request to OpenAI for grammar checking');
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Check and correct the grammar in the following text. Only return the corrected text without any explanations:\n\n${text}`
        }]
      });
      console.log('API request for grammar checking completed successfully');
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error checking grammar:', error);
      throw new Error('Failed to check grammar. Please check your API configuration.');
    }
  }

  async rephraseText(text) {
    console.log(`Rephrasing text: ${text.substring(0, 30)}...`);
    try {
      console.log('Making API request to OpenAI for rephrasing');
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Rephrase the following text to make it more clear and concise. Only return the rephrased text without any explanations:\n\n${text}`
        }]
      });
      console.log('API request for rephrasing completed successfully');
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error rephrasing text:', error);
      throw new Error('Failed to rephrase text. Please check your API configuration.');
    }
  }
}

module.exports = { TextService }; 