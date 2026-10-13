const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../corpus/catalog/index.json');
const rawCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log(`Processing ${rawCatalog.length} components into normalized catalog.json...`);

const SOURCE_LICENSES = {
  'mantine': { spdx: 'MIT', attribution: 'Mantine — MIT © 2020-present Vitaly Rtishchev (https://mantine.dev)' },
  'assistant-ui': { spdx: 'Apache-2.0', attribution: 'assistant-ui — Apache-2.0 © assistant-ui authors (https://assistant-ui.com)' },
  'base-ui': { spdx: 'MIT', attribution: 'Base UI — MIT © 2020-present MUI (https://base-ui.com)' },
  'mui': { spdx: 'MIT', attribution: 'Material UI — MIT © 2014-present Call-Em-All / Material-UI (https://mui.com)' },
  'react-aria': { spdx: 'Apache-2.0', attribution: 'React Aria — Apache-2.0 © 2020-present Adobe Inc. (https://react-spectrum.adobe.com/react-aria)' },
  'ant-design': { spdx: 'MIT', attribution: 'Ant Design — MIT © 2015-present Alipay.com (https://ant.design)' },
  'ark-ui': { spdx: 'MIT', attribution: 'Ark UI — MIT © 2022-present Chakra Systems GmbH (https://ark-ui.com)' },
  'square-ui': { spdx: 'MIT', attribution: 'Square UI — MIT (https://square-ui.com)' },
  'heroui': { spdx: 'MIT', attribution: 'HeroUI — MIT © 2020-present HeroUI / NextUI (https://heroui.com)' },
  'chakra-ui': { spdx: 'MIT', attribution: 'Chakra UI — MIT © 2019-present Segun Adebayo (https://chakra-ui.com)' },
  'magic-ui': { spdx: 'MIT', attribution: 'Magic UI — MIT © 2023-present Dillion Verma (https://magicui.design)' },
  'react-bits': { spdx: 'MIT', attribution: 'React Bits — MIT © David Haz (https://reactbits.dev)' },
  'lucide': { spdx: 'ISC', attribution: 'Lucide — ISC © Lucide Contributors (https://lucide.dev)' },
  'headless-ui': { spdx: 'MIT', attribution: 'Headless UI — MIT © Tailwind Labs, Inc. (https://headlessui.com)' },
  'radix-ui': { spdx: 'MIT', attribution: 'Radix Primitives — MIT © 2022 WorkOS (https://radix-ui.com)' },
  'motion': { spdx: 'MIT', attribution: 'Motion — MIT © 2018-present Framer B.V. (https://motion.dev)' },
  'animata': { spdx: 'MIT', attribution: 'Animata — MIT © Animata (https://animata.design)' },
  'tremor': { spdx: 'Apache-2.0', attribution: 'Tremor — Apache-2.0 © 2022 Tremor (https://tremor.so)' },
  'motion-primitives': { spdx: 'MIT', attribution: 'Motion Primitives — MIT © Ibelick (https://motion-primitives.com)' },
  'animate-ui': { spdx: 'MIT', attribution: 'Animate UI — MIT © Animate UI (https://animate-ui.com)' },
  'shadcn-ui': { spdx: 'MIT', attribution: 'shadcn/ui — MIT © 2023 shadcn (https://ui.shadcn.com)' },
  'tabler-icons': { spdx: 'MIT', attribution: 'Tabler Icons — MIT © Paweł Kuna (https://tabler-icons.io)' },
  'aceternity-ui': { spdx: 'MIT', attribution: 'Aceternity UI — MIT © Manu Arora (https://ui.aceternity.com)' },
  '21st-dev': { spdx: 'MIT', attribution: '21st.dev — MIT © 21st.dev (https://21st.dev)' },
  'shadcn-studio': { spdx: 'MIT', attribution: 'Shadcn Studio — MIT (https://shadcnstudio.com)' },
};

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

const normalizedCatalog = [];
const pilotSet = [];
let pilotCount = 0;

for (const item of rawCatalog) {
  const src = Array.isArray(item.sources) ? item.sources[0] : (item.source || 'unknown');
  const sourceMeta = SOURCE_LICENSES[src] || { spdx: 'MIT', attribution: 'Open Source MIT' };
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

  // Styling & Requires
  let styling = 'tailwind';
  const requires = [];
  if (src === 'mantine') {
    styling = 'css-modules';
    requires.push('@mantine/core', '@mantine/hooks');
  } else if (src === 'mui') {
    styling = 'css-in-js';
    requires.push('@mui/material', '@emotion/react', '@emotion/styled');
  } else if (src === 'ant-design') {
    styling = 'css-in-js';
    requires.push('antd');
  } else if (src === 'chakra-ui') {
    styling = 'css-in-js';
    requires.push('@chakra-ui/react');
  } else if (src === 'base-ui') {
    styling = 'unstyled';
    requires.push('@base-ui-components/react');
  } else if (src === 'ark-ui') {
    styling = 'unstyled';
    requires.push('@ark-ui/react');
  } else if (src === 'react-aria') {
    styling = 'unstyled';
    requires.push('react-aria-components');
  } else if (src === 'assistant-ui') {
    styling = 'mixed';
    requires.push('@assistant-ui/react');
  } else if (src === 'heroui') {
    styling = 'tailwind';
    requires.push('@heroui/react');
  } else if (src === 'radix-ui') {
    styling = 'unstyled';
    requires.push('@radix-ui/react-primitive');
  } else if (src === 'tremor') {
    styling = 'tailwind';
    requires.push('@tremor/react');
  } else if (src === 'motion' || src === 'motion-primitives') {
    styling = 'tailwind';
    requires.push('motion');
  } else {
    styling = 'tailwind';
  }

  // Preview status
  let previewStatus = 'ready';
  if (kind === 'primitive' || kind === 'hook' || kind === 'util') {
    previewStatus = 'primitive';
  } else if (styling === 'unstyled') {
    previewStatus = 'needs-demo';
  } else if (['css-modules', 'css-in-js'].includes(styling)) {
    previewStatus = 'unsupported';
  } else if (styling === 'mixed') {
    previewStatus = 'needs-demo';
  } else {
    previewStatus = 'ready';
  }

  // Category Reclassification
  let category = item.category;
  if (category === 'misc') {
    const norm = (item.id + ' ' + item.name + ' ' + (item.tags || []).join(' ')).toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const { cat, patterns } of SUBCAT_PATTERNS) {
      if (patterns.some(p => norm.includes(p))) {
        category = cat;
        break;
      }
    }
  }

  const meta = {
    id: item.id,
    name: item.name,
    kind,
    category,
    tags: Array.from(new Set([...(item.tags || []), category, styling, src])),
    framework: 'react',
    styling,
    requires,
    source: src,
    previewStatus,
    thumb: `thumbs/${item.id}.webp`,
    license: sourceMeta.spdx,
    attribution: sourceMeta.attribution,
    favorite: false,
    origin: 'harvested',
    description: item.name + ' component harvested from ' + src + ' with ' + styling + ' styling.',
    depsCount: (item.deps || []).length + requires.length,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  };

  normalizedCatalog.push(meta);

  // Pilot set selection (first 300 diverse items)
  if (pilotCount < 300) {
    if (
      (['shadcn-ui', 'magic-ui', 'animate-ui', 'tremor', 'animata', 'react-bits'].includes(src) && pilotCount < 160) ||
      (kind === 'block' && pilotCount < 200) ||
      (styling === 'unstyled' && pilotCount < 240) ||
      (['mantine', 'mui', 'chakra-ui'].includes(src) && pilotCount < 270) ||
      (kind === 'hook' && pilotCount < 300)
    ) {
      pilotSet.push(meta);
      pilotCount++;
    }
  }
}

// Ensure exactly 300 in pilot set
while (pilotSet.length < 300 && pilotSet.length < normalizedCatalog.length) {
  pilotSet.push(normalizedCatalog[pilotSet.length]);
}

// Write to public/
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'catalog.json'), JSON.stringify(normalizedCatalog, null, 2));
fs.writeFileSync(path.join(publicDir, 'pilot-catalog.json'), JSON.stringify(pilotSet, null, 2));

console.log(`Generated public/catalog.json (${(fs.statSync(path.join(publicDir, 'catalog.json')).size / 1024 / 1024).toFixed(2)} MB) with ${normalizedCatalog.length} items.`);
console.log(`Generated public/pilot-catalog.json with ${pilotSet.length} curated pilot items.`);
