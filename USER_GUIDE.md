# Text Update App - User Guide

## Overview

Text Update App is a powerful AI-powered text enhancement tool that works system-wide across all your applications. It provides instant grammar checking, text rephrasing, summarization, and translation using advanced AI models.

## Features

✨ **Core Features:**
- ✅ Grammar checking and correction
- 🔄 Text rephrasing for clarity
- 📝 Text summarization
- 🌐 Language translation
- 👀 Preview changes before applying
- 📜 Complete history of text changes
- ⚡ Global keyboard shortcuts
- 🎨 Dark/Light theme
- 📊 Usage statistics
- 🔧 Customizable shortcuts

## Installation

### macOS
1. Download `Text-Update-x.x.x.dmg` from releases
2. Open the DMG file
3. Drag Text Update to Applications folder
4. Launch from Applications

**First Run:**
- Right-click the app and select "Open" to bypass Gatekeeper
- Grant Accessibility permissions when prompted (System Preferences → Security & Privacy → Privacy → Accessibility)

### Windows
1. Download `Text-Update-Setup-x.x.x.exe` from releases
2. Run the installer
3. Launch from Start Menu or Desktop shortcut

### Linux
1. Download `.AppImage` or `.deb` file from releases
2. For AppImage:
   ```bash
   chmod +x Text-Update-x.x.x.AppImage
   ./Text-Update-x.x.x.AppImage
   ```
3. For DEB:
   ```bash
   sudo dpkg -i text-update-x.x.x.deb
   sudo apt-get install -f  # Fix dependencies if needed
   ```

## Initial Setup

### 1. Configure API Keys

On first launch, configure your AI provider:

**Option A: Azure OpenAI (Recommended)**
1. Click Settings button
2. Select "Azure OpenAI"
3. Enter:
   - **Endpoint**: Your Azure OpenAI endpoint (e.g., `your-resource.openai.azure.com`)
   - **API Key**: Your Azure OpenAI API key
   - **Deployment**: Your deployment name (e.g., `gpt-4o`)
   - **API Version**: Leave default `2025-01-01-preview`
4. Click "Save Settings"

**Option B: OpenAI**
1. Click Settings button
2. Select "OpenAI"
3. Enter your OpenAI API Key
4. Click "Save Settings"

### 2. Verify Installation

Test the application:
1. Select any text in any application
2. Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux)
3. Review the grammar-checked text in the preview
4. Click "Accept Changes" to apply

## Usage

### Basic Workflow

1. **Select text** in any application (web browser, text editor, email client, etc.)
2. **Press keyboard shortcut** for desired operation
3. **Review preview** of the AI-generated changes
4. **Accept or Reject** the changes

### Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Grammar Check | `Cmd+Shift+G` | `Ctrl+Shift+G` |
| Rephrase | `Cmd+Shift+R` | `Ctrl+Shift+R` |
| Summarize | `Cmd+Shift+S` | `Ctrl+Shift+S` |
| Translate | `Cmd+Shift+T` | `Ctrl+Shift+T` |

**Customizing Shortcuts:**
1. Open Settings
2. Scroll to "Keyboard Shortcuts" section
3. Enter new shortcut combinations
4. Save and restart the app

### Features Guide

#### 1. Grammar Check (`Cmd/Ctrl+Shift+G`)

Analyzes selected text for grammatical errors and provides corrections.

**Example:**
- **Original**: "She don't likes the weather today"
- **Corrected**: "She doesn't like the weather today"

**Best for:**
- Email writing
- Document editing
- Social media posts
- Professional communication

#### 2. Rephrase (`Cmd/Ctrl+Shift+R`)

Rewrites text for better clarity and conciseness.

**Example:**
- **Original**: "I wanted to let you know that I will not be able to make it to the meeting that is scheduled for tomorrow"
- **Rephrased**: "I won't be able to attend tomorrow's meeting"

**Best for:**
- Making text more professional
- Simplifying complex sentences
- Improving readability
- Creating concise messages

#### 3. Summarize (`Cmd/Ctrl+Shift+S`)

Condenses long text into key points.

**Example:**
- **Original**: [Long article about climate change - 500 words]
- **Summary**: "Climate change is accelerating due to greenhouse gas emissions. Rising temperatures are causing ice melt and extreme weather. Urgent action needed to reduce carbon footprint."

**Best for:**
- Research papers
- Long articles
- Meeting notes
- Reports

#### 4. Translate (`Cmd/Ctrl+Shift+T`)

Translates text between English and Spanish (auto-detects source language).

**Example:**
- **Original (English)**: "Hello, how are you?"
- **Translated (Spanish)**: "Hola, ¿cómo estás?"

**Best for:**
- International communication
- Learning languages
- Reading foreign content

### Preview & History

#### Text Preview Modal

When you trigger any operation, a preview modal appears showing:
- **Original text**: What you selected
- **Modified text**: AI-generated result
- **Response time**: How long the operation took

**Actions:**
- **Accept Changes**: Applies the modified text to your selection
- **Reject Changes**: Dismisses the changes and keeps original text

#### History

Access your complete text change history:

1. Click "History" button in the main window
2. View all past operations with:
   - Operation type (Grammar, Rephrase, etc.)
   - Original and modified text
   - Timestamp
3. Export history as JSON for backup
4. Clear history when needed

### Statistics

Track your usage:

1. Click "Stats" button
2. View:
   - Total grammar checks
   - Total rephrases
   - Words processed
   - Average response time
   - Recent activity

**Export stats** as JSON for analysis

## Settings

### Application Settings

- **Show Notifications**: Display system notifications for operations
- **Start Minimized**: Launch app in system tray

### Customization

#### Custom Shortcuts

