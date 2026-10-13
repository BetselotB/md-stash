const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../corpus/catalog/index.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('Auditing 8,072 components...');

const results = {
  total: catalog.length,
  originalCategories: {},
  reclassifiedCategories: {},
  kindDistribution: {
    component: 0,
    primitive: 0,
    block: 0,
    hook: 0,
    util: 0,
    style: 0,
    'icon-index': 0,
  },
  stylingTruth: {
    tailwind: 0,
    'css-in-js': 0,
    'css-modules': 0,
    mixed: 0,
    css: 0,
    unstyled: 0
  },
  requiresMap: {},
  licensesMap: {},
};

// Source license mapping
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

// Refined Category Mapping Keywords
const CATEGORY_RULES = [
  { cat: 'buttons', re: /\b(button|btn|toggle-button|icon-button|split-button|speed-dial|fab)\b/i },
  { cat: 'inputs-forms', re: /\b(input|form|textarea|text-field|pin-input|otp|file-upload|dropzone|color-picker|date-picker|time-picker|rating|autocomplete|search-field)\b/i },
  { cat: 'selection', re: /\b(select|combobox|checkbox|radio|switch|slider|segmented-control|chip|multi-select|choice)\b/i },
  { cat: 'navigation', re: /\b(nav|navbar|menu|menubar|navigation-menu|tabs|breadcrumb|sidebar|pagination|stepper|tree-view|dock|bottom-nav|action-bar|anchor)\b/i },
  { cat: 'overlays', re: /\b(dialog|modal|drawer|sheet|popover|tooltip|toast|snackbar|dropdown|alert-dialog|hover-card|lightbox|context-menu)\b/i },
  { cat: 'feedback', re: /\b(alert|progress|skeleton|spinner|badge|meter|banner|callout|loading|empty-state)\b/i },
  { cat: 'data-display', re: /\b(table|datatable|card|list|avatar|stats|stat|statistic|timeline|accordion|collapse|calendar|tag|description-list|badge|kanban)\b/i },
  { cat: 'charts', re: /\b(chart|graph|barchart|linechart|piechart|donut|treemap|sparkline|radar|area-chart)\b/i },
  { cat: 'layout', re: /\b(grid|bento|container|divider|separator|marquee|aspect-ratio|stack|flex|box|center|absolute-center|spacer|wrap|group)\b/i },
  { cat: 'text-effects', re: /\b(text-effect|scramble|typing|flip-text|word-rotate|sparkles-text|wavy-text|blur-in|gradual-spacing|number-ticker|counter)\b/i },
  { cat: 'backgrounds', re: /\b(background|gradient|particles|dot-pattern|grid-pattern|warp-background|flickering-grid|ripple|rays|stripes|mesh)\b/i },
  { cat: 'cursors-and-pointer', re: /\b(cursor|pointer|follow-cursor|mouse-trail|magnet|glow-cursor)\b/i },
  { cat: 'scroll-and-parallax', re: /\b(scroll|parallax|sticky|scroll-progress|smooth-scroll|wheel|velocity|scroll-spy)\b/i },
  { cat: '3d-and-canvas', re: /\b(3d|canvas|three|spline|globe|model|shader|webgl|cube)\b/i },
  { cat: 'hero-and-marketing-sections', re: /\b(hero|pricing|feature|faq|cta|footer|testimonial|newsletter|compare|logo-cloud|header-section)\b/i },
  { cat: 'ai-chat', re: /\b(chat|ai-|prompt|message|thread|assistant|composer|attachment|suggestion|speech|transcription)\b/i },
  { cat: 'media', re: /\b(carousel|slider-media|video|player|audio|image-zoom|gallery|lightbox|compare-image)\b/i },
  { cat: 'icons-index', re: /\b(icon|icons|symbol|glyphs)\b/i },
  { cat: 'hooks', re: /\b(use-|hook)\b/i },
  { cat: 'animation-primitives', re: /\b(animate|animation|transition|fade|scale|slide|motion-|spring|stagger)\b/i },
];

let miscCountBefore = 0;
let miscCountAfter = 0;

for (const item of catalog) {
  results.originalCategories[item.category] = (results.originalCategories[item.category] || 0) + 1;
  if (item.category === 'misc') miscCountBefore++;

  const src = Array.isArray(item.sources) ? item.sources[0] : (item.source || 'unknown');
  const sourceMeta = SOURCE_LICENSES[src] || { spdx: 'MIT', attribution: 'Open Source MIT' };
  results.licensesMap[sourceMeta.spdx] = (results.licensesMap[sourceMeta.spdx] || 0) + 1;

  // Determine Kind
  const lowerName = item.name.toLowerCase();
  const lowerId = item.id.toLowerCase();
  let kind = 'component';

  if (lowerId.startsWith('use-') || item.category === 'hooks' || lowerName.startsWith('use')) {
    kind = 'hook';
  } else if (
    lowerName.includes('stories') ||
    lowerName.includes('test') ||
    lowerName.endsWith('demo') ||
    lowerName.includes('portal') ||
    lowerName.includes('context') ||
    lowerName.includes('provider') ||
    lowerName.includes('root') ||
    lowerName.includes('trigger') ||
    lowerName.includes('content') ||
    lowerName.includes('item') ||
    lowerName.includes('anchor') ||
    lowerName.includes('arrow') ||
    lowerName.includes('visuallyhidden')
  ) {
    kind = 'primitive';
  } else if (
    lowerName.includes('pricing') ||
    lowerName.includes('hero') ||
    lowerName.includes('landing') ||
    lowerName.includes('dashboard') ||
    lowerName.includes('newsletter') ||
    lowerName.includes('section') ||
    lowerName.includes('bento-grid')
  ) {
    kind = 'block';
  } else if (item.category === 'icons-index' || lowerName.includes('icon-index')) {
    kind = 'icon-index';
  } else if (lowerName.includes('utils') || lowerName.includes('helper')) {
    kind = 'util';
  }
  results.kindDistribution[kind]++;

  // Determine Styling truth and Requirements
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
  results.stylingTruth[styling]++;
  for (const req of requires) {
    results.requiresMap[req] = (results.requiresMap[req] || 0) + 1;
  }

  // Reclassify category if misc
  let targetCategory = item.category;
  if (targetCategory === 'misc') {
    const textToMatch = `${item.id} ${item.name} ${(item.tags || []).join(' ')}`;
    for (const rule of CATEGORY_RULES) {
      if (rule.re.test(textToMatch)) {
        targetCategory = rule.cat;
        break;
      }
    }
  }
  results.reclassifiedCategories[targetCategory] = (results.reclassifiedCategories[targetCategory] || 0) + 1;
  if (targetCategory === 'misc') miscCountAfter++;
}

console.log('--- Results Summary ---');
console.log('Misc before:', miscCountBefore, `(${(miscCountBefore / catalog.length * 100).toFixed(1)}%)`);
console.log('Misc after rule mapping:', miscCountAfter, `(${(miscCountAfter / catalog.length * 100).toFixed(1)}%)`);
console.log('\n--- Kind distribution ---');
console.log(results.kindDistribution);
console.log('\n--- Styling truth ---');
console.log(results.stylingTruth);
console.log('\n--- Top Requires ---');
console.log(Object.entries(results.requiresMap).sort((a,b)=>b[1]-a[1]).slice(0, 10));
console.log('\n--- Licenses Map ---');
console.log(results.licensesMap);
console.log('\n--- Reclassified categories top 10 ---');
console.log(Object.entries(results.reclassifiedCategories).sort((a,b)=>b[1]-a[1]).slice(0, 10));
