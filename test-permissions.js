// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const backButton = document.getElementById('back-button');
    const clipboardReadButton = document.getElementById('test-clipboard-read');
    const clipboardWriteButton = document.getElementById('test-clipboard-write');
    const notificationButton = document.getElementById('test-notification');
    const clipboardResult = document.getElementById('clipboard-result');
    const notificationResult = document.getElementById('notification-result');
    const systemInfo = document.getElementById('system-info');

    // Display system information
    displaySystemInfo();

    // Back button event listener
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Clipboard read test
    clipboardReadButton.addEventListener('click', async () => {
        try {
            clipboardResult.innerHTML = '<span class="info">Reading clipboard...</span>';
            
            // Use the exposed API from preload.js
            const text = await window.electronAPI.getSelectedText();
            
            if (text) {
                clipboardResult.innerHTML = `<span class="success">Success! Clipboard content: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"</span>`;
            } else {
                clipboardResult.innerHTML = '<span class="info">Clipboard is empty</span>';
            }
        } catch (error) {
            clipboardResult.innerHTML = `<span class="error">Error: ${error.message}</span>`;
            console.error('Clipboard read error:', error);
        }
    });

    // Clipboard write test
    clipboardWriteButton.addEventListener('click', async () => {
        try {
            clipboardResult.innerHTML = '<span class="info">Writing to clipboard...</span>';
            
            const testText = `Test clipboard write at ${new Date().toLocaleTimeString()}`;
            
            // Use the exposed API from preload.js
            await window.electronAPI.replaceSelectedText(testText);
            
            clipboardResult.innerHTML = `<span class="success">Success! Wrote to clipboard: "${testText}"</span>`;
        } catch (error) {
            clipboardResult.innerHTML = `<span class="error">Error: ${error.message}</span>`;
            console.error('Clipboard write error:', error);
        }
    });

    // Notification test
    notificationButton.addEventListener('click', async () => {
        try {
            notificationResult.innerHTML = '<span class="info">Sending notification...</span>';
            
            // Use the exposed API from preload.js
            await window.electronAPI.showNotification(
                'Test Notification',
                'This is a test notification from the Text Update App'
            );
            
            notificationResult.innerHTML = '<span class="success">Notification sent successfully!</span>';
        } catch (error) {
            notificationResult.innerHTML = `<span class="error">Error: ${error.message}</span>`;
            console.error('Notification error:', error);
        }
    });

    // Function to display system information
    function displaySystemInfo() {
        const info = {
            'User Agent': navigator.userAgent,
            'Platform': navigator.platform,
            'Language': navigator.language,
            'Cookies Enabled': navigator.cookieEnabled ? 'Yes' : 'No',
            'Window Size': `${window.innerWidth}x${window.innerHeight}`,
            'Screen Size': `${window.screen.width}x${window.screen.height}`,
            'Color Depth': window.screen.colorDepth,
            'Pixel Ratio': window.devicePixelRatio
        };

        let infoHTML = '';
        for (const [key, value] of Object.entries(info)) {
            infoHTML += `<div><strong>${key}:</strong> ${value}</div>`;
        }

        systemInfo.innerHTML = infoHTML;
    }
}); 