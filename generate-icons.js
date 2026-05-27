import sharp from 'sharp';
import { Buffer } from 'buffer';

const svgBase = (size, fontSize, textY) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.16}" fill="#15803d"/>
  <text x="${size/2}" y="${textY}" font-size="${fontSize}" text-anchor="middle"
    fill="white" font-family="serif">த</text>
</svg>`);

async function run() {
  await sharp(svgBase(192, 110, 135)).resize(192, 192).png().toFile('public/icons/icon-192.png');
  await sharp(svgBase(512, 300, 360)).resize(512, 512).png().toFile('public/icons/icon-512.png');
  await sharp(svgBase(192, 110, 135)).resize(32,  32 ).png().toFile('public/favicon.ico');
  console.log('✓ All icons generated');
}

run().catch(console.error);