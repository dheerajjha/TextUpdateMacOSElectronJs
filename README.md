# Text Update App

> AI-powered text enhancement tool that works system-wide across all your applications

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-22.0-blue.svg)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)](https://github.com/dheerajjha/TextUpdateMacOSElectronJs)

## Overview

Text Update App is a powerful desktop application that provides instant AI-powered text improvements using global keyboard shortcuts. Select any text in any application, press a shortcut, and get grammar-checked, rephrased, summarized, or translated text instantly.

### Key Features

- ✅ **Grammar Checking** - Automatically fix grammatical errors
- 🔄 **Text Rephrasing** - Improve clarity and conciseness
- 📝 **Summarization** - Condense long text into key points
- 🌐 **Translation** - Translate between English and Spanish
- 👀 **Preview Mode** - Review changes before applying
- 📜 **History Tracking** - Complete history of all text changes
- ⚡ **Global Shortcuts** - Works across all applications
- 🎨 **Dark/Light Theme** - Customizable interface
- 📊 **Statistics** - Track your usage and productivity
- 🔧 **Customizable** - Configure shortcuts and settings

## Quick Start

### Installation

#### macOS

> **Note**: The app is currently unsigned. You'll need to bypass Gatekeeper (see below).

```bash
# Download
curl -LO https://github.com/dheerajjha/TextUpdateMacOSElectronJs/releases/latest/download/Text-Update.dmg

# Remove quarantine attribute (IMPORTANT)
xattr -cr Text-Update.dmg

# Open and drag to Applications
open Text-Update.dmg
```

**Alternative method:**
1. Download the DMG from releases
2. Right-click on "Text Update.app" → Select "Open"
3. Click "Open" in the security dialog

#### Windows
```bash
# Download installer
curl -LO https://github.com/dheerajjha/TextUpdateMacOSElectronJs/releases/latest/download/Text-Update-Setup.exe
# Run installer
./Text-Update-Setup.exe
```

#### Linux (Debian/Ubuntu)
```bash
# Download and install DEB package
curl -LO https://github.com/dheerajjha/TextUpdateMacOSElectronJs/releases/latest/download/text-update-app_amd64.deb
sudo dpkg -i text-update-app_amd64.deb

# Or use AppImage
curl -LO https://github.com/dheerajjha/TextUpdateMacOSElectronJs/releases/latest/download/Text-Update.AppImage
chmod +x Text-Update.AppImage
./Text-Update.AppImage
```

### Initial Setup

1. Launch the application
2. Click the **Settings** button
3. Choose your AI provider:
   - **Azure OpenAI** (Recommended): Enter endpoint, API key, and deployment name
   - **OpenAI**: Enter your OpenAI API key
4. Click **Save Settings**
5. You're ready to go!

### Usage

1. **Select text** in any application
2. **Press keyboard shortcut**:
   - `Cmd/Ctrl+Shift+G` - Grammar Check
   - `Cmd/Ctrl+Shift+R` - Rephrase
   - `Cmd/Ctrl+Shift+S` - Summarize
   - `Cmd/Ctrl+Shift+T` - Translate
3. **Review preview** of changes
4. **Accept or Reject** the changes

## Development

### Prerequisites

- Node.js 14+
- npm or yarn
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/dheerajjha/TextUpdateMacOSElectronJs.git
cd TextUpdateMacOSElectronJs

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── main/           # Main process (Electron)
│   ├── main.js     # Application entry point
│   ├── preload.js  # Context bridge
│   ├── trayManager.js
│   └── autoUpdater.js
├── renderer/       # Renderer process (UI)
│   ├── index.html
│   ├── renderer.js
│   └── styles.css
├── services/       # Business logic
│   ├── clipboardManager.js
│   └── openaiService.js
└── config/         # Configuration
    └── config.js
```

### Building

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:mac     # macOS
npm run build:win     # Windows
npm run build:linux   # Linux
```

## Documentation

- **[User Guide](USER_GUIDE.md)** - Complete user documentation
- **[Build Guide](BUILD.md)** - Building and deployment instructions
- **[Implementation Details](IMPLEMENTATION.md)** - Technical implementation guide
- **[Build Verification](BUILD_VERIFICATION.md)** - Build configuration verification

## Platform Support

| Platform | Version | Status |
|----------|---------|--------|
| macOS | 10.13+ | ✅ Supported |
| Windows | 7+ | ✅ Supported |
| Linux | Ubuntu 16.04+ | ✅ Supported |

### Platform-Specific Notes

**macOS:**
- Requires Accessibility permissions for clipboard access
- Right-click and select "Open" on first launch

**Windows:**
- May require running as Administrator on first launch
- Windows Defender might flag the app (add exception)

**Linux:**
- Requires `xclip` and `xdotool` packages
- Install: `sudo apt-get install xclip xdotool`

## API Providers

### Azure OpenAI (Recommended)

```
Endpoint: your-resource.openai.azure.com
API Key: Your Azure OpenAI API key
Deployment: gpt-4o (or your deployment name)
API Version: 2025-01-01-preview
```

### OpenAI

```
API Key: Your OpenAI API key from platform.openai.com
```

## Security & Privacy

- ✅ API keys stored encrypted locally
- ✅ No data stored remotely by this app
- ✅ Text sent to OpenAI/Azure for processing only
- ✅ Complete history stored locally only
- ✅ Context isolation and CSP enabled

**Storage Locations:**
- macOS: `~/Library/Application Support/text-update-app/`
- Windows: `%APPDATA%\text-update-app\`
- Linux: `~/.config/text-update-app/`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**"No text selected"**
- Ensure text is highlighted before pressing shortcut
- Grant Accessibility permissions (macOS)
- Install xclip/xdotool (Linux)

**API Errors**
- Verify API key in Settings
- Check internet connection
- Verify deployment name matches your Azure deployment

**Shortcuts not working**
- Check for conflicts with other applications
- Restart the application
- Try customizing shortcuts in Settings

For more troubleshooting help, see [USER_GUIDE.md](USER_GUIDE.md#troubleshooting).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Powered by [OpenAI](https://openai.com/) / [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- Icon and design inspired by productivity tools

## Support

- **Issues**: [GitHub Issues](https://github.com/dheerajjha/TextUpdateMacOSElectronJs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dheerajjha/TextUpdateMacOSElectronJs/discussions)
- **Email**: support@textupdate.app

---

**Made with ❤️ by the Text Update Team**

**Version**: 1.0.0 | **Last Updated**: January 2025
