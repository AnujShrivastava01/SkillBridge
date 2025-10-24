import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

async function generateMSTiles() {
  try {
    const sizes = [70, 150, 310];
    const sourceImage = path.resolve('public/SkillBridge512.png');
    
    for (const size of sizes) {
      const outputFile = path.resolve('public', `mstile-${size}x${size}.png`);
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(outputFile);
      console.log(`Generated ${outputFile}`);
    }
    
    console.log('✅ MSTiles generated successfully!');
  } catch (error) {
    console.error('❌ Error generating MSTiles:', error);
    process.exit(1);
  }
}

generateMSTiles();
