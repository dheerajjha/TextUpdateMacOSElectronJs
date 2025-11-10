// DOM elements
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');
const statsBtn = document.getElementById('statsBtn');
const historyBtn = document.getElementById('historyBtn');
const themeToggle = document.getElementById('themeToggle');
const settingsModal = document.getElementById('settingsModal');
const helpModal = document.getElementById('helpModal');
const statsModal = document.getElementById('statsModal');
const historyModal = document.getElementById('historyModal');
const previewModal = document.getElementById('previewModal');
const closeButtons = document.querySelectorAll('.close');
const settingsForm = document.getElementById('settingsForm');
const resetBtn = document.getElementById('resetBtn');
const apiTypeRadios = document.querySelectorAll('input[name="apiType"]');
const azureSettings = document.getElementById('azureSettings');
const openaiSettings = document.getElementById('openaiSettings');
const statusMessage = document.getElementById('statusMessage');
const connectionStatus = document.getElementById('connectionStatus');
const connectionText = document.getElementById('connectionText');
const processingIndicator = document.getElementById('processingIndicator');
const processingText = document.getElementById('processingText');

// Action buttons
const grammarBtn = document.getElementById('grammarBtn');
const rephraseBtn = document.getElementById('rephraseBtn');
const summarizeBtn = document.getElementById('summarizeBtn');
const translateBtn = document.getElementById('translateBtn');

// Stats elements
const grammarCount = document.getElementById('grammarCount');
const rephraseCount = document.getElementById('rephraseCount');
const wordsCount = document.getElementById('wordsCount');
const avgResponseTime = document.getElementById('avgResponseTime');
const recentActivityList = document.getElementById('recentActivityList');
const clearStatsBtn = document.getElementById('clearStatsBtn');
const exportStatsBtn = document.getElementById('exportStatsBtn');

// Preview elements
const originalText = document.getElementById('originalText');
const modifiedText = document.getElementById('modifiedText');
const acceptChanges = document.getElementById('acceptChanges');
const rejectChanges = document.getElementById('rejectChanges');

// History elements
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');

// State management
let currentTheme = localStorage.getItem('theme') || 'light';
let stats = JSON.parse(localStorage.getItem('textUpdateStats')) || {
  grammarChecks: 0,
  rephrases: 0,
  summarizations: 0,
  translations: 0,
  totalWords: 0,
  responseTimes: [],
  recentActivity: []
};
let pendingTextChange = null;

// Initialize theme
applyTheme(currentTheme);

// Show modals
settingsBtn.addEventListener('click', () => {
  loadSettings();
  settingsModal.style.display = 'block';
});

helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'block';
});

statsBtn.addEventListener('click', () => {
  updateStatsDisplay();
  statsModal.style.display = 'block';
});

historyBtn.addEventListener('click', async () => {
  await updateHistoryDisplay();
  historyModal.style.display = 'block';
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  localStorage.setItem('theme', currentTheme);
});

// Action button handlers
grammarBtn.addEventListener('click', () => simulateShortcut('grammar'));
rephraseBtn.addEventListener('click', () => simulateShortcut('rephrase'));
summarizeBtn.addEventListener('click', () => simulateShortcut('summarize'));
translateBtn.addEventListener('click', () => simulateShortcut('translate'));

// Close modals
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    settingsModal.style.display = 'none';
    helpModal.style.display = 'none';
    statsModal.style.display = 'none';
    historyModal.style.display = 'none';
    previewModal.style.display = 'none';
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
  if (event.target === statsModal) {
    statsModal.style.display = 'none';
  }
  if (event.target === historyModal) {
    historyModal.style.display = 'none';
  }
  if (event.target === previewModal) {
    previewModal.style.display = 'none';
  }
});

// Toggle API settings visibility
apiTypeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'azure') {
      azureSettings.style.display = 'block';
      openaiSettings.style.display = 'none';
    } else {
      azureSettings.style.display = 'none';
      openaiSettings.style.display = 'block';
    }
  });
});

// Save settings
settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const apiType = document.querySelector('input[name="apiType"]:checked').value;
    const settings = {
      useAzure: apiType === 'azure',
      showNotifications: document.getElementById('showNotifications').checked,
      startMinimized: document.getElementById('startMinimized').checked,
      'shortcuts.grammar': document.getElementById('grammarShortcut').value,
      'shortcuts.rephrase': document.getElementById('rephraseShortcut').value,
      'shortcuts.summarize': document.getElementById('summarizeShortcut').value,
      'shortcuts.translate': document.getElementById('translateShortcut').value
    };

    if (apiType === 'azure') {
      settings.azureEndpoint = document.getElementById('azureEndpoint').value;
      settings.azureDeployment = document.getElementById('azureDeployment').value;
      settings.azureApiKey = document.getElementById('azureApiKey').value;
    } else {
      settings.openaiApiKey = document.getElementById('openaiApiKey').value;
    }

    await window.api.saveSettings(settings);
    settingsModal.style.display = 'none';
    showStatusMessage('Settings saved successfully. Restart the app to apply new shortcuts.', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatusMessage('Error saving settings', 'error');
  }
});

