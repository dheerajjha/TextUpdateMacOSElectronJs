// DOM elements
const helpBtn = document.getElementById('helpBtn');
const statsBtn = document.getElementById('statsBtn');
const themeToggle = document.getElementById('themeToggle');
const helpModal = document.getElementById('helpModal');
const statsModal = document.getElementById('statsModal');
const previewModal = document.getElementById('previewModal');
const closeButtons = document.querySelectorAll('.close');

// Shortcut recorder buttons
const shortcutButtons = document.querySelectorAll('.shortcut-btn');

// Feature toggles
const featureGrammar = document.getElementById('featureGrammar');
const featureRephrase = document.getElementById('featureRephrase');
const featureSummarize = document.getElementById('featureSummarize');
const featureTranslate = document.getElementById('featureTranslate');

// Settings
const showNotifications = document.getElementById('showNotifications');
const startMinimized = document.getElementById('startMinimized');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

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

// State management
let currentTheme = localStorage.getItem('theme') || 'light';
let stats = JSON.parse(localStorage.getItem('grammarJiStats')) || {
  grammarChecks: 0,
  rephrases: 0,
  summarizations: 0,
  translations: 0,
  totalWords: 0,
  responseTimes: [],
  recentActivity: []
};
let pendingTextChange = null;

// Shortcut recorder state
let recordingFeature = null;
let keydownHandler = null;
const shortcuts = {
  grammar: 'CommandOrControl+Shift+G',
  rephrase: 'CommandOrControl+Shift+R',
  summarize: 'CommandOrControl+Shift+S',
  translate: 'CommandOrControl+Shift+T'
};

// Detect platform
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Initialize theme
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon();

// Theme toggle
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
  updateThemeIcon();
});

function updateThemeIcon() {
  const icon = themeToggle.querySelector('.theme-icon');
  icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

// Modal handling
helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'block';
});

statsBtn.addEventListener('click', () => {
  updateStatsDisplay();
  updateRecentActivityDisplay();
  statsModal.style.display = 'block';
});

closeButtons.forEach(button => {
  button.addEventListener('click', function() {
    this.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
});

// Shortcut Recorder Functionality
shortcutButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (recordingFeature) {
      // Stop previous recording
      stopRecording();
    }

    // Start recording for this feature
    const feature = button.getAttribute('data-feature');
    startRecording(feature, button);
  });
});

function startRecording(feature, button) {
  recordingFeature = feature;
  button.classList.add('recording');

  const hintEl = button.querySelector('.shortcut-hint');
  hintEl.textContent = 'Press keys...';

  // Create and store the handler
  keydownHandler = (e) => recordKeyPress(e, button);

  // Listen for keydown
  document.addEventListener('keydown', keydownHandler, true);
}

function recordKeyPress(e, button) {
  if (!recordingFeature) return;

  e.preventDefault();
  e.stopPropagation();

  console.log('Key pressed:', {
    key: e.key,
    code: e.code,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    altKey: e.altKey,
    shiftKey: e.shiftKey
  });

  // Ignore if only modifier keys are pressed
  if (['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
    return;
  }

  const modifiers = [];

  // Add modifiers in Electron's expected order
  if (e.ctrlKey || e.metaKey) {
    modifiers.push('CommandOrControl');
  }
  if (e.altKey) {
    modifiers.push('Alt');
  }
  if (e.shiftKey) {
    modifiers.push('Shift');
  }

  // Get the main key
  let mainKey = e.key.toUpperCase();

  // Handle special keys
  if (e.code.startsWith('Key')) {
    mainKey = e.code.replace('Key', '');
  } else if (e.code.startsWith('Digit')) {
    mainKey = e.code.replace('Digit', '');
  }

  // We need at least one modifier for a global shortcut
  if (modifiers.length > 0 && mainKey.length === 1) {
    // Build electron format
    const electronFormat = [...modifiers, mainKey].join('+');

    console.log('Recorded shortcut:', electronFormat);

    // Update shortcuts object
    shortcuts[recordingFeature] = electronFormat;

    // Update button display
    const displayEl = button.querySelector('.shortcut-display');
    displayEl.textContent = formatShortcutDisplay(electronFormat);

    // Stop recording after a short delay
    setTimeout(() => stopRecording(), 300);
  }
}

function stopRecording() {
  if (!recordingFeature) return;

  const button = document.querySelector(`.shortcut-btn[data-feature="${recordingFeature}"]`);
  if (button) {
    button.classList.remove('recording');
    const hintEl = button.querySelector('.shortcut-hint');
    hintEl.textContent = 'Click to record';
  }

  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler, true);
    keydownHandler = null;
  }

  recordingFeature = null;
}

