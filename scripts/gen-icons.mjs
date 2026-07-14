// Regenerate PWA PNG icons from the source SVGs: `node scripts/gen-icons.mjs`
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const src = readFileSync('icons-src/icon-src.svg');
const mask = readFileSync('icons-src/icon-maskable.svg');

await sharp(src).resize(192, 192).png().toFile('static/icon-192.png');
await sharp(src).resize(512, 512).png().toFile('static/icon-512.png');
await sharp(src).resize(180, 180).png().toFile('static/apple-touch-icon.png');
await sharp(mask).resize(192, 192).png().toFile('static/icon-maskable-192.png');
await sharp(mask).resize(512, 512).png().toFile('static/icon-maskable.png');
console.log('Icons regenerated.');
