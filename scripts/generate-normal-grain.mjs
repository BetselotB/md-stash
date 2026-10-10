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

// Generate seamless normal-blend fine grain tile
function generateNormalFineGrain(size, sigma = 38, blurRadius = 0.5, alphaScale = 0.27) {
  const data = new Float32Array(size * size);
  
  for (let i = 0; i < size * size; i++) {
    data[i] = gaussianRandom(128, sigma);
  }

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

  let mean = 0;
  for (let i = 0; i < size * size; i++) {
    mean += filtered[i];
  }
  mean /= (size * size);

  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < size * size; i++) {
    let diff = (filtered[i] - mean) * 1.15;
    const idx = i * 4;
    if (diff > 0) {
      // White highlight
      png.data[idx] = 255;
      png.data[idx + 1] = 255;
      png.data[idx + 2] = 255;
      png.data[idx + 3] = Math.min(255, Math.max(0, Math.round(diff * alphaScale)));
    } else if (diff < 0) {
      // Black shadow
      png.data[idx] = 0;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 0;
      png.data[idx + 3] = Math.min(255, Math.max(0, Math.round(-diff * alphaScale)));
    } else {
      png.data[idx] = 0;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 0;
      png.data[idx + 3] = 0;
    }
  }
  return png;
}

// Generate seamless normal-blend fleck tile
function generateNormalFleckTile(size, coveragePercent = 0.45, fleckAlphaScale = 0.22) {
  const png = new PNG({ width: size, height: size });
  
  // All transparent base
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    png.data[idx] = 0;
    png.data[idx + 1] = 0;
    png.data[idx + 2] = 0;
    png.data[idx + 3] = 0;
  }

  const numFlecks = Math.round((size * size * (coveragePercent / 100)) / 4);

  function setPx(x, y, alpha) {
    const px = (Math.round(x) + size) % size;
    const py = (Math.round(y) + size) % size;
    const idx = (py * size + px) * 4;
    png.data[idx] = 0;
    png.data[idx + 1] = 0;
    png.data[idx + 2] = 0;
    png.data[idx + 3] = Math.max(png.data[idx + 3], alpha);
  }

  for (let f = 0; f < numFlecks; f++) {
    const cx = Math.floor(Math.random() * size);
    const cy = Math.floor(Math.random() * size);
    const darkness = 75 + Math.floor(Math.random() * 40);
    const alpha = Math.round((128 - darkness) * fleckAlphaScale);
    const fleckSize = Math.random() < 0.7 ? 1 : (Math.random() < 0.6 ? 2 : 3);

    for (let dy = 0; dy < fleckSize; dy++) {
      for (let dx = 0; dx < fleckSize; dx++) {
        if (Math.random() > 0.2) {
          setPx(cx + dx, cy + dy, alpha);
        }
      }
    }
  }

  const numFibers = Math.round(size * 0.04);
  for (let b = 0; b < numFibers; b++) {
    let fx = Math.random() * size;
    let fy = Math.random() * size;
    let angle = Math.random() * Math.PI * 2;
    const fiberLen = 4 + Math.random() * 8;
    const fiberDarkness = 105 + Math.floor(Math.random() * 18);
    const alpha = Math.round((128 - fiberDarkness) * fleckAlphaScale);

    for (let s = 0; s < fiberLen; s++) {
      fx += Math.cos(angle);
      fy += Math.sin(angle);
      angle += (Math.random() - 0.5) * 0.35;
      setPx(fx, fy, alpha);
      if (Math.random() < 0.3) {
        setPx(fx + 1, fy, Math.max(0, alpha - 2));
      }
    }
  }

  return png;
}

const texturesDir = path.resolve('public/textures');
fs.writeFileSync(path.join(texturesDir, 'paper-fine.png'), PNG.sync.write(generateNormalFineGrain(512, 38, 0.5, 0.23)));
fs.writeFileSync(path.join(texturesDir, 'paper-fine@2x.png'), PNG.sync.write(generateNormalFineGrain(1024, 38, 0.5, 0.23)));
fs.writeFileSync(path.join(texturesDir, 'paper-fleck.png'), PNG.sync.write(generateNormalFleckTile(512, 0.45, 0.22)));
fs.writeFileSync(path.join(texturesDir, 'paper-fleck@2x.png'), PNG.sync.write(generateNormalFleckTile(1024, 0.45, 0.22)));
console.log('Generated normal-blend paper textures');
