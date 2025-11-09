# Build and Deployment Guide

## Prerequisites

- Node.js 14 or higher
- npm or yarn
- For macOS builds: macOS 10.13+ with Xcode Command Line Tools
- For Windows builds: Windows 7+ with Visual Studio Build Tools
- For Linux builds: Ubuntu/Debian or similar distribution

## Installation

### 1. Install Dependencies

```bash
npm install
```

If you encounter network issues downloading Electron binaries, try:

```bash
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install
# Then install Electron separately
npm install electron@22.0.0
```

### 2. Configure API Keys

Before running the application, configure your OpenAI or Azure OpenAI credentials:

1. Run the application: `npm start`
2. Open Settings
3. Enter your API credentials:
   - **Azure OpenAI** (default):
     - Endpoint: `your-resource.openai.azure.com`
     - API Key: Your Azure OpenAI key
     - Deployment: `gpt-4o` or your deployment name
   - **OpenAI**:
     - API Key: Your OpenAI API key

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts the application with:
- DevTools enabled
- Hot reload (manual restart required for main process changes)
- Console logging

### Project Structure

```
src/
├── main/
│   ├── main.js           # Main process entry point
│   ├── preload.js        # Preload script (context bridge)
│   ├── trayManager.js    # System tray functionality
│   └── autoUpdater.js    # Auto-update functionality
├── renderer/
│   ├── index.html        # UI markup
│   ├── renderer.js       # Renderer process logic
│   └── styles.css        # Application styles
├── services/
│   ├── clipboardManager.js  # Cross-platform clipboard
│   └── openaiService.js     # OpenAI/Azure OpenAI integration
└── config/
    └── config.js         # Configuration management
```

## Building for Distribution

### Build for Current Platform

```bash
npm run build
```

### Build for Specific Platform

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

### Build Output

Builds are created in the `dist/` directory:

- **macOS**: `.dmg` installer and `.zip` archive
- **Windows**: `.exe` installer (NSIS) and portable `.exe`
- **Linux**: `.AppImage` and `.deb` packages

## Code Signing (Required for Distribution)

### macOS Code Signing

1. **Get Apple Developer Certificate**
   - Join Apple Developer Program ($99/year)
   - Create certificates in Xcode or Developer Portal

2. **Configure in package.json**:
   ```json
   "build": {
     "mac": {
       "identity": "Developer ID Application: Your Name (TEAM_ID)",
       "hardenedRuntime": true,
       "gatekeeperAssess": false,
       "entitlements": "build/entitlements.mac.plist",
       "entitlementsInherit": "build/entitlements.mac.plist"
     }
   }
   ```

3. **Create entitlements file** (`build/entitlements.mac.plist`):
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>com.apple.security.cs.allow-jit</key>
     <true/>
     <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
     <true/>
     <key>com.apple.security.cs.allow-dyld-environment-variables</key>
     <true/>
   </dict>
   </plist>
   ```

4. **Notarize** (required for macOS 10.15+):
   ```bash
   npx notarize-cli --file dist/Text\ Update-1.0.0.dmg \
     --bundle-id com.electron.text-update-app \
     --username your@apple-id.com \
     --password @keychain:AC_PASSWORD
   ```

### Windows Code Signing

1. **Get Code Signing Certificate**
   - Purchase from DigiCert, Sectigo, or similar CA

2. **Configure in package.json**:
   ```json
   "build": {
     "win": {
       "certificateFile": "path/to/certificate.pfx",
       "certificatePassword": "${env.WIN_CSC_KEY_PASSWORD}"
     }
   }
   ```

3. **Set environment variable**:
   ```bash
   export WIN_CSC_KEY_PASSWORD="your-certificate-password"
   ```

## Auto-Updates Setup

### 1. Create GitHub Release

The application is configured to use GitHub releases for auto-updates.

```bash
# Update version in package.json
npm version patch  # or minor, major

# Commit and push
git add package.json
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
git push

# Create release
gh release create v$(node -p "require('./package.json').version") \
  dist/*.dmg \
  dist/*.zip \
  dist/*.exe \
  dist/*.AppImage \
  dist/*.deb \
  --title "Release v$(node -p "require('./package.json').version")" \
  --notes "Release notes here"
```

### 2. Update package.json

Update the `publish` section with your GitHub details:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-github-username",
      "repo": "TextUpdateMacOSElectronJs"
    }
  }
}
```

### 3. Generate GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Set environment variable:
   ```bash
   export GH_TOKEN="your-github-token"
   ```

### 4. Publish Release

```bash
npm run build
npx electron-builder --publish always
```

## Testing

### Manual Testing Checklist

- [ ] Application starts without errors
- [ ] Settings save and persist
- [ ] Global shortcuts work (Cmd/Ctrl+Shift+G, R, S, T)
- [ ] Grammar check processes text correctly
- [ ] Rephrase functionality works
- [ ] Summarize functionality works
- [ ] Translate functionality works
- [ ] Preview modal shows before applying changes
- [ ] Accept/Reject buttons work in preview
- [ ] History tracks all changes
- [ ] Export history works
- [ ] Clear history works
- [ ] Stats are tracked correctly
- [ ] Dark/Light theme toggle works
- [ ] System tray icon appears
- [ ] Application runs in background
- [ ] Auto-update checks work (in production)

### Platform-Specific Testing

**macOS:**
- [ ] AppleScript clipboard access works
- [ ] Global shortcuts don't conflict with system shortcuts
- [ ] App hides dock icon correctly
- [ ] Notarization passes

**Windows:**
- [ ] PowerShell clipboard access works
- [ ] Installer creates shortcuts correctly
- [ ] Portable version works

**Linux:**
- [ ] xclip/xdotool work (may need to install)
- [ ] AppImage runs on different distros
- [ ] .deb installs correctly

## Troubleshooting

### Build Issues

**"Cannot find module 'electron'"**
```bash
npm install electron --save-dev
```

**"Command failed: electron-builder"**
```bash
npm install electron-builder --save-dev
npx electron-builder install-app-deps
```

**macOS: "Code signing failed"**
- Ensure you have valid Developer ID certificates
- Check Keychain Access for certificate validity
- Try: `security find-identity -v -p codesigning`

### Runtime Issues

**"API key not working"**
- Verify API key in Settings
- Check API key has correct permissions
- For Azure: Ensure deployment name matches

**"No text selected"**
- macOS: Grant Accessibility permissions in System Preferences
- Windows: Run as Administrator first time
- Linux: Install xclip and xdotool

**"Global shortcuts not working"**
- Check for conflicts with other apps
- Try customizing shortcuts in Settings
- Restart application after changing shortcuts

## Performance Optimization

### Bundle Size

Current bundle size: ~150-200MB (includes Electron runtime)

To reduce size:
1. Use electron-builder compression options
2. Remove unused dependencies
3. Use Electron fiddle to test without full install

### Memory Usage

Typical memory usage: 50-100MB

Monitor with:
```bash
# macOS
top -pid $(pgrep -f "Text Update")

# Windows
tasklist /FI "IMAGENAME eq Text Update.exe"

# Linux
ps aux | grep "text-update"
```

## Security Considerations

### API Key Storage

API keys are stored using `electron-store` which:
- Encrypts data on disk (platform-dependent)
- Uses secure file permissions
- Stores in user-specific directory

**Locations:**
- macOS: `~/Library/Application Support/text-update-app/`
- Windows: `%APPDATA%\text-update-app\`
- Linux: `~/.config/text-update-app/`

### Content Security Policy

Current CSP: `default-src 'self'; script-src 'self'`

To modify, edit `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="...">
```

### Permissions

Required permissions:
- **macOS**: Accessibility (for clipboard access)
- **Windows**: None (runs with user privileges)
- **Linux**: xclip, xdotool access

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/*
```

## License and Distribution

Before distributing:
1. Update `LICENSE` file
2. Add your information to `package.json` (author, license)
3. Create `PRIVACY.md` explaining data usage
4. Consider GDPR compliance for EU users

## Support and Maintenance

### Version Numbering

Follow Semantic Versioning:
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

### Changelog

Maintain `CHANGELOG.md` with format:
```markdown
## [1.0.0] - 2025-01-01
### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)

## Contact

For issues and feature requests, visit:
https://github.com/dheerajjha/TextUpdateMacOSElectronJs/issues
