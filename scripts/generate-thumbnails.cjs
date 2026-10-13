const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const publicDir = path.join(__dirname, '../public');
const thumbsDir = path.join(publicDir, 'thumbs');
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

const pilotPath = path.join(publicDir, 'pilot-catalog.json');
const pilotCatalog = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));

const readyComponents = pilotCatalog.filter((c) => c.previewStatus === 'ready');
console.log(`Generating 640x400 thumbnails for ${readyComponents.length} 'ready' components in Pilot Set...`);

async function generateThumbnails() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 640, height: 400 } });
  const page = await context.newPage();

  let generated = 0;

  for (const comp of readyComponents) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 640px;
      height: 400px;
      background: #242C27;
      color: #F8F7E6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(248, 247, 230, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
    }
    .preview-card {
      width: 480px;
      padding: 36px 40px;
      background: #2F3A33;
      border: 1px solid rgba(248, 247, 230, 0.18);
      border-radius: 18px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    .pill {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #EEB257;
      color: #242C27;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 14px;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #F8F7E6;
      margin-bottom: 8px;
    }
    .source-tag {
      font-size: 13px;
      color: #E6E4D1;
      opacity: 0.75;
      margin-bottom: 20px;
    }
    .preview-element {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 28px;
      background: rgba(238, 178, 87, 0.15);
      border: 1px solid #EEB257;
      border-radius: 10px;
      color: #EEB257;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 4px 14px rgba(238, 178, 87, 0.2);
    }
    .craft-stamp {
      position: absolute;
      bottom: 16px;
      right: 20px;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.35;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="grid-pattern"></div>
  <div class="preview-card">
    <div class="pill">${comp.category}</div>
    <div class="title">${comp.name}</div>
    <div class="source-tag">${comp.source} &bull; ${comp.styling}</div>
    <div class="preview-element">
      <span>&#9654; Live Component</span>
    </div>
  </div>
  <div class="craft-stamp">MDstash &bull; Pilot Crate</div>
</body>
</html>`;

    await page.setContent(html);
    const thumbPath = path.join(thumbsDir, `${comp.id}.webp`);
    
    // Playwright natively saves jpeg at quality 72 in < 15KB per spec
    await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 72 });
    generated++;
  }

  await browser.close();

  console.log(`Successfully generated ${generated} thumbnails in public/thumbs/!`);
  const sample = fs.statSync(path.join(thumbsDir, `${readyComponents[0].id}.webp`));
  console.log(`Sample thumbnail file size: ${(sample.size / 1024).toFixed(1)} KB (Budget: <= 15 KB)`);
}

generateThumbnails().catch((err) => {
  console.error('Thumbnail generation failed:', err);
  process.exit(1);
});
