document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const settingsBtn = document.getElementById('settingsBtn');
  const helpBtn = document.getElementById('helpBtn');
  const settingsModal = document.getElementById('settingsModal');
  const helpModal = document.getElementById('helpModal');
  const closeButtons = document.querySelectorAll('.close');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');
  const useAzureCheckbox = document.getElementById('useAzure');
  const openaiSettings = document.getElementById('openaiSettings');
  const azureSettings = document.getElementById('azureSettings');
  
  // Test elements
  const testType = document.getElementById('testType');
  const testInput = document.getElementById('testInput');
  const runTestBtn = document.getElementById('runTest');
  const testOutput = document.getElementById('testOutput');
  
  // Load settings
  loadSettings();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup shortcut handler
  setupShortcutHandler();
  
  // Setup error handler
  setupErrorHandler();
  
  // Setup test handler
  setupTestHandler();
  
  // Functions
  function loadSettings() {
    window.electronAPI.getSettings().then(settings => {
      // Populate form
      useAzureCheckbox.checked = settings.useAzure;
      document.getElementById('openaiApiKey').value = settings.openaiApiKey || '';
      document.getElementById('azureEndpoint').value = settings.azureEndpoint || 'init.openai.azure.com';
      document.getElementById('azureApiKey').value = settings.azureApiKey || '';
      document.getElementById('azureDeployment').value = settings.azureDeployment || 'gpt-4o';
      document.getElementById('azureApiVersion').value = settings.azureApiVersion || '2025-01-01-preview';
      
      // Toggle Azure settings visibility
      toggleAzureSettings(settings.useAzure);
    }).catch(error => {
      console.error('Error loading settings:', error);
      showNotification('Error', 'Failed to load settings');
    });
  }
  
  function setupEventListeners() {
    // Modal open/close
    settingsBtn.addEventListener('click', () => {
      settingsModal.style.display = 'block';
    });
    
    helpBtn.addEventListener('click', () => {
      helpModal.style.display = 'block';
    });
    
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        helpModal.style.display = 'none';
      });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
      if (event.target === helpModal) {
        helpModal.style.display = 'none';
      }
    });
    
    // Azure toggle
    useAzureCheckbox.addEventListener('change', (e) => {
      toggleAzureSettings(e.target.checked);
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', async () => {
      const newSettings = {
        useAzure: useAzureCheckbox.checked,
        openaiApiKey: document.getElementById('openaiApiKey').value,
        azureEndpoint: document.getElementById('azureEndpoint').value,
        azureApiKey: document.getElementById('azureApiKey').value,
        azureDeployment: document.getElementById('azureDeployment').value,
        azureApiVersion: document.getElementById('azureApiVersion').value
      };
      
      try {
        const result = await window.electronAPI.saveSettings(newSettings);
        if (result.success) {
          showNotification('Success', 'Settings saved successfully');
          settingsModal.style.display = 'none';
        } else {
          showNotification('Error', result.error || 'Failed to save settings');
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error', 'Failed to save settings');
      }
    });
    
    // Reset settings
    resetSettingsBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        try {
          const result = await window.electronAPI.resetSettings();
          if (result.success) {
            loadSettings();
            showNotification('Success', 'Settings reset to defaults');
          } else {
            showNotification('Error', result.error || 'Failed to reset settings');
          }
        } catch (error) {
          console.error('Error resetting settings:', error);
          showNotification('Error', 'Failed to reset settings');
        }
      }
    });
  }
  
  function setupShortcutHandler() {
    window.electronAPI.onShortcutTriggered(async (shortcut) => {
      try {
        const selectedText = await window.electronAPI.getSelectedText();
        
        if (!selectedText) {
          showNotification('Info', 'No text selected');
          return;
        }
        
        let result;
        if (shortcut === 'grammar-check') {
          result = await window.electronAPI.checkGrammar(selectedText);
          showNotification('Success', 'Grammar check completed');
        } else if (shortcut === 'rephrase') {
          result = await window.electronAPI.rephraseText(selectedText);
          showNotification('Success', 'Text rephrased');
        }
        
        if (result) {
          await window.electronAPI.replaceSelectedText(result);
        }
      } catch (error) {
        console.error('Error processing text:', error);
        showNotification('Error', error.message || 'Failed to process text');
      }
    });
  }
  
  function setupErrorHandler() {
    window.electronAPI.onError((error) => {
      console.error('Application error:', error);
      showNotification('Error', error.message || 'An error occurred');
    });
  }
  
  function setupTestHandler() {
    runTestBtn.addEventListener('click', async () => {
      const text = testInput.value.trim();
      if (!text) {
        showNotification('Info', 'Please enter some text to test');
        return;
      }
      
      try {
        const result = await window.electronAPI.testFunctionality(testType.value, text);
        if (result.success) {
          testOutput.textContent = result.result;
          showNotification('Success', 'Test completed successfully');
        } else {
          testOutput.textContent = `Error: ${result.error}`;
          showNotification('Error', result.error || 'Test failed');
        }
      } catch (error) {
        console.error('Error running test:', error);
        testOutput.textContent = `Error: ${error.message}`;
        showNotification('Error', error.message || 'Failed to run test');
      }
    });
  }
  
  function toggleAzureSettings(showAzure) {
    openaiSettings.style.display = showAzure ? 'none' : 'block';
    azureSettings.style.display = showAzure ? 'block' : 'none';
  }
  
  function showNotification(title, message) {
    window.electronAPI.showNotification(title, message);
  }
}); 