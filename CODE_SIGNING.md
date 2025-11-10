# Code Signing Guide for macOS

## The Problem

When users download your app from GitHub Actions, they see:
```
"Text Update.app" is damaged and can't be opened. You should move it to the Trash.
```

This happens because:
1. The app is **not code-signed** with an Apple Developer certificate
2. macOS Gatekeeper blocks unsigned apps for security
3. GitHub Actions builds don't have access to your signing certificates

## Quick Testing Workaround

For **local testing only**, users can bypass Gatekeeper:

### Method 1: Remove Quarantine Attribute
```bash
# Remove the quarantine flag
xattr -cr "/Applications/Text Update.app"

# Or for DMG
xattr -cr ~/Downloads/Text\ Update-1.0.0.dmg
```

### Method 2: Right-Click to Open
1. Right-click (Control+Click) on "Text Update.app"
2. Select "Open"
3. Click "Open" in the dialog

### Method 3: System Preferences
1. Try to open the app (it will fail)
2. Go to: **System Preferences → Security & Privacy → General**
3. Click "Open Anyway"

## Production Solution: Code Signing with GitHub Actions

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com

2. **Create Certificates**
   - Open Xcode or go to developer.apple.com
   - Create "Developer ID Application" certificate
   - Download the certificate (.cer file)

3. **Export Certificate for CI/CD**
   ```bash
   # Open Keychain Access on macOS
   # Find your "Developer ID Application" certificate
   # Right-click → Export "Your Name"
   # Save as .p12 file with a password
   ```

4. **Encode Certificate for GitHub Secrets**
   ```bash
   # Convert .p12 to base64
   base64 -i certificate.p12 | pbcopy
   # The base64 string is now in your clipboard
   ```

### Setup GitHub Secrets

Add these secrets to your repository:
1. Go to: **Settings → Secrets and variables → Actions**
2. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `MAC_CERTS` | Base64-encoded .p12 certificate |
| `MAC_CERTS_PASSWORD` | Password for the .p12 file |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_ID_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | Your Team ID (from developer.apple.com) |

**To get App-Specific Password:**
1. Go to https://appleid.apple.com
2. Sign In → Security → App-Specific Passwords
3. Generate new password
4. Save it as `APPLE_ID_PASSWORD` secret

### Update GitHub Actions Workflow

Create `.github/workflows/build-signed.yml`:

```yaml
name: Build and Sign Electron App

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-mac:
    name: Build macOS (Signed)
    runs-on: macos-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Import Code Signing Certificate
        env:
          MAC_CERTS: ${{ secrets.MAC_CERTS }}
          MAC_CERTS_PASSWORD: ${{ secrets.MAC_CERTS_PASSWORD }}
        run: |
          # Create temporary keychain
          security create-keychain -p actions temp.keychain
          security default-keychain -s temp.keychain
          security unlock-keychain -p actions temp.keychain
          security set-keychain-settings -t 3600 -u temp.keychain

          # Import certificate
          echo "$MAC_CERTS" | base64 --decode > certificate.p12
          security import certificate.p12 -k temp.keychain -P "$MAC_CERTS_PASSWORD" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple: -s -k actions temp.keychain
          rm certificate.p12

      - name: Build and Sign App
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          npm run build:mac

      - name: Notarize App
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          # Upload for notarization
          xcrun notarytool submit dist/*.dmg \
            --apple-id "$APPLE_ID" \
            --password "$APPLE_ID_PASSWORD" \
            --team-id "$APPLE_TEAM_ID" \
            --wait

          # Staple the notarization ticket
          xcrun stapler staple dist/*.dmg

      - name: Upload Signed Builds
        uses: actions/upload-artifact@v4
        with:
          name: macOS-Signed
          path: |
            dist/*.dmg
            dist/*.zip

  build-linux:
    name: Build Linux
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:linux
      - uses: actions/upload-artifact@v4
        with:
          name: Linux-Builds
          path: |
            dist/*.AppImage
            dist/*.deb

  build-windows:
    name: Build Windows
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:win
      - uses: actions/upload-artifact@v4
        with:
          name: Windows-Builds
          path: dist/*.exe
```

### Update package.json Build Config

Add code signing configuration:

```json
{
  "build": {
    "mac": {
      "category": "public.app-category.productivity",
      "target": ["dmg", "zip"],
      "icon": "assets/Texty.png",
      "darkModeSupport": true,
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    }
  }
}
```

### Create Entitlements File

Create `build/entitlements.mac.plist`:

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
  <key>com.apple.security.automation.apple-events</key>
  <true/>
</dict>
</plist>
```

## Alternative: Skip macOS Code Signing

If you don't want to pay for Apple Developer account, you can:

1. **Document the workaround** in your README
2. **Provide installation instructions**:
   ```markdown
   ### macOS Installation

   1. Download `Text-Update.dmg`
   2. Open Terminal and run:
      ```bash
      xattr -cr ~/Downloads/Text-Update.dmg
      ```
   3. Open the DMG and drag to Applications
   ```

3. **Build locally on macOS** instead of GitHub Actions
   - Sign with ad-hoc signature: `codesign -s - -f --deep "Text Update.app"`
   - Users still need to right-click → Open

## Verification

After setting up code signing, verify it works:

```bash
# Check if app is signed
codesign -dv --verbose=4 "/Applications/Text Update.app"

# Check if app is notarized
spctl -a -vv "/Applications/Text Update.app"

# Should show: "accepted" instead of "rejected"
```

## Costs

- **Apple Developer Account**: $99/year (required)
- **GitHub Actions**: Free for public repos
- **Alternative**: Self-host builds on macOS (free, but manual)

## Resources

- [Apple Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [Electron Code Signing](https://www.electron.build/code-signing)
- [Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

---

**Note**: Code signing is **required** for smooth user experience on macOS 10.15+. Without it, users will see scary warnings and have to jump through hoops to run your app.
