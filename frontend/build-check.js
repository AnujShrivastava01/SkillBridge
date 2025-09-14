#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build requirements...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ dist directory does not exist');
  process.exit(1);
}

// Check if index.html exists in dist
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('❌ index.html not found in dist directory');
  process.exit(1);
}

// Check if manifest.json exists in dist
const manifestPath = path.join(distPath, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log('❌ manifest.json not found in dist directory');
  process.exit(1);
}

// Check if service worker exists in dist
const swPath = path.join(distPath, 'sw.js');
if (!fs.existsSync(swPath)) {
  console.log('❌ sw.js not found in dist directory');
  process.exit(1);
}

// Check if logo files exist in dist
const logo192Path = path.join(distPath, 'SkillBridge192.png');
const logo512Path = path.join(distPath, 'SkillBridge512.png');

if (!fs.existsSync(logo192Path)) {
  console.log('❌ SkillBridge192.png not found in dist directory');
  process.exit(1);
}

if (!fs.existsSync(logo512Path)) {
  console.log('❌ SkillBridge512.png not found in dist directory');
  process.exit(1);
}

console.log('✅ All build requirements met!');
console.log('📁 Build output directory: dist/');
console.log('📄 Files found:');
console.log('  - index.html');
console.log('  - manifest.json');
console.log('  - sw.js');
console.log('  - SkillBridge192.png');
console.log('  - SkillBridge512.png');