function formatShortcutDisplay(shortcut) {
  // Convert electron format to Mac symbols
  if (isMac) {
    return shortcut
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Control', '⌃')
      .replace('Alt', '⌥')
      .replace('Option', '⌥')
      .replace('Shift', '⇧')
      .replace(/\+/g, '');
  }
  return shortcut;
}

// Load settings on init
loadSettings();

async function loadSettings() {
  try {
    const settings = await window.api.getSettings();

    // Set feature toggles
    if (settings.features) {
      featureGrammar.checked = settings.features.grammar !== false;
      featureRephrase.checked = settings.features.rephrase !== false;
      featureSummarize.checked = settings.features.summarize === true;
      featureTranslate.checked = settings.features.translate === true;
    }

    // Set shortcuts
    if (settings.shortcuts) {
      shortcuts.grammar = settings.shortcuts.grammar || 'CommandOrControl+Shift+G';
      shortcuts.rephrase = settings.shortcuts.rephrase || 'CommandOrControl+Shift+R';
      shortcuts.summarize = settings.shortcuts.summarize || 'CommandOrControl+Shift+S';
      shortcuts.translate = settings.shortcuts.translate || 'CommandOrControl+Shift+T';

      // Update button displays
      Object.keys(shortcuts).forEach(feature => {
        const button = document.getElementById(`shortcut${feature.charAt(0).toUpperCase() + feature.slice(1)}`);
        if (button) {
          const displayEl = button.querySelector('.shortcut-display');
          displayEl.textContent = formatShortcutDisplay(shortcuts[feature]);
        }
      });
    }

    // Set general app settings
    showNotifications.checked = settings.showNotifications !== false;
    startMinimized.checked = settings.startMinimized === true;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings
saveSettingsBtn.addEventListener('click', async () => {
  try {
    const settings = {
      // Feature toggles
      'features.grammar': featureGrammar.checked,
      'features.rephrase': featureRephrase.checked,
      'features.summarize': featureSummarize.checked,
      'features.translate': featureTranslate.checked,
      // Shortcuts
      'shortcuts.grammar': shortcuts.grammar,
      'shortcuts.rephrase': shortcuts.rephrase,
      'shortcuts.summarize': shortcuts.summarize,
      'shortcuts.translate': shortcuts.translate,
      // General settings
      showNotifications: showNotifications.checked,
      startMinimized: startMinimized.checked
    };

    await window.api.saveSettings(settings);

    // Restart the app
    if (confirm('Settings saved! The app needs to restart for changes to take effect. Restart now?')) {
      await window.api.restartApp();
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings: ' + error.message);
  }
});

// Stats functionality
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
    localStorage.setItem('grammarJiStats', JSON.stringify(stats));
    updateStatsDisplay();
    updateRecentActivityDisplay();
  }
});

exportStatsBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(stats, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `grammar-ji-stats-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

function updateStatsDisplay() {
  grammarCount.textContent = stats.grammarChecks || 0;
  rephraseCount.textContent = stats.rephrases || 0;
  wordsCount.textContent = stats.totalWords || 0;

  const avgTime = stats.responseTimes.length > 0
    ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
    : 0;
  avgResponseTime.textContent = avgTime + 'ms';
}

function updateRecentActivityDisplay() {
  if (stats.recentActivity && stats.recentActivity.length > 0) {
    recentActivityList.innerHTML = stats.recentActivity
      .slice(0, 10)
      .map(activity => `
        <div class="activity-item">
          <span class="activity-type">${activity.type}</span>
          <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
        </div>
      `).join('');
  } else {
    recentActivityList.innerHTML = '<p class="no-activity">No recent activity</p>';
  }
}

// Preview modal handlers (if needed)
acceptChanges.addEventListener('click', () => {
  if (pendingTextChange) {
    window.api.applyTextChange?.(pendingTextChange.modifiedText);
    previewModal.style.display = 'none';
  }
});

rejectChanges.addEventListener('click', () => {
  previewModal.style.display = 'none';
  pendingTextChange = null;
});

// Initialize stats display
updateStatsDisplay();
updateRecentActivityDisplay();