Create your own keyboard shortcuts:
1. Open Settings
2. Find "Keyboard Shortcuts" section
3. Enter combinations like:
   - `CommandOrControl+Alt+G`
   - `Shift+Ctrl+R`
4. Save and restart app

**Tips:**
- Use `CommandOrControl` for cross-platform compatibility
- Avoid system-reserved shortcuts
- Test shortcuts before saving

#### Theme

Switch between Light and Dark themes:
- Click the 🌙/☀️ icon in the top right
- Theme preference is saved automatically

## Troubleshooting

### Common Issues

#### "No text selected" notification

**Problem**: App can't detect selected text

**Solutions:**
- Ensure text is actually selected (highlighted)
- **macOS**: Grant Accessibility permissions
  1. System Preferences → Security & Privacy → Privacy
  2. Select Accessibility
  3. Add Text Update App and check the box
- **Linux**: Install required tools:
  ```bash
  sudo apt-get install xclip xdotool
  ```

#### API errors

**Problem**: "Failed to check grammar" or similar errors

**Solutions:**
1. Verify API key in Settings
2. Check internet connection
3. Verify Azure deployment name matches your actual deployment
4. Check API quota/billing status
5. Try resetting settings to defaults

#### Shortcuts not working

**Problem**: Keyboard shortcuts don't trigger operations

**Solutions:**
1. Check for shortcut conflicts with other apps
2. Restart the application
3. Try customizing shortcuts in Settings
4. Verify app is running (check system tray)

#### App won't start

**Problem**: Application doesn't launch

**Solutions:**
- **macOS**: Right-click and select "Open" for first launch
- **Windows**: Run as Administrator once
- **Linux**: Check permissions: `chmod +x TextUpdate.AppImage`
- Check application logs in:
  - macOS: `~/Library/Logs/text-update-app/`
  - Windows: `%APPDATA%\text-update-app\logs\`
  - Linux: `~/.config/text-update-app/logs/`

### Performance Issues

#### Slow response times

**Solutions:**
1. Check internet speed
2. Try different times of day (API rate limiting)
3. Reduce text selection size
4. Switch to faster model (if available)

#### High memory usage

**Solutions:**
1. Clear history regularly
2. Restart the app periodically
3. Check for system resource issues

## Privacy & Security

### Data Storage

- **API Keys**: Stored encrypted on your device
- **History**: Stored locally, never sent to servers
- **Statistics**: Stored locally only

**Storage Locations:**
- macOS: `~/Library/Application Support/text-update-app/`
- Windows: `%APPDATA%\text-update-app\`
- Linux: `~/.config/text-update-app/`

### Data Transmission

- Text is sent to OpenAI/Azure OpenAI for processing
- No data is stored by this application remotely
- Refer to OpenAI/Azure privacy policies for their data handling

### Recommendations

1. **Don't process sensitive data**: Avoid using with passwords, private keys, PII
2. **Review before accepting**: Always preview changes before applying
3. **Keep app updated**: Enable auto-updates for security patches
4. **Secure your API keys**: Don't share settings exports containing keys

## Tips & Tricks

### Workflow Optimization

1. **Chain operations**:
   - First rephrase for clarity
   - Then check grammar
   - Result: Clear and correct text

2. **Use history**:
   - Compare different rephrase attempts
   - Learn from AI suggestions
   - Build personal style guide

3. **Custom shortcuts for frequent tasks**:
   - Set easy shortcuts for most-used operations
   - Use patterns you remember easily

### Best Practices

1. **Select appropriate text amounts**:
   - Grammar: 1-2 paragraphs max
   - Rephrase: Single sentence to paragraph
   - Summarize: Multiple paragraphs to pages
   - Translate: Sentences to paragraphs

2. **Review AI suggestions**:
   - AI can make mistakes
   - Always preview before accepting
   - Use your judgment for context

3. **Maintain context**:
   - Include surrounding sentences for better context
   - AI works better with complete thoughts

## Updates

### Auto-Updates

The app automatically checks for updates:
- On startup
- Every 6 hours while running
- Manual check in Settings → About

**Update process:**
1. Notification when update available
2. Download in background
3. Install on next restart

### Manual Updates

1. Visit: https://github.com/dheerajjha/TextUpdateMacOSElectronJs/releases
2. Download latest version
3. Install over existing installation
4. Settings and history are preserved

## Support

### Getting Help

1. **Documentation**: Check this guide and BUILD.md
2. **GitHub Issues**: https://github.com/dheerajjha/TextUpdateMacOSElectronJs/issues
3. **Logs**: Include logs when reporting issues

### Reporting Issues

When reporting bugs, include:
- Operating system and version
- App version (Settings → About)
- Steps to reproduce
- Error messages
- Relevant logs

### Feature Requests

Submit feature requests on GitHub with:
- Clear description
- Use case
- Expected behavior

## Keyboard Shortcuts Reference Card

Print this for easy reference:

```
╔══════════════════════════════════════════════════╗
║         Text Update App - Quick Reference        ║
╠══════════════════════════════════════════════════╣
║  Grammar Check:  Cmd/Ctrl + Shift + G           ║
║  Rephrase:       Cmd/Ctrl + Shift + R           ║
║  Summarize:      Cmd/Ctrl + Shift + S           ║
║  Translate:      Cmd/Ctrl + Shift + T           ║
╠══════════════════════════════════════════════════╣
║  1. Select text in any app                      ║
║  2. Press shortcut                               ║
║  3. Review preview                               ║
║  4. Accept or Reject                             ║
╚══════════════════════════════════════════════════╝
```

## Credits

- Built with [Electron](https://www.electronjs.org/)
- Powered by [OpenAI](https://openai.com/) / [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- Icons: [System default]

## License

[See LICENSE file]

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Website**: https://github.com/dheerajjha/TextUpdateMacOSElectronJs
