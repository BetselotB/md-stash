import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const refPath = path.resolve('reference/brewdistrict-hero.png');
if (!fs.existsSync(refPath)) {
  console.error(`Reference image not found at ${refPath}`);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(refPath);
const png = PNG.sync.read(fileBuffer);
console.log(`Loaded reference image: ${png.width}x${png.height}`);

// 1. Sage background patch (multiple clean patches away from can, badge, and text)
function sampleArea(x, y, w, h, name) {
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  const lums = [];

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px >= 0 && px < png.width && py >= 0 && py < png.height) {
        const idx = (png.width * py + px) * 4;
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        rSum += r;
        gSum += g;
        bSum += b;
        count++;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lums.push(lum);
      }
    }
  }

  const rAvg = Math.round(rSum / count);
  const gAvg = Math.round(gSum / count);
  const bAvg = Math.round(bSum / count);
  const lumMean = lums.reduce((a, b) => a + b, 0) / count;
  const lumVar = lums.reduce((a, b) => a + (b - lumMean) ** 2, 0) / count;
  const lumStd = Math.sqrt(lumVar);
  const hex = '#' + [rAvg, gAvg, bAvg].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();

  console.log(`--- ${name} ---`);
  console.log(`Sampled: [${x}, ${y}, ${w}x${h}] (${count} px)`);
  console.log(`RGB: rgb(${rAvg}, ${gAvg}, ${bAvg}) | Hex: ${hex} | Lum StdDev: ${lumStd.toFixed(2)}`);
  return { rAvg, gAvg, bAvg, hex, lumStd, lumMean };
}

// Sage background patch
const sage = sampleArea(200, 300, 60, 60, 'Sage Background Patch');

// Cream text core
let creamR = 0, creamG = 0, creamB = 0, creamCount = 0;
const creamLums = [];
for (let y = 100; y < 350; y++) {
  for (let x = 100; x < 900; x++) {
    const idx = (png.width * y + x) * 4;
    const r = png.data[idx], g = png.data[idx + 1], b = png.data[idx + 2];
    if (r > 240 && g > 238 && b > 220) {
      creamR += r; creamG += g; creamB += b; creamCount++;
      creamLums.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
    }
  }
}
const creamRAvg = Math.round(creamR / creamCount);
const creamGAvg = Math.round(creamG / creamCount);
const creamBAvg = Math.round(creamB / creamCount);
const creamMean = creamLums.reduce((a, b) => a + b, 0) / creamCount;
const creamStd = Math.sqrt(creamLums.reduce((a, b) => a + (b - creamMean) ** 2, 0) / creamCount);
const creamHex = '#' + [creamRAvg, creamGAvg, creamBAvg].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();

console.log(`\n--- Headline Cream Core ---`);
console.log(`RGB: rgb(${creamRAvg}, ${creamGAvg}, ${creamBAvg}) | Hex: ${creamHex} | Lum StdDev: ${creamStd.toFixed(2)} (${creamCount} px)`);

// Orange pill core
let orgR = 0, orgG = 0, orgB = 0, orgCount = 0;
for (let y = 10; y < 60; y++) {
  for (let x = 750; x < 830; x++) {
    const idx = (png.width * y + x) * 4;
    const r = png.data[idx], g = png.data[idx + 1], b = png.data[idx + 2];
    if (r > 230 && g > 165 && g < 195 && b > 75 && b < 105) {
      orgR += r; orgG += g; orgB += b; orgCount++;
    }
  }
}
const orgRAvg = Math.round(orgR / orgCount);
const orgGAvg = Math.round(orgG / orgCount);
const orgBAvg = Math.round(orgB / orgCount);
const orgHex = '#' + [orgRAvg, orgGAvg, orgBAvg].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();

console.log(`\n--- Orange Pill Core ---`);
console.log(`RGB: rgb(${orgRAvg}, ${orgGAvg}, ${orgBAvg}) | Hex: ${orgHex} (${orgCount} px)`);

console.log('\n================ MEASURED TOKENS ================');
console.log(`--sage: ${sage.hex}; /* rgb(${sage.rAvg}, ${sage.gAvg}, ${sage.bAvg}) */`);
console.log(`--cream: ${creamHex}; /* rgb(${creamRAvg}, ${creamGAvg}, ${creamBAvg}) */`);
console.log(`--orange: ${orgHex}; /* rgb(${orgRAvg}, ${orgGAvg}, ${orgBAvg}) */`);
