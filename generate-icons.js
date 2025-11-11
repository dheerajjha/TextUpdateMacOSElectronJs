const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_IMAGE = path.join(__dirname, 'assets', 'logo.png');
const ASSETS_DIR = path.join(__dirname, 'assets');

// Icon sizes needed
const iconSizes = {
  // macOS icon sizes
  mac: [16, 32, 64, 128, 256, 512, 1024],
  // Windows icon sizes
  win: [16, 24, 32, 48, 64, 96, 128, 256],
  // Tray icon sizes
  tray: [16, 32],
  // App icons
  app: [256, 512, 1024]
};

async function generateIcons() {
  console.log('🎨 Generating icons from logo.png...');

  try {
    // Ensure assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // Generate standard app icon sizes
    console.log('\n📱 Generating app icons...');
    for (const size of iconSizes.app) {
      const outputPath = path.join(ASSETS_DIR, `icon-${size}.png`);
      await sharp(INPUT_IMAGE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`  ✓ Generated ${size}x${size} icon`);
    }

    // Generate main icon.png (512x512 for Linux and general use)
    console.log('\n🐧 Generating Linux icon...');
    await sharp(INPUT_IMAGE)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(ASSETS_DIR, 'icon.png'));
    console.log('  ✓ Generated icon.png (512x512)');

    // Generate tray icons
    console.log('\n📌 Generating tray icons...');
    for (const size of iconSizes.tray) {
      const outputPath = path.join(ASSETS_DIR, `tray-icon${size === 32 ? '@2x' : ''}.png`);
      await sharp(INPUT_IMAGE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`  ✓ Generated tray icon ${size}x${size}`);
    }

    // Create iconset directory for macOS
    console.log('\n🍎 Preparing macOS iconset...');
    const iconsetDir = path.join(ASSETS_DIR, 'icon.iconset');
    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir, { recursive: true });
    }

    // Generate macOS iconset images
    const macIconSizes = [
      { size: 16, name: 'icon_16x16.png' },
      { size: 32, name: 'icon_16x16@2x.png' },
      { size: 32, name: 'icon_32x32.png' },
      { size: 64, name: 'icon_32x32@2x.png' },
      { size: 128, name: 'icon_128x128.png' },
      { size: 256, name: 'icon_128x128@2x.png' },
      { size: 256, name: 'icon_256x256.png' },
      { size: 512, name: 'icon_256x256@2x.png' },
      { size: 512, name: 'icon_512x512.png' },
      { size: 1024, name: 'icon_512x512@2x.png' }
    ];

    for (const { size, name } of macIconSizes) {
      const outputPath = path.join(iconsetDir, name);
      await sharp(INPUT_IMAGE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`  ✓ Generated ${name}`);
    }

    console.log('\n✅ Icon generation complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run: iconutil -c icns assets/icon.iconset -o assets/icon.icns');
    console.log('  2. Windows .ico will be generated automatically by electron-builder during build');
    console.log('  3. All tray and app icons are ready to use');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
