const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync('corpus/catalog/index.json', 'utf8'));

// 1. Sources stats
const sources = {};
for (const item of catalog) {
  const src = Array.isArray(item.sources) ? item.sources[0] : (item.source || 'unknown');
  sources[src] = (sources[src] || 0) + 1;
}

// 2. Exact Category Reclassification
const SUBCAT_PATTERNS = [
  { cat: 'buttons', patterns: ['button', 'btn', 'speeddial', 'fab'] },
  { cat: 'inputs-forms', patterns: ['input', 'form', 'textarea', 'textfield', 'dropzone', 'colorpicker', 'datepicker', 'timepicker', 'rating', 'autocomplete', 'searchfield', 'field', 'textbox', 'uploader', 'pininput', 'otp'] },
  { cat: 'selection', patterns: ['select', 'combobox', 'checkbox', 'radio', 'switch', 'slider', 'segmentedcontrol', 'chip', 'choice', 'picker', 'multiselect'] },
  { cat: 'navigation', patterns: ['nav', 'navbar', 'menu', 'menubar', 'tabs', 'tab', 'breadcrumb', 'sidebar', 'pagination', 'stepper', 'treeview', 'tree', 'dock', 'actionbar', 'anchor', 'link', 'bottomnav'] },
  { cat: 'overlays', patterns: ['dialog', 'modal', 'drawer', 'sheet', 'popover', 'tooltip', 'toast', 'snackbar', 'dropdown', 'lightbox', 'popup', 'alertdialog', 'hovercard'] },
  { cat: 'feedback', patterns: ['alert', 'progress', 'skeleton', 'spinner', 'badge', 'meter', 'banner', 'callout', 'loading', 'empty', 'indicator'] },
  { cat: 'data-display', patterns: ['table', 'card', 'list', 'avatar', 'stat', 'timeline', 'accordion', 'collapse', 'calendar', 'tag', 'kanban', 'datagrid', 'carousel', 'item', 'descriptionlist'] },
  { cat: 'charts', patterns: ['chart', 'graph', 'sparkline', 'radar', 'plot', 'barchart', 'linechart', 'piechart'] },
  { cat: 'layout', patterns: ['grid', 'bento', 'container', 'divider', 'separator', 'marquee', 'aspectratio', 'stack', 'flex', 'box', 'center', 'spacer', 'layout', 'pane', 'panel', 'col', 'row', 'absolutecenter'] },
  { cat: 'text-effects', patterns: ['text', 'typography', 'typing', 'scramble', 'ticker', 'number', 'counter', 'heading', 'title', 'font', 'wordrotate', 'sparkles'] },
  { cat: 'backgrounds', patterns: ['background', 'gradient', 'particle', 'pattern', 'canvas', 'mesh', 'ripple', 'star', 'gridpattern', 'dotpattern'] },
  { cat: 'cursors-and-pointer', patterns: ['cursor', 'pointer', 'mouse', 'magnet', 'glowcursor'] },
  { cat: 'scroll-and-parallax', patterns: ['scroll', 'parallax', 'sticky', 'velocity', 'scrollprogress'] },
  { cat: '3d-and-canvas', patterns: ['3d', 'canvas', 'three', 'globe', 'sphere', 'model', 'spline'] },
  { cat: 'hero-and-marketing-sections', patterns: ['hero', 'pricing', 'feature', 'faq', 'cta', 'footer', 'testimonial', 'newsletter', 'landing', 'header', 'logocloud'] },
  { cat: 'ai-chat', patterns: ['chat', 'ai', 'prompt', 'message', 'thread', 'assistant', 'composer', 'conversation', 'bot', 'speech'] },
  { cat: 'media', patterns: ['media', 'video', 'player', 'audio', 'image', 'gallery', 'picture', 'photo'] },
  { cat: 'icons-index', patterns: ['icon', 'glyph', 'symbol'] },
  { cat: 'hooks', patterns: ['use', 'hook'] },
  { cat: 'animation-primitives', patterns: ['animat', 'motion', 'transition', 'spring', 'stagger', 'fade', 'scale', 'slide'] },
];

