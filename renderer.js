document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const settingsButton = document.getElementById('settings-button');
  const helpButton = document.getElementById('help-button');
  const testButton = document.getElementById('test-button');
  const settingsModal = document.getElementById('settings-modal');
  const helpModal = document.getElementById('help-modal');
  const closeButtons = document.querySelectorAll('.close');
  const settingsForm = document.getElementById('settings-form');
  const resetSettingsButton = document.getElementById('reset-settings');
  const useAzureCheckbox = document.getElementById('use-azure');
  const azureSettings = document.querySelectorAll('.azure-settings');
  const openaiSettings = document.querySelectorAll('.openai-settings');
  const statusMessage = document.getElementById('status-message');
  const lastAction = document.getElementById('last-action');
  
  // Load settings
  loadSettings();
  
  // Event Listeners
  settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
  });
  
  helpButton.addEventListener('click', () => {
    helpModal.style.display = 'block';
  });
  
  testButton.addEventListener('click', async () => {
    try {
      await window.electronAPI.navigateToTest();
    } catch (error) {
      console.error('Error navigating to test page:', error);
      showNotification('Error', 'Failed to open test page');
    }
  });
  
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      settingsModal.style.display = 'none';
      helpModal.style.display = 'none';
    });
  });
  
  window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
    if (event.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });
  
  useAzureCheckbox.addEventListener('change', () => {
    toggleApiSettings();
  });
  
  settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveSettings();
  });
  
  resetSettingsButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      await resetSettings();
    }
  });
  
  // Listen for shortcut events
  window.electronAPI.onShortcutTriggered((type) => {
    handleShortcut(type);
  });
  
  // Functions
  async function loadSettings() {
    try {
      const settings = await window.electronAPI.getSettings();
      
      // Populate form fields
      useAzureCheckbox.checked = settings.useAzure;
      document.getElementById('azure-endpoint').value = settings.azureEndpoint || '';
      document.getElementById('azure-api-key').value = settings.azureApiKey || '';
      document.getElementById('azure-deployment').value = settings.azureDeployment || '';
      document.getElementById('openai-api-key').value = settings.openaiApiKey || '';
      
      // Toggle API settings visibility
      toggleApiSettings();
      
      updateStatus('Settings loaded successfully');
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('Error', 'Failed to load settings');
    }
  }
  
  async function saveSettings() {
    try {
      const settings = {
        useAzure: useAzureCheckbox.checked,
        azureEndpoint: document.getElementById('azure-endpoint').value,
        azureApiKey: document.getElementById('azure-api-key').value,
        azureDeployment: document.getElementById('azure-deployment').value,
        openaiApiKey: document.getElementById('openai-api-key').value
      };
      
      await window.electronAPI.saveSettings(settings);
      settingsModal.style.display = 'none';
      updateStatus('Settings saved successfully');
      showNotification('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error', 'Failed to save settings');
    }
  }
  
  async function resetSettings() {
    try {
      await window.electronAPI.resetSettings();
      await loadSettings();
      updateStatus('Settings reset to defaults');
      showNotification('Success', 'Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      showNotification('Error', 'Failed to reset settings');
    }
  }
  
  function toggleApiSettings() {
    const useAzure = useAzureCheckbox.checked;
    
    azureSettings.forEach(element => {
      element.style.display = useAzure ? 'block' : 'none';
    });
    
    openaiSettings.forEach(element => {
      element.style.display = useAzure ? 'none' : 'block';
    });
  }
  
  async function handleShortcut(type) {
    try {
      updateStatus(`Processing ${type} request...`);
      
      // Get selected text
      const selectedText = await window.electronAPI.getSelectedText();
      
      if (!selectedText) {
        updateStatus('No text selected');
        showNotification('Error', 'Please select some text first');
        return;
      }
      
      let result;
      
      // Process text based on shortcut type
      if (type === 'grammar') {
        result = await window.electronAPI.checkGrammar(selectedText);
        updateLastAction('Grammar check completed');
      } else if (type === 'rephrase') {
        result = await window.electronAPI.rephraseText(selectedText);
        updateLastAction('Text rephrasing completed');
      }
      
      // Replace selected text with result
      if (result) {
        await window.electronAPI.replaceSelectedText(result);
        updateStatus(`${type} completed successfully`);
        showNotification('Success', `${type} completed successfully`);
      } else {
        updateStatus(`${type} failed`);
        showNotification('Error', `${type} failed`);
      }
    } catch (error) {
      console.error(`Error handling ${type} shortcut:`, error);
      updateStatus(`Error: ${error.message}`);
      showNotification('Error', `Failed to ${type}: ${error.message}`);
    }
  }
  
  function updateStatus(message) {
    statusMessage.textContent = message;
  }
  
  function updateLastAction(action) {
    lastAction.textContent = action;
  }
  
  function showNotification(title, message) {
    window.electronAPI.showNotification(title, message);
  }
}); 