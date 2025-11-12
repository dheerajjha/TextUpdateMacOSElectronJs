# Mac App Store Preparation Guide for Grammar Ji

## Prerequisites

### 1. Apple Developer Account
- **Cost**: $99/year
- **Sign up**: https://developer.apple.com/programs/
- **Time**: 1-2 days for approval
- **Requirements**:
  - Valid Apple ID
  - Credit card
  - Two-factor authentication enabled

### 2. Required Software
- Xcode (latest version from Mac App Store)
- macOS 13.0 or later
- Node.js and npm (already installed)

---

## Step 1: Apple Developer Account Setup

### 1.1 Enroll in Apple Developer Program
```
1. Go to https://developer.apple.com/programs/enroll/
2. Sign in with your Apple ID
3. Complete enrollment (requires payment)
4. Wait for approval email (usually 24-48 hours)
```

### 1.2 Create App ID
```
1. Go to https://developer.apple.com/account/
2. Navigate to "Certificates, Identifiers & Profiles"
3. Click "Identifiers" → "+" button
4. Select "App IDs" → "App"
5. Fill in:
   - Description: Grammar Ji
   - Bundle ID: com.grammarji.app (must match package.json)
   - Capabilities:
     ✓ Network Extensions (for clipboard access)
     ✓ App Sandbox
6. Click "Register"
```

### 1.3 Create Certificates
```
1. In Xcode, go to Preferences → Accounts
2. Add your Apple ID
3. Select your team → "Manage Certificates"
4. Click "+" → "Mac App Distribution"
5. Also create "Mac Installer Distribution"
```

---

## Step 2: Update App Configuration

### 2.1 Update package.json (Already Done)
Current configuration:
```json
{
  "name": "grammar-ji",
  "version": "1.0.0",
  "build": {
    "appId": "com.grammarji.app",
    "productName": "Grammar Ji"
  }
}
```

### 2.2 Add App Store Configuration
We need to add to package.json build section:
```json
"mac": {
  "category": "public.app-category.productivity",
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist",
  "provisioningProfile": "build/embedded.provisionprofile",
  "type": "distribution"
}
```

---

## Step 3: Create Entitlements File

### 3.1 Create build/entitlements.mac.plist
This file defines app permissions:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- App Sandbox -->
    <key>com.apple.security.app-sandbox</key>
    <true/>

    <!-- Network Access (for API calls) -->
    <key>com.apple.security.network.client</key>
    <true/>

    <!-- Clipboard Access -->
    <key>com.apple.security.automation.apple-events</key>
    <true/>

    <!-- Accessibility (for global shortcuts and text selection) -->
    <key>com.apple.security.automation.apple-events</key>
    <true/>

    <!-- Hardened Runtime -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

---

## Step 4: App Store Connect Setup

### 4.1 Create App Record
```
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: macOS
   - Name: Grammar Ji
   - Primary Language: English (U.S.)
   - Bundle ID: com.grammarji.app
   - SKU: GRAMMARJI001
   - User Access: Full Access
```

### 4.2 App Information
```
Category: Productivity
Secondary Category: Utilities
Content Rights: You own the content

Privacy Policy URL: [You need to create this]
Support URL: [Your GitHub or website]
Marketing URL: [Optional]
```

### 4.3 Pricing
```
Price: Free (as per your requirement)
Available in all territories
```

---

## Step 5: Prepare App Assets

### 5.1 App Icon
**Required**: Icon in .icns format (already created: assets/icon.icns)
- ✓ 16x16
- ✓ 32x32
- ✓ 64x64
- ✓ 128x128
- ✓ 256x256
- ✓ 512x512
- ✓ 1024x1024

### 5.2 Screenshots (Required)
You need at least 3 screenshots in these sizes:
- 1280 x 800 (13-inch MacBook)
- 1440 x 900 (recommended)
- 2880 x 1800 (Retina)

**How to create:**
1. Run the app
2. Press Cmd+Shift+4 to take screenshots
3. Show the main interface with features
4. Show the app in action

### 5.3 App Preview Video (Optional but Recommended)
- 15-30 seconds
- Show main features
- Demonstrate how to use shortcuts

---

## Step 6: App Description & Metadata

### 6.1 App Name
```
Grammar Ji - AI Writing Assistant
```

### 6.2 Subtitle (30 characters max)
```
Free Grammar & Text Helper
```

### 6.3 Description
```
Grammar Ji is your free AI-powered writing assistant that helps you write better, faster.

FEATURES:
• Grammar Check - Instantly fix grammar mistakes
• Rephrase Text - Make your writing clearer
• Summarize - Condense long text
• Translate - Convert between languages

HOW IT WORKS:
1. Select any text in any app
2. Press the keyboard shortcut
3. Text is automatically improved

COMPLETELY FREE:
No subscriptions, no API keys, no hidden costs. Grammar Ji is 100% free for everyone.

CUSTOMIZABLE:
• Enable/disable features you need
• Customize keyboard shortcuts
• Works with any application
• Dark mode support

PRIVACY FIRST:
• No data collection
• No account required
• Secure processing
• Your text stays private

Perfect for:
✓ Students writing essays
✓ Professionals writing emails
✓ Content creators
✓ Anyone who writes
```

### 6.4 Keywords (100 characters max)
```
grammar,writing,text,editor,ai,assistant,translate,rephrase,productivity
```

### 6.5 Promotional Text (170 characters max)
```
Write better with AI! Fix grammar, rephrase text, summarize, and translate - all with simple keyboard shortcuts. Completely free, no sign-up needed.
```

---

## Step 7: Privacy Policy

### 7.1 Create Privacy Policy
You **MUST** have a privacy policy. Here's a template:

```markdown
# Privacy Policy for Grammar Ji

Last updated: [DATE]

## Data Collection
Grammar Ji does NOT collect, store, or transmit any personal data.

## Text Processing
- Selected text is sent to our secure API for processing
- Text is processed in real-time and immediately discarded
- No text is stored or logged
- No user identification is performed

## Third-Party Services
- API provider: Azure OpenAI (Microsoft)
- Text is processed according to Azure's privacy policy
- No data sharing with third parties

## Permissions
Grammar Ji requires:
- Accessibility: To read selected text
- Network: To process text via API
- Clipboard: To replace corrected text

## Contact
For privacy concerns: [YOUR EMAIL]

## Changes
We may update this policy. Check this page periodically.
```

Host this on:
- GitHub Pages (free)
- Your website
- Netlify/Vercel (free)

---

## Step 8: Build for Distribution

### 8.1 Update package.json Scripts
Add to scripts section:
```json
"scripts": {
  "dist:mas": "electron-builder --mac mas",
  "dist:mas-dev": "electron-builder --mac mas-dev"
}
```

### 8.2 Build the App
```bash
# First, install dependencies if not already
npm install

# Build for Mac App Store
npm run dist:mas
```

This creates:
- `dist/Grammar Ji.pkg` - Installer for App Store

### 8.3 Validate the Build
```bash
# Install Apple's transporter tool
# Download from App Store Connect → Resources & Help → Tools

# Validate package
xcrun altool --validate-app -f "dist/Grammar Ji.pkg" \
  -t macos -u YOUR_APPLE_ID -p YOUR_APP_SPECIFIC_PASSWORD

# If validation passes, upload:
xcrun altool --upload-app -f "dist/Grammar Ji.pkg" \
  -t macos -u YOUR_APPLE_ID -p YOUR_APP_SPECIFIC_PASSWORD
```

---

## Step 9: Submit for Review

### 9.1 Complete App Store Connect
1. Upload screenshots
2. Enter all metadata
3. Select "Ready for Sale" availability
4. Add privacy policy URL
5. Answer App Store questions:
   - Export Compliance: No encryption
   - Advertising Identifier: No
   - Content Rights: You own it

### 9.2 Submit
1. Click "Submit for Review"
2. Wait for Apple review (typically 1-3 days)
3. Respond to any feedback

---

## Step 10: After Approval

### 10.1 Release
- App automatically available on Mac App Store
- Users can search "Grammar Ji"
- Free download

### 10.2 Updates
For updates:
1. Increment version in package.json
2. Build new package
3. Upload to App Store Connect
4. Submit for review

---

## Common Issues & Solutions

### Issue: Codesign Failed
```bash
# Solution: Check certificates
security find-identity -v -p codesigning
# Ensure "Mac App Distribution: [Your Name]" exists
```

### Issue: Entitlements Error
```
Solution: Verify entitlements.mac.plist is in build/ folder
```

### Issue: Sandbox Violation
```
Solution: Request specific entitlements in entitlements.mac.plist
Check Console.app for sandbox violations
```

### Issue: Notarization Failed
```
Solution: Mac App Store apps don't need notarization
Only direct distribution requires notarization
```

---

## Costs Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Yearly |
| Code Signing Certificate | Included | - |
| App Store Distribution | Free | - |
| App Review | Free | Per submission |
| **Total First Year** | **$99** | - |
| **Total Subsequent Years** | **$99** | Yearly |

---

## Timeline

| Task | Duration |
|------|----------|
| Apple Developer approval | 1-2 days |
| Setup certificates | 1 hour |
| Configure app | 2-3 hours |
| Create screenshots | 1 hour |
| Write descriptions | 2 hours |
| Privacy policy | 1 hour |
| First build & test | 2 hours |
| Upload & submit | 1 hour |
| Apple review | 1-7 days |
| **Total** | **~2 weeks** |

---

## Checklist

- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID (com.grammarji.app)
- [ ] Generate certificates
- [ ] Update package.json with MAS config
- [ ] Create entitlements.mac.plist
- [ ] Create App Store Connect record
- [ ] Take 3+ screenshots
- [ ] Write app description
- [ ] Create privacy policy
- [ ] Host privacy policy online
- [ ] Build .pkg file
- [ ] Validate build
- [ ] Upload to App Store Connect
- [ ] Complete all metadata
- [ ] Submit for review
- [ ] Wait for approval
- [ ] Celebrate! 🎉

---

## Next Steps

1. **Immediate**: Sign up for Apple Developer Program
2. **While waiting**: Create privacy policy, take screenshots
3. **After approval**: Complete all configuration steps
4. **Final**: Build and submit

---

## Resources

- Apple Developer: https://developer.apple.com
- App Store Connect: https://appstoreconnect.apple.com
- Electron Builder MAS: https://www.electron.build/configuration/mas
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

---

## Support

If you encounter issues:
1. Check Electron Builder docs
2. Review Apple's guidelines
3. Check Console.app for errors
4. Test with mas-dev build first