const catBefore = {};
const catAfter = {};
const kindCounts = { component: 0, primitive: 0, block: 0, hook: 0, util: 0, 'icon-index': 0 };
const stylingCounts = { tailwind: 0, 'css-in-js': 0, 'css-modules': 0, unstyled: 0, mixed: 0 };
const previewCounts = { ready: 0, 'needs-demo': 0, primitive: 0, unsupported: 0 };

for (const item of catalog) {
  catBefore[item.category] = (catBefore[item.category] || 0) + 1;
  const src = Array.isArray(item.sources) ? item.sources[0] : (item.source || 'unknown');
  const lowerName = item.name.toLowerCase();
  const lowerId = item.id.toLowerCase();

  // Kind
  let kind = 'component';
  if (lowerId.startsWith('use-') || item.category === 'hooks' || lowerName.startsWith('use')) {
    kind = 'hook';
  } else if (
    lowerName.includes('stories') || lowerName.includes('test') || lowerName.endsWith('demo') ||
    lowerName.includes('portal') || lowerName.includes('context') || lowerName.includes('provider') ||
    lowerName.includes('root') || lowerName.includes('trigger') || lowerName.includes('content') ||
    lowerName.includes('item') || lowerName.includes('anchor') || lowerName.includes('arrow') ||
    lowerName.includes('visuallyhidden')
  ) {
    kind = 'primitive';
  } else if (
    lowerName.includes('pricing') || lowerName.includes('hero') || lowerName.includes('landing') ||
    lowerName.includes('dashboard') || lowerName.includes('newsletter') || lowerName.includes('section') ||
    lowerName.includes('bento-grid')
  ) {
    kind = 'block';
  } else if (item.category === 'icons-index' || lowerName.includes('icon-index')) {
    kind = 'icon-index';
  } else if (lowerName.includes('utils') || lowerName.includes('helper')) {
    kind = 'util';
  }
  kindCounts[kind]++;

  // Styling
  let styling = 'tailwind';
  if (src === 'mantine') styling = 'css-modules';
  else if (['mui', 'ant-design', 'chakra-ui'].includes(src)) styling = 'css-in-js';
  else if (['base-ui', 'ark-ui', 'react-aria', 'radix-ui'].includes(src)) styling = 'unstyled';
  else if (src === 'assistant-ui') styling = 'mixed';
  else styling = 'tailwind';
  stylingCounts[styling]++;

  // Preview status
  let preview = 'ready';
  if (kind === 'primitive' || kind === 'hook' || kind === 'util') {
    preview = 'primitive';
  } else if (styling === 'unstyled') {
    preview = 'needs-demo';
  } else if (['css-modules', 'css-in-js'].includes(styling)) {
    preview = 'unsupported';
  } else if (styling === 'mixed') {
    preview = 'needs-demo';
  } else {
    // Tailwind components
    preview = 'ready';
  }
  previewCounts[preview]++;

  // Reclassification
  let newCat = item.category;
  if (newCat === 'misc') {
    const normId = item.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    let matched = false;
    for (const { cat, patterns } of SUBCAT_PATTERNS) {
      if (patterns.some(p => normId.includes(p))) {
        newCat = cat;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const normName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const { cat, patterns } of SUBCAT_PATTERNS) {
        if (patterns.some(p => normName.includes(p))) {
          newCat = cat;
          matched = true;
          break;
        }
      }
    }
  }
  catAfter[newCat] = (catAfter[newCat] || 0) + 1;
}

const auditOutput = {
  catBefore,
  catAfter,
  kindCounts,
  stylingCounts,
  previewCounts,
  sources
};

fs.writeFileSync('scripts/audit-numbers.json', JSON.stringify(auditOutput, null, 2));
console.log('Saved audit numbers to scripts/audit-numbers.json');
