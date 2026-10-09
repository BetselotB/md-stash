import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// Box-Muller gaussian generator
function gaussianRandom(mean, sigma) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * sigma;
}

// Generate seamless fine grain tile
function generateFineGrain(size, sigma, blurRadius = 0.5) {
  const data = new Float32Array(size * size);
  
  // 1. Raw Gaussian noise centered at 128
  for (let i = 0; i < size * size; i++) {
    data[i] = gaussianRandom(128, sigma);
  }

  // 2. Seamless blur with wrap-around
  const filtered = new Float32Array(size * size);
  const wCenter = 1.0;
  const wNeighbor = blurRadius * 0.5;
  const wCorner = blurRadius * 0.25;
  const totalWeight = wCenter + 4 * wNeighbor + 4 * wCorner;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const px = (x + dx + size) % size;
          const py = (y + dy + size) % size;
          let weight = wCenter;
          if (Math.abs(dx) + Math.abs(dy) === 1) weight = wNeighbor;
          else if (Math.abs(dx) + Math.abs(dy) === 2) weight = wCorner;
          sum += data[py * size + px] * weight;
        }
      }
      filtered[y * size + x] = sum / totalWeight;
    }
  }

  // 3. Contrast boost + exact mean-neutral centering to 128.00
  let mean = 0;
  for (let i = 0; i < size * size; i++) {
    mean += filtered[i];
  }
  mean /= (size * size);

  const png = new PNG({ width: size, height: size });
  let finalMean = 0;
  for (let i = 0; i < size * size; i++) {
    // Center at 128 and slightly boost contrast
    let v = 128 + (filtered[i] - mean) * 1.15;
    v = Math.min(255, Math.max(0, Math.round(v)));
    finalMean += v;

    const idx = i * 4;
    png.data[idx] = v;     // R
    png.data[idx + 1] = v; // G
    png.data[idx + 2] = v; // B
    png.data[idx + 3] = 255; // A
  }
  finalMean /= (size * size);
  console.log(`Fine grain ${size}x${size}: mean = ${finalMean.toFixed(2)}, sigma = ${sigma}`);
  return png;
}

// Generate seamless fleck & fiber tile
function generateFleckTile(size, coveragePercent = 0.45) {
  const png = new PNG({ width: size, height: size });
  
  // Base is neutral 128
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    png.data[idx] = 128;
    png.data[idx + 1] = 128;
    png.data[idx + 2] = 128;
    png.data[idx + 3] = 255;
  }

  const numFlecks = Math.round((size * size * (coveragePercent / 100)) / 4);

  // Helper to draw seamless pixel
  function setPx(x, y, val) {
    const px = (Math.round(x) + size) % size;
    const py = (Math.round(y) + size) % size;
    const idx = (py * size + px) * 4;
    png.data[idx] = Math.min(png.data[idx], val);
    png.data[idx + 1] = Math.min(png.data[idx + 1], val);
    png.data[idx + 2] = Math.min(png.data[idx + 2], val);
  }

  // Draw irregular tiny flecks (1-3px)
  for (let f = 0; f < numFlecks; f++) {
    const cx = Math.floor(Math.random() * size);
    const cy = Math.floor(Math.random() * size);
    const darkness = 75 + Math.floor(Math.random() * 40); // 75..115
    const fleckSize = Math.random() < 0.7 ? 1 : (Math.random() < 0.6 ? 2 : 3);

    for (let dy = 0; dy < fleckSize; dy++) {
      for (let dx = 0; dx < fleckSize; dx++) {
        if (Math.random() > 0.2) {
          const falloff = darkness + Math.floor(Math.random() * 20);
          setPx(cx + dx, cy + dy, falloff);
        }
      }
    }
  }

  // Draw subtle fibers (fine curved strokes, ~20 fibers across 512x512)
  const numFibers = Math.round(size * 0.04);
  for (let b = 0; b < numFibers; b++) {
    let fx = Math.random() * size;
    let fy = Math.random() * size;
    let angle = Math.random() * Math.PI * 2;
    const fiberLen = 4 + Math.random() * 8; // 4 to 12 px
    const fiberDarkness = 105 + Math.floor(Math.random() * 18); // subtle 105..123

    for (let s = 0; s < fiberLen; s++) {
      fx += Math.cos(angle);
      fy += Math.sin(angle);
      angle += (Math.random() - 0.5) * 0.35; // gently curve
      setPx(fx, fy, fiberDarkness);
      // Faint halo
      if (Math.random() < 0.3) {
        setPx(fx + 1, fy, Math.min(125, fiberDarkness + 10));
      }
    }
  }

  let mean = 0;
  for (let i = 0; i < size * size; i++) {
    mean += png.data[i * 4];
  }
  mean /= (size * size);
  console.log(`Fleck tile ${size}x${size}: mean = ${mean.toFixed(2)}`);
  return png;
}

const texturesDir = path.resolve('public/textures');
fs.mkdirSync(texturesDir, { recursive: true });

// 1. Fine grain 512x512 and 1024x1024
const fine1x = generateFineGrain(512, 38, 0.5);
fs.writeFileSync(path.join(texturesDir, 'paper-fine.png'), PNG.sync.write(fine1x));

const fine2x = generateFineGrain(1024, 38, 0.5);
fs.writeFileSync(path.join(texturesDir, 'paper-fine@2x.png'), PNG.sync.write(fine2x));

// 2. Fleck tile 512x512 and 1024x1024
const fleck1x = generateFleckTile(512, 0.45);
fs.writeFileSync(path.join(texturesDir, 'paper-fleck.png'), PNG.sync.write(fleck1x));

const fleck2x = generateFleckTile(1024, 0.45);
fs.writeFileSync(path.join(texturesDir, 'paper-fleck@2x.png'), PNG.sync.write(fleck2x));

console.log('Successfully generated paper textures in public/textures/');