// Reset settings
resetBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    try {
      await window.api.resetSettings();
      loadSettings();
      showStatusMessage('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting settings:', error);
      showStatusMessage('Error resetting settings', 'error');
    }
  }
});

// Load settings from main process
async function loadSettings() {
  try {
    const settings = await window.api.getSettings();
    
    // Set API type
    document.querySelector(`input[name="apiType"][value="${settings.useAzure ? 'azure' : 'openai'}"]`).checked = true;
    
    // Toggle API settings visibility
    if (settings.useAzure) {
      azureSettings.style.display = 'block';
      openaiSettings.style.display = 'none';
    } else {
      azureSettings.style.display = 'none';
      openaiSettings.style.display = 'block';
    }
    
    // Set Azure values
    document.getElementById('azureEndpoint').value = settings.azureEndpoint || '';
    document.getElementById('azureDeployment').value = settings.azureDeployment || '';
    document.getElementById('azureApiKey').value = settings.azureApiKey || '';
    
    // Set OpenAI values
    document.getElementById('openaiApiKey').value = settings.openaiApiKey || '';
    
    // Set app settings
    document.getElementById('showNotifications').checked = settings.showNotifications !== false;
    document.getElementById('startMinimized').checked = settings.startMinimized === true;

    // Set shortcuts
    if (settings.shortcuts) {
      document.getElementById('grammarShortcut').value = settings.shortcuts.grammar || 'CommandOrControl+Shift+G';
      document.getElementById('rephraseShortcut').value = settings.shortcuts.rephrase || 'CommandOrControl+Shift+R';
      document.getElementById('summarizeShortcut').value = settings.shortcuts.summarize || 'CommandOrControl+Shift+S';
      document.getElementById('translateShortcut').value = settings.shortcuts.translate || 'CommandOrControl+Shift+T';
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatusMessage('Error loading settings', 'error');
  }
}

// Listen for menu bar actions
window.api.onShowSettings(() => {
  loadSettings();
  settingsModal.style.display = 'block';
});

// Listen for show-history from menu bar
if (window.api.onShowHistory) {
  window.api.onShowHistory(() => {
    updateHistoryDisplay();
    historyModal.style.display = 'block';
  });
}

// Listen for show-stats from menu bar
if (window.api.onShowStats) {
  window.api.onShowStats(() => {
    updateStatsDisplay();
    statsModal.style.display = 'block';
  });
}

// Stats management
clearStatsBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all statistics?')) {
    stats = {
      grammarChecks: 0,
      rephrases: 0,
      summarizations: 0,
      translations: 0,
      totalWords: 0,
      responseTimes: [],
      recentActivity: []
    };
    localStorage.setItem('textUpdateStats', JSON.stringify(stats));
    updateStatsDisplay();
    showStatusMessage('Statistics cleared', 'success');
  }
});

exportStatsBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(stats, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `text-update-stats-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showStatusMessage('Statistics exported', 'success');
});

// Preview modal handlers
acceptChanges.addEventListener('click', async () => {
  if (pendingTextChange) {
    try {
      await window.api.applyTextChange(pendingTextChange.modifiedText);
      addToRecentActivity(pendingTextChange.type, pendingTextChange.originalText.length);
      updateStats(pendingTextChange.type, pendingTextChange.originalText.length, pendingTextChange.responseTime);
      showStatusMessage('Changes applied successfully', 'success');
    } catch (error) {
      console.error('Error applying changes:', error);
      showStatusMessage('Failed to apply changes', 'error');
    }
    pendingTextChange = null;
  }
  previewModal.style.display = 'none';
});

rejectChanges.addEventListener('click', () => {
  pendingTextChange = null;
  previewModal.style.display = 'none';
  showStatusMessage('Changes rejected', 'info');
});

// Theme functions
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

// Simulate shortcut for button clicks
function simulateShortcut(type) {
  showProcessingIndicator(type);
  
  // Simulate API call delay
  setTimeout(() => {
    hideProcessingIndicator();
    showStatusMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} completed`, 'success');
  }, 2000);
}

// Processing indicator functions
function showProcessingIndicator(type) {
  processingText.textContent = `Processing ${type}...`;
  processingIndicator.classList.remove('hidden');
  updateConnectionStatus('processing');
}

function hideProcessingIndicator() {
  processingIndicator.classList.add('hidden');
  updateConnectionStatus('connected');
}

// Connection status functions
function updateConnectionStatus(status) {
  const statusDot = connectionStatus;
  const statusTextEl = connectionText;
  
  statusDot.className = 'status-dot';
  
  switch (status) {
    case 'connected':
      statusDot.classList.add('connected');
      statusTextEl.textContent = 'Connected';
      break;
    case 'processing':
      statusTextEl.textContent = 'Processing...';
      break;
    case 'error':
      statusTextEl.textContent = 'Connection Error';
      break;
    default:
      statusTextEl.textContent = 'Disconnected';
  }
}

// Stats functions
function updateStats(type, wordCount, responseTime) {
  switch (type) {
    case 'grammar':
      stats.grammarChecks++;
      break;
    case 'rephrase':
      stats.rephrases++;
      break;
    case 'summarize':
      stats.summarizations++;
      break;
    case 'translate':
      stats.translations++;
      break;
  }
  
  stats.totalWords += wordCount;
  if (responseTime) {
    stats.responseTimes.push(responseTime);
    if (stats.responseTimes.length > 100) {
      stats.responseTimes.shift();
    }
  }
  
  localStorage.setItem('textUpdateStats', JSON.stringify(stats));
}

function updateStatsDisplay() {
  grammarCount.textContent = stats.grammarChecks.toLocaleString();
  rephraseCount.textContent = stats.rephrases.toLocaleString();
  wordsCount.textContent = stats.totalWords.toLocaleString();
  
  const avgTime = stats.responseTimes.length > 0 
    ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
    : 0;
  avgResponseTime.textContent = `${avgTime}ms`;
  
  updateRecentActivityDisplay();
}

function addToRecentActivity(type, wordCount) {
  const activity = {
    type,
    wordCount,
    timestamp: new Date().toISOString()
  };
  
  stats.recentActivity.unshift(activity);
  if (stats.recentActivity.length > 10) {
    stats.recentActivity.pop();
  }
  
  localStorage.setItem('textUpdateStats', JSON.stringify(stats));
}

function updateRecentActivityDisplay() {
  if (stats.recentActivity.length === 0) {
    recentActivityList.innerHTML = '<p class="no-activity">No recent activity</p>';
    return;
  }
  
  const activityHTML = stats.recentActivity.map(activity => {
    const date = new Date(activity.timestamp);
    const timeStr = date.toLocaleTimeString();
    return `
      <div class="activity-item">
        <strong>${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</strong> 
        - ${activity.wordCount} words - ${timeStr}
      </div>
    `;
  }).join('');
  
  recentActivityList.innerHTML = activityHTML;
}

// Enhanced status message function
function showStatusMessage(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-${type}`;
  
  setTimeout(() => {
    statusMessage.textContent = 'Ready - Use global shortcuts to check grammar or rephrase text';
    statusMessage.className = '';
  }, 3000);
}

// Show text preview
function showTextPreview(original, modified, type, responseTime) {
  originalText.textContent = original;
  modifiedText.textContent = modified;
  pendingTextChange = { originalText: original, modifiedText: modified, type, responseTime };
  previewModal.style.display = 'block';
}

// History management
clearHistoryBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all history?')) {
    try {
      await window.api.clearHistory();
      await updateHistoryDisplay();
      showStatusMessage('History cleared', 'success');
    } catch (error) {
      console.error('Error clearing history:', error);
      showStatusMessage('Error clearing history', 'error');
    }
  }
});

exportHistoryBtn.addEventListener('click', async () => {
  try {
    const history = await window.api.getHistory();
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `text-update-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showStatusMessage('History exported', 'success');
  } catch (error) {
    console.error('Error exporting history:', error);
    showStatusMessage('Error exporting history', 'error');
  }
});

async function updateHistoryDisplay() {
  try {
    const history = await window.api.getHistory();

    if (!history || history.length === 0) {
      historyList.innerHTML = '<p class="no-history">No history available</p>';
      return;
    }

    const historyHTML = history.map(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const typeLabel = entry.type.charAt(0).toUpperCase() + entry.type.slice(1);

      return `
        <div class="history-item">
          <div class="history-header">
            <strong>${typeLabel}</strong>
            <span class="history-date">${dateStr} ${timeStr}</span>
          </div>
          <div class="history-content">
            <div class="history-section">
              <label>Original:</label>
              <p class="history-text">${escapeHtml(entry.original.substring(0, 200))}${entry.original.length > 200 ? '...' : ''}</p>
            </div>
            <div class="history-section">
              <label>Modified:</label>
              <p class="history-text">${escapeHtml(entry.modified.substring(0, 200))}${entry.modified.length > 200 ? '...' : ''}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    historyList.innerHTML = historyHTML;
  } catch (error) {
    console.error('Error updating history display:', error);
    historyList.innerHTML = '<p class="no-history">Error loading history</p>';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load settings on startup
loadSettings();
updateStatsDisplay();
updateConnectionStatus('connected'); 