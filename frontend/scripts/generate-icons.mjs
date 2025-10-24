import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateIcons() {
  try {
    const sourceImage = join(__dirname, '../public/SkillBridge512.png');
    const outputDir = join(__dirname, '../public');
    
    // Create favicon.ico
    await sharp(sourceImage)
      .resize(32, 32)
      .toFile(join(outputDir, 'favicon.ico'));

    // Create favicon-16x16.png
    await sharp(sourceImage)
      .resize(16, 16)
      .toFile(join(outputDir, 'favicon-16x16.png'));

    // Create favicon-32x32.png
    await sharp(sourceImage)
      .resize(32, 32)
      .toFile(join(outputDir, 'favicon-32x32.png'));

    // Create apple-touch-icon.png (180x180)
    await sharp(sourceImage)
      .resize(180, 180)
      .toFile(join(outputDir, 'apple-touch-icon.png'));

    // Create icon-192x192.png
    await sharp(sourceImage)
      .resize(192, 192)
      .toFile(join(outputDir, 'icon-192x192.png'));

    // Create icon-512x512.png
    await sharp(sourceImage)
      .resize(512, 512)
      .toFile(join(outputDir, 'icon-512x512.png'));

    // Create safari-pinned-tab.svg (simplified, just using the original as base)
    await fs.copyFile(
      sourceImage,
      join(outputDir, 'safari-pinned-tab.svg')
    );

    console.log('✅ Icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
