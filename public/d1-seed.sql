CREATE TABLE IF NOT EXISTS components (
  id TEXT PRIMARY KEY,
  name TEXT,
  kind TEXT,
  category TEXT,
  subcategory TEXT,
  tags TEXT,
  framework TEXT,
  styling TEXT,
  requires TEXT,
  deps TEXT,
  depends_on TEXT,
  shared TEXT,
  description TEXT,
  license TEXT,
  favorite INTEGER,
  origin TEXT,
  preview_status TEXT,
  thumb_key TEXT,
  body_key TEXT,
  content_hash TEXT,
  updated_at INTEGER,
  version INTEGER
);

CREATE VIRTUAL TABLE IF NOT EXISTS components_fts USING fts5(
  id,
  name,
  tags,
  category,
  description,
  requires,
  tokenize='porter unicode61'
);

CREATE TABLE IF NOT EXISTS kits (
  slug TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  items TEXT,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  name TEXT,
  hash TEXT,
  scope TEXT,
  created_at INTEGER,
  last_used INTEGER,
  revoked INTEGER
);

CREATE TABLE IF NOT EXISTS usage (
  ts INTEGER,
  token_id TEXT,
  client TEXT,
  tool TEXT,
  component_id TEXT,
  query TEXT,
  hits INTEGER,
  ms INTEGER
);

CREATE TABLE IF NOT EXISTS wishlist (
  id TEXT PRIMARY KEY,
  query TEXT,
  description TEXT,
  count INTEGER,
  status TEXT,
  first_seen INTEGER,
  last_seen INTEGER
);


-- Component Seed Inserts
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    '3d',
    '3D',
    'component',
    '3d-and-canvas',
    '["3d-and-canvas","react","tailwind","3d","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    '3D component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/3d.webp',
    'r/3d.json',
    'hash-3d',
    1791914006004,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'cubes',
    'Cubes',
    'component',
    '3d-and-canvas',
    '["3d-and-canvas","react","tailwind","cubes","react-bits"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Cubes component harvested from react-bits with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/cubes.webp',
    'r/cubes.json',
    'hash-cubes',
    1791914006009,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'globe',
    'Globe',
    'component',
    '3d-and-canvas',
    '["3d-and-canvas","react","tailwind","globe","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Globe component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/globe.webp',
    'r/globe.json',
    'hash-globe',
    1791914006012,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'globe-demo',
    'Globe Demo',
    'primitive',
    '3d-and-canvas',
    '["3d-and-canvas","react","tailwind","globe-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Globe Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/globe-demo.webp',
    'r/globe-demo.json',
    'hash-globe-demo',
    1791914006023,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'chat--react-aria',
    'Chat',
    'component',
    'ai-chat',
    '["ai-chat","react","tailwind","chat","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Chat component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/chat--react-aria.webp',
    'r/chat--react-aria.json',
    'hash-chat--react-aria',
    1791914006029,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'useassistanttransportruntime-fast-refresh-test',
    'UseAssistantTransportRuntime.fast Refresh.test',
    'hook',
    'ai-chat',
    '["ai-chat","react","tailwind","useassistanttransportruntime.fast-refresh.test","mixed","assistant-ui"]',
    'react',
    'mixed',
    '["@assistant-ui/react"]',
    '["@assistant-ui/react"]',
    '[]',
    '["utils/cn"]',
    'UseAssistantTransportRuntime.fast Refresh.test component harvested from assistant-ui with mixed styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/useassistanttransportruntime-fast-refresh-test.webp',
    'r/useassistanttransportruntime-fast-refresh-test.json',
    'hash-useassistanttransportruntime-fast-refresh-test',
    1791914006034,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'useassistanttransportruntime-test',
    'UseAssistantTransportRuntime.test',
    'hook',
    'ai-chat',
    '["ai-chat","react","tailwind","useassistanttransportruntime.test","mixed","assistant-ui"]',
    'react',
    'mixed',
    '["@assistant-ui/react"]',
    '["@assistant-ui/react"]',
    '[]',
    '["utils/cn"]',
    'UseAssistantTransportRuntime.test component harvested from assistant-ui with mixed styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/useassistanttransportruntime-test.webp',
    'r/useassistanttransportruntime-test.json',
    'hash-useassistanttransportruntime-test',
    1791914006039,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'usemessage',
    'UseMessage',
    'hook',
    'ai-chat',
    '["ai-chat","react","tailwind","usemessage","css-in-js","ant-design"]',
    'react',
    'css-in-js',
    '["antd"]',
    '["antd"]',
    '[]',
    '["utils/cn"]',
    'UseMessage component harvested from ant-design with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/usemessage.webp',
    'r/usemessage.json',
    'hash-usemessage',
    1791914006042,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'usethreadviewportautoscroll-test',
    'UseThreadViewportAutoScroll.test',
    'hook',
    'ai-chat',
    '["ai-chat","react","tailwind","usethreadviewportautoscroll.test","mixed","assistant-ui"]',
    'react',
    'mixed',
    '["@assistant-ui/react"]',
    '["@assistant-ui/react"]',
    '[]',
    '["utils/cn"]',
    'UseThreadViewportAutoScroll.test component harvested from assistant-ui with mixed styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/usethreadviewportautoscroll-test.webp',
    'r/usethreadviewportautoscroll-test.json',
    'hash-usethreadviewportautoscroll-test',
    1791914006046,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'blur-fade',
    'Blur Fade',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","blur-fade","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Blur Fade component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/blur-fade.webp',
    'r/blur-fade.json',
    'hash-blur-fade',
    1791914006052,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'blur-fade-demo',
    'Blur Fade Demo',
    'primitive',
    'animation-primitives',
    '["animation-primitives","react","tailwind","blur-fade-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Blur Fade Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/blur-fade-demo.webp',
    'r/blur-fade-demo.json',
    'hash-blur-fade-demo',
    1791914006055,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-animate-code',
    'Components Animate Code',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","components-animate-code","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Animate Code component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-animate-code.webp',
    'r/components-animate-code.json',
    'hash-components-animate-code',
    1791914006058,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'fademenu',
    'FadeMenu',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","fademenu","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'FadeMenu component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/fademenu.webp',
    'r/fademenu.json',
    'hash-fademenu',
    1791914006061,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'loadingbuttonstransition',
    'LoadingButtonsTransition',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","loadingbuttonstransition","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'LoadingButtonsTransition component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/loadingbuttonstransition.webp',
    'r/loadingbuttonstransition.json',
    'hash-loadingbuttonstransition',
    1791914006064,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'springpopper',
    'SpringPopper',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","springpopper","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'SpringPopper component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/springpopper.webp',
    'r/springpopper.json',
    'hash-springpopper',
    1791914006071,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'transition--mantine',
    'Transition',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","transition","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Transition component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/transition--mantine.webp',
    'r/transition--mantine.json',
    'hash-transition--mantine',
    1791914006074,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'transition--mui',
    'Transition',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","transition","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Transition component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/transition--mui.webp',
    'r/transition--mui.json',
    'hash-transition--mui',
    1791914006077,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'transition-demo-custom',
    'Transition.demo.custom',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","transition.demo.custom","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Transition.demo.custom component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/transition-demo-custom.webp',
    'r/transition-demo-custom.json',
    'hash-transition-demo-custom',
    1791914006080,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'transition-spec',
    'Transition.spec',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","transition.spec","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Transition.spec component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/transition-spec.webp',
    'r/transition-spec.json',
    'hash-transition-spec',
    1791914006087,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'transition-story',
    'Transition.story',
    'component',
    'animation-primitives',
    '["animation-primitives","react","tailwind","transition.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Transition.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/transition-story.webp',
    'r/transition-story.json',
    'hash-transition-story',
    1791914006090,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'transition-test--mantine',
    'Transition.test',
    'primitive',
    'animation-primitives',
    '["animation-primitives","react","tailwind","transition.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Transition.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/transition-test--mantine.webp',
    'r/transition-test--mantine.json',
    'hash-transition-test--mantine',
    1791914006092,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'transition-test--mui',
    'Transition.test',
    'primitive',
    'animation-primitives',
    '["animation-primitives","react","tailwind","transition.test","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Transition.test component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/transition-test--mui.webp',
    'r/transition-test--mui.json',
    'hash-transition-test--mui',
    1791914006103,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'animated-beam',
    'Animated Beam',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","animated-beam","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Animated Beam component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/animated-beam.webp',
    'r/animated-beam.json',
    'hash-animated-beam',
    1791914006105,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'animated-beam-bidirectional',
    'Animated Beam Bidirectional',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","animated-beam-bidirectional","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Animated Beam Bidirectional component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/animated-beam-bidirectional.webp',
    'r/animated-beam-bidirectional.json',
    'hash-animated-beam-bidirectional',
    1791914006108,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'animated-beam-unidirectional',
    'Animated Beam Unidirectional',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","animated-beam-unidirectional","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Animated Beam Unidirectional component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/animated-beam-unidirectional.webp',
    'r/animated-beam-unidirectional.json',
    'hash-animated-beam-unidirectional',
    1791914006111,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'backgroundletteravatars',
    'BackgroundLetterAvatars',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","backgroundletteravatars","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'BackgroundLetterAvatars component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/backgroundletteravatars.webp',
    'r/backgroundletteravatars.json',
    'hash-backgroundletteravatars',
    1791914006114,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'border-beam',
    'Border Beam',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","border-beam","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Border Beam component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/border-beam.webp',
    'r/border-beam.json',
    'hash-border-beam',
    1791914006120,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'border-beam-demo-2',
    'Border Beam Demo 2',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","border-beam-demo-2","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Border Beam Demo 2 component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/border-beam-demo-2.webp',
    'r/border-beam-demo-2.json',
    'hash-border-beam-demo-2',
    1791914006122,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'border-beam-demo-3',
    'Border Beam Demo 3',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","border-beam-demo-3","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Border Beam Demo 3 component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/border-beam-demo-3.webp',
    'r/border-beam-demo-3.json',
    'hash-border-beam-demo-3',
    1791914006125,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'border-beam-demo-4',
    'Border Beam Demo 4',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","border-beam-demo-4","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Border Beam Demo 4 component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/border-beam-demo-4.webp',
    'r/border-beam-demo-4.json',
    'hash-border-beam-demo-4',
    1791914006127,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-animate-github-stars-wheel',
    'Components Animate Github Stars Wheel',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","components-animate-github-stars-wheel","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Animate Github Stars Wheel component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-animate-github-stars-wheel.webp',
    'r/components-animate-github-stars-wheel.json',
    'hash-components-animate-github-stars-wheel',
    1791914006130,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-backgrounds-bubble',
    'Components Backgrounds Bubble',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","components-backgrounds-bubble","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Backgrounds Bubble component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-backgrounds-bubble.webp',
    'r/components-backgrounds-bubble.json',
    'hash-components-backgrounds-bubble',
    1791914006136,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-backgrounds-gravity-stars',
    'Components Backgrounds Gravity Stars',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","components-backgrounds-gravity-stars","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Backgrounds Gravity Stars component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-backgrounds-gravity-stars.webp',
    'r/components-backgrounds-gravity-stars.json',
    'hash-components-backgrounds-gravity-stars',
    1791914006140,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-backgrounds-stars',
    'Components Backgrounds Stars',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","components-backgrounds-stars","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Backgrounds Stars component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-backgrounds-stars.webp',
    'r/components-backgrounds-stars.json',
    'hash-components-backgrounds-stars',
    1791914006142,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'confetti-stars',
    'Confetti Stars',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","confetti-stars","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Confetti Stars component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/confetti-stars.webp',
    'r/confetti-stars.json',
    'hash-confetti-stars',
    1791914006145,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'dotsmobilestepper',
    'DotsMobileStepper',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","dotsmobilestepper","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'DotsMobileStepper component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/dotsmobilestepper.webp',
    'r/dotsmobilestepper.json',
    'hash-dotsmobilestepper',
    1791914006147,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'floating-3d-particles',
    'Floating 3d Particles',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","floating-3d-particles","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Floating 3d Particles component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/floating-3d-particles.webp',
    'r/floating-3d-particles.json',
    'hash-floating-3d-particles',
    1791914006156,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'floating-3d-particles-demo',
    'Floating 3d Particles Demo',
    'primitive',
    'backgrounds',
    '["backgrounds","react","tailwind","floating-3d-particles-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Floating 3d Particles Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/floating-3d-particles-demo.webp',
    'r/floating-3d-particles-demo.json',
    'hash-floating-3d-particles-demo',
    1791914006159,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'floating-3d-particles-demo-2',
    'Floating 3d Particles Demo 2',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","floating-3d-particles-demo-2","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Floating 3d Particles Demo 2 component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/floating-3d-particles-demo-2.webp',
    'r/floating-3d-particles-demo-2.json',
    'hash-floating-3d-particles-demo-2',
    1791914006162,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'it-supports-background-props',
    'It Supports Background Props',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","it-supports-background-props","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'It Supports Background Props component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/it-supports-background-props.webp',
    'r/it-supports-background-props.json',
    'hash-it-supports-background-props',
    1791914006164,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'meteors',
    'Meteors',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","meteors","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Meteors component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/meteors.webp',
    'r/meteors.json',
    'hash-meteors',
    1791914006172,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'meteors-demo',
    'Meteors Demo',
    'primitive',
    'backgrounds',
    '["backgrounds","react","tailwind","meteors-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Meteors Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/meteors-demo.webp',
    'r/meteors-demo.json',
    'hash-meteors-demo',
    1791914006175,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'particles',
    'Particles',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","particles","react-bits"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Particles component harvested from react-bits with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/particles.webp',
    'r/particles.json',
    'hash-particles',
    1791914006178,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'particles--magic-ui',
    'Particles',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","particles","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Particles component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/particles--magic-ui.webp',
    'r/particles--magic-ui.json',
    'hash-particles--magic-ui',
    1791914006181,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'warp-background',
    'Warp Background',
    'component',
    'backgrounds',
    '["backgrounds","react","tailwind","warp-background","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Warp Background component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/warp-background.webp',
    'r/warp-background.json',
    'hash-warp-background',
    1791914006187,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'warp-background-demo',
    'Warp Background Demo',
    'primitive',
    'backgrounds',
    '["backgrounds","react","tailwind","warp-background-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Warp Background Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/warp-background-demo.webp',
    'r/warp-background-demo.json',
    'hash-warp-background-demo',
    1791914006190,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'actionbutton-stories',
    'ActionButton.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","actionbutton.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'ActionButton.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/actionbutton-stories.webp',
    'r/actionbutton-stories.json',
    'hash-actionbutton-stories',
    1791914006193,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'actionbutton-stories--react-aria',
    'ActionButton.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","actionbutton.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'ActionButton.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/actionbutton-stories--react-aria.webp',
    'r/actionbutton-stories--react-aria.json',
    'hash-actionbutton-stories--react-aria',
    1791914006196,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'actionbuttonlanguages-stories',
    'ActionButtonLanguages.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","actionbuttonlanguages.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'ActionButtonLanguages.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/actionbuttonlanguages-stories.webp',
    'r/actionbuttonlanguages-stories.json',
    'hash-actionbuttonlanguages-stories',
    1791914006206,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'animated-subscribe-button',
    'Animated Subscribe Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","animated-subscribe-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Animated Subscribe Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/animated-subscribe-button.webp',
    'r/animated-subscribe-button.json',
    'hash-animated-subscribe-button',
    1791914006210,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'basicbuttongroup',
    'BasicButtonGroup',
    'component',
    'buttons',
    '["buttons","react","tailwind","basicbuttongroup","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'BasicButtonGroup component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/basicbuttongroup.webp',
    'r/basicbuttongroup.json',
    'hash-basicbuttongroup',
    1791914006213,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","shadcn-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from shadcn-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/button.webp',
    'r/button.json',
    'hash-button',
    1791914006220,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--animata',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","animata"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from animata with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/button--animata.webp',
    'r/button--animata.json',
    'hash-button--animata',
    1791914006225,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--ark-ui',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/button--ark-ui.webp',
    'r/button--ark-ui.json',
    'hash-button--ark-ui',
    1791914006228,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--base-ui',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/button--base-ui.webp',
    'r/button--base-ui.json',
    'hash-button--base-ui',
    1791914006231,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--base-ui-2',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/button--base-ui-2.webp',
    'r/button--base-ui-2.json',
    'hash-button--base-ui-2',
    1791914006238,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--base-ui-3',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/button--base-ui-3.webp',
    'r/button--base-ui-3.json',
    'hash-button--base-ui-3',
    1791914006241,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--chakra-ui',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button--chakra-ui.webp',
    'r/button--chakra-ui.json',
    'hash-button--chakra-ui',
    1791914006244,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--chakra-ui-2',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button--chakra-ui-2.webp',
    'r/button--chakra-ui-2.json',
    'hash-button--chakra-ui-2',
    1791914006247,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--mantine',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button--mantine.webp',
    'r/button--mantine.json',
    'hash-button--mantine',
    1791914006253,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--mui',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button--mui.webp',
    'r/button--mui.json',
    'hash-button--mui',
    1791914006256,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button--react-aria',
    'Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","button","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Button component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/button--react-aria.webp',
    'r/button--react-aria.json',
    'hash-button--react-aria',
    1791914006259,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-autocontrast',
    'Button.demo.autoContrast',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.autocontrast","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.autoContrast component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-autocontrast.webp',
    'r/button-demo-autocontrast.json',
    'hash-button-demo-autocontrast',
    1791914006261,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-compact',
    'Button.demo.compact',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.compact","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.compact component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-compact.webp',
    'r/button-demo-compact.json',
    'hash-button-demo-compact',
    1791914006264,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-customvariant',
    'Button.demo.customVariant',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.customvariant","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.customVariant component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-customvariant.webp',
    'r/button-demo-customvariant.json',
    'hash-button-demo-customvariant',
    1791914006270,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-disabledstyles',
    'Button.demo.disabledStyles',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.disabledstyles","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.disabledStyles component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-disabledstyles.webp',
    'r/button-demo-disabledstyles.json',
    'hash-button-demo-disabledstyles',
    1791914006273,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-disabledtooltip',
    'Button.demo.disabledTooltip',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.disabledtooltip","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.disabledTooltip component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-disabledtooltip.webp',
    'r/button-demo-disabledtooltip.json',
    'hash-button-demo-disabledtooltip',
    1791914006277,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-group',
    'Button.demo.group',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.group","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.group component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-group.webp',
    'r/button-demo-group.json',
    'hash-button-demo-group',
    1791914006280,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-groupsection',
    'Button.demo.groupSection',
    'block',
    'buttons',
    '["buttons","react","tailwind","button.demo.groupsection","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.groupSection component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-groupsection.webp',
    'r/button-demo-groupsection.json',
    'hash-button-demo-groupsection',
    1791914006286,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-loaderprops',
    'Button.demo.loaderProps',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.loaderprops","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.loaderProps component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-loaderprops.webp',
    'r/button-demo-loaderprops.json',
    'hash-button-demo-loaderprops',
    1791914006290,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-loading',
    'Button.demo.loading',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.demo.loading","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.loading component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-loading.webp',
    'r/button-demo-loading.json',
    'hash-button-demo-loading',
    1791914006294,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-sections',
    'Button.demo.sections',
    'block',
    'buttons',
    '["buttons","react","tailwind","button.demo.sections","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.sections component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-sections.webp',
    'r/button-demo-sections.json',
    'hash-button-demo-sections',
    1791914006297,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-demo-sectionsjustify',
    'Button.demo.sectionsJustify',
    'block',
    'buttons',
    '["buttons","react","tailwind","button.demo.sectionsjustify","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.demo.sectionsJustify component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-demo-sectionsjustify.webp',
    'r/button-demo-sectionsjustify.json',
    'hash-button-demo-sectionsjustify',
    1791914006304,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-group',
    'Button Group',
    'component',
    'buttons',
    '["buttons","react","tailwind","button-group","shadcn-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Button Group component harvested from shadcn-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/button-group.webp',
    'r/button-group.json',
    'hash-button-group',
    1791914006307,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-spec',
    'Button.spec',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.spec","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Button.spec component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/button-spec.webp',
    'r/button-spec.json',
    'hash-button-spec',
    1791914006310,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-spec--mui',
    'Button.spec',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.spec","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Button.spec component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-spec--mui.webp',
    'r/button-spec--mui.json',
    'hash-button-spec--mui',
    1791914006313,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-stories--react-aria',
    'Button.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","button.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Button.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/button-stories--react-aria.webp',
    'r/button-stories--react-aria.json',
    'hash-button-stories--react-aria',
    1791914006319,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-stories--react-aria-2',
    'Button.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","button.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Button.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/button-stories--react-aria-2.webp',
    'r/button-stories--react-aria-2.json',
    'hash-button-stories--react-aria-2',
    1791914006322,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-stories--react-aria-3',
    'Button.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","button.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Button.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/button-stories--react-aria-3.webp',
    'r/button-stories--react-aria-3.json',
    'hash-button-stories--react-aria-3',
    1791914006325,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-story',
    'Button.story',
    'component',
    'buttons',
    '["buttons","react","tailwind","button.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Button.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/button-story.webp',
    'r/button-story.json',
    'hash-button-story',
    1791914006328,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'button-test--base-ui',
    'Button.test',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","button.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Button.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/button-test--base-ui.webp',
    'r/button-test--base-ui.json',
    'hash-button-test--base-ui',
    1791914006331,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'buttonappbar',
    'ButtonAppBar',
    'component',
    'buttons',
    '["buttons","react","tailwind","buttonappbar","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ButtonAppBar component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/buttonappbar.webp',
    'r/buttonappbar.json',
    'hash-buttonappbar',
    1791914006338,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'buttongroupsection',
    'ButtonGroupSection',
    'block',
    'buttons',
    '["buttons","react","tailwind","buttongroupsection","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'ButtonGroupSection component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/buttongroupsection.webp',
    'r/buttongroupsection.json',
    'hash-buttongroupsection',
    1791914006341,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'buttonlink',
    'ButtonLink',
    'component',
    'buttons',
    '["buttons","react","tailwind","buttonlink","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ButtonLink component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/buttonlink.webp',
    'r/buttonlink.json',
    'hash-buttonlink',
    1791914006344,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'clearbutton',
    'ClearButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","clearbutton","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'ClearButton component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/clearbutton.webp',
    'r/clearbutton.json',
    'hash-clearbutton',
    1791914006347,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'close-button',
    'Close Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","close-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Close Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/close-button.webp',
    'r/close-button.json',
    'hash-close-button',
    1791914006353,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'close-button--chakra-ui',
    'Close Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","close-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Close Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/close-button--chakra-ui.webp',
    'r/close-button--chakra-ui.json',
    'hash-close-button--chakra-ui',
    1791914006356,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'close-button--chakra-ui-2',
    'Close Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","close-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Close Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/close-button--chakra-ui-2.webp',
    'r/close-button--chakra-ui-2.json',
    'hash-close-button--chakra-ui-2',
    1791914006358,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'color-mode-button',
    'Color Mode Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","color-mode-button","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Color Mode Button component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/color-mode-button.webp',
    'r/color-mode-button.json',
    'hash-color-mode-button',
    1791914006362,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'colortogglebutton',
    'ColorToggleButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","colortogglebutton","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ColorToggleButton component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/colortogglebutton.webp',
    'r/colortogglebutton.json',
    'hash-colortogglebutton',
    1791914006364,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'combobox-demo-button',
    'Combobox.demo.button',
    'component',
    'buttons',
    '["buttons","react","tailwind","combobox.demo.button","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Combobox.demo.button component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/combobox-demo-button.webp',
    'r/combobox-demo-button.json',
    'hash-combobox-demo-button',
    1791914006372,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-buttons-ripple',
    'Components Buttons Ripple',
    'component',
    'buttons',
    '["buttons","react","tailwind","components-buttons-ripple","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Buttons Ripple component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-buttons-ripple.webp',
    'r/components-buttons-ripple.json',
    'hash-components-buttons-ripple',
    1791914006375,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-community-share-button',
    'Components Community Share Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","components-community-share-button","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Community Share Button component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-community-share-button.webp',
    'r/components-community-share-button.json',
    'hash-components-community-share-button',
    1791914006378,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'copy-button',
    'Copy Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","copy-button","animata"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Copy Button component harvested from animata with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/copy-button.webp',
    'r/copy-button.json',
    'hash-copy-button',
    1791914006388,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'copy-button--chakra-ui',
    'Copy Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","copy-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Copy Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/copy-button--chakra-ui.webp',
    'r/copy-button--chakra-ui.json',
    'hash-copy-button--chakra-ui',
    1791914006391,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'copy-button--magic-ui',
    'Copy Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","copy-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Copy Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/copy-button--magic-ui.webp',
    'r/copy-button--magic-ui.json',
    'hash-copy-button--magic-ui',
    1791914006394,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'copy-to-clipboard-button',
    'Copy To Clipboard Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","copy-to-clipboard-button","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Copy To Clipboard Button component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/copy-to-clipboard-button.webp',
    'r/copy-to-clipboard-button.json',
    'hash-copy-to-clipboard-button',
    1791914006396,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'css-modules--base-ui-16',
    'Css Modules',
    'component',
    'buttons',
    '["buttons","react","tailwind","css-modules","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Css Modules component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/css-modules--base-ui-16.webp',
    'r/css-modules--base-ui-16.json',
    'hash-css-modules--base-ui-16',
    1791914006402,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'css-modules--base-ui-4',
    'Css Modules',
    'component',
    'buttons',
    '["buttons","react","tailwind","css-modules","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Css Modules component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/css-modules--base-ui-4.webp',
    'r/css-modules--base-ui-4.json',
    'hash-css-modules--base-ui-4',
    1791914006406,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'customizeddividers',
    'CustomizedDividers',
    'component',
    'buttons',
    '["buttons","react","tailwind","customizeddividers","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'CustomizedDividers component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/customizeddividers.webp',
    'r/customizeddividers.json',
    'hash-customizeddividers',
    1791914006409,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'disableelevation',
    'DisableElevation',
    'component',
    'buttons',
    '["buttons","react","tailwind","disableelevation","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'DisableElevation component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/disableelevation.webp',
    'r/disableelevation.json',
    'hash-disableelevation',
    1791914006411,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'edit-page-button',
    'Edit Page Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","edit-page-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Edit Page Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/edit-page-button.webp',
    'r/edit-page-button.json',
    'hash-edit-page-button',
    1791914006414,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'floatingactionbuttonextendedsize',
    'FloatingActionButtonExtendedSize',
    'component',
    'buttons',
    '["buttons","react","tailwind","floatingactionbuttonextendedsize","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'FloatingActionButtonExtendedSize component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/floatingactionbuttonextendedsize.webp',
    'r/floatingactionbuttonextendedsize.json',
    'hash-floatingactionbuttonextendedsize',
    1791914006425,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'floatingactionbuttons',
    'FloatingActionButtons',
    'component',
    'buttons',
    '["buttons","react","tailwind","floatingactionbuttons","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'FloatingActionButtons component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/floatingactionbuttons.webp',
    'r/floatingactionbuttons.json',
    'hash-floatingactionbuttons',
    1791914006429,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'floatingactionbuttonsize',
    'FloatingActionButtonSize',
    'component',
    'buttons',
    '["buttons","react","tailwind","floatingactionbuttonsize","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'FloatingActionButtonSize component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/floatingactionbuttonsize.webp',
    'r/floatingactionbuttonsize.json',
    'hash-floatingactionbuttonsize',
    1791914006436,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'floatingactionbuttonzoom',
    'FloatingActionButtonZoom',
    'component',
    'buttons',
    '["buttons","react","tailwind","floatingactionbuttonzoom","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'FloatingActionButtonZoom component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/floatingactionbuttonzoom.webp',
    'r/floatingactionbuttonzoom.json',
    'hash-floatingactionbuttonzoom',
    1791914006460,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'grouporientation',
    'GroupOrientation',
    'component',
    'buttons',
    '["buttons","react","tailwind","grouporientation","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'GroupOrientation component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/grouporientation.webp',
    'r/grouporientation.json',
    'hash-grouporientation',
    1791914006463,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'horizontalspacingtogglebutton',
    'HorizontalSpacingToggleButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","horizontalspacingtogglebutton","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'HorizontalSpacingToggleButton component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/horizontalspacingtogglebutton.webp',
    'r/horizontalspacingtogglebutton.json',
    'hash-horizontalspacingtogglebutton',
    1791914006469,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'icon-button--chakra-ui',
    'Icon Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","icon-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Icon Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/icon-button--chakra-ui.webp',
    'r/icon-button--chakra-ui.json',
    'hash-icon-button--chakra-ui',
    1791914006472,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'interactive-hover-button',
    'Interactive Hover Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","interactive-hover-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Interactive Hover Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/interactive-hover-button.webp',
    'r/interactive-hover-button.json',
    'hash-interactive-hover-button',
    1791914006475,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'link-button',
    'Link Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","link-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Link Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/link-button.webp',
    'r/link-button.json',
    'hash-link-button',
    1791914006478,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'loadingbuttongroup',
    'LoadingButtonGroup',
    'component',
    'buttons',
    '["buttons","react","tailwind","loadingbuttongroup","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'LoadingButtonGroup component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/loadingbuttongroup.webp',
    'r/loadingbuttongroup.json',
    'hash-loadingbuttongroup',
    1791914006480,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'logicbutton',
    'LogicButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","logicbutton","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'LogicButton component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/logicbutton.webp',
    'r/logicbutton.json',
    'hash-logicbutton',
    1791914006488,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'logicbutton-stories',
    'LogicButton.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","logicbutton.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'LogicButton.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/logicbutton-stories.webp',
    'r/logicbutton-stories.json',
    'hash-logicbutton-stories',
    1791914006492,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'logicbutton-stories--react-aria',
    'LogicButton.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","logicbutton.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'LogicButton.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/logicbutton-stories--react-aria.webp',
    'r/logicbutton-stories--react-aria.json',
    'hash-logicbutton-stories--react-aria',
    1791914006496,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'logo-button',
    'Logo Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","logo-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Logo Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/logo-button.webp',
    'r/logo-button.json',
    'hash-logo-button',
    1791914006500,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'open-in-v0-button',
    'Open In V0 Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","open-in-v0-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Open In V0 Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/open-in-v0-button.webp',
    'r/open-in-v0-button.json',
    'hash-open-in-v0-button',
    1791914006506,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'pulsating-button',
    'Pulsating Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","pulsating-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Pulsating Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/pulsating-button.webp',
    'r/pulsating-button.json',
    'hash-pulsating-button',
    1791914006515,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'pulsating-button-demo',
    'Pulsating Button Demo',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","pulsating-button-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Pulsating Button Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/pulsating-button-demo.webp',
    'r/pulsating-button-demo.json',
    'hash-pulsating-button-demo',
    1791914006527,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'pulsating-button-demo-2',
    'Pulsating Button Demo 2',
    'component',
    'buttons',
    '["buttons","react","tailwind","pulsating-button-demo-2","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Pulsating Button Demo 2 component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/pulsating-button-demo-2.webp',
    'r/pulsating-button-demo-2.json',
    'hash-pulsating-button-demo-2',
    1791914006530,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'radio-button-group',
    'Radio Button Group',
    'component',
    'buttons',
    '["buttons","react","tailwind","radio-button-group","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Radio Button Group component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/radio-button-group.webp',
    'r/radio-button-group.json',
    'hash-radio-button-group',
    1791914006537,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'rainbow-button',
    'Rainbow Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","rainbow-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Rainbow Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/rainbow-button.webp',
    'r/rainbow-button.json',
    'hash-rainbow-button',
    1791914006541,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'rainbow-button-demo-2',
    'Rainbow Button Demo 2',
    'component',
    'buttons',
    '["buttons","react","tailwind","rainbow-button-demo-2","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Rainbow Button Demo 2 component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/rainbow-button-demo-2.webp',
    'r/rainbow-button-demo-2.json',
    'hash-rainbow-button-demo-2',
    1791914006544,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'reload-button',
    'Reload Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","reload-button","animata"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Reload Button component harvested from animata with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/reload-button.webp',
    'r/reload-button.json',
    'hash-reload-button',
    1791914006547,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'ripple',
    'Ripple',
    'component',
    'buttons',
    '["buttons","react","tailwind","ripple","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Ripple component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/ripple.webp',
    'r/ripple.json',
    'hash-ripple',
    1791914006554,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'ripple-button',
    'Ripple Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","ripple-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Ripple Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/ripple-button.webp',
    'r/ripple-button.json',
    'hash-ripple-button',
    1791914006558,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'ripple-button-demo',
    'Ripple Button Demo',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","ripple-button-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Ripple Button Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/ripple-button-demo.webp',
    'r/ripple-button-demo.json',
    'hash-ripple-button-demo',
    1791914006561,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'ripple-demo',
    'Ripple Demo',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","ripple-demo","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Ripple Demo component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/ripple-demo.webp',
    'r/ripple-demo.json',
    'hash-ripple-demo',
    1791914006564,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'scrollabletabsbuttonforce',
    'ScrollableTabsButtonForce',
    'component',
    'buttons',
    '["buttons","react","tailwind","scrollabletabsbuttonforce","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ScrollableTabsButtonForce component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/scrollabletabsbuttonforce.webp',
    'r/scrollabletabsbuttonforce.json',
    'hash-scrollabletabsbuttonforce',
    1791914006570,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'scrollabletabsbuttonvisible',
    'ScrollableTabsButtonVisible',
    'component',
    'buttons',
    '["buttons","react","tailwind","scrollabletabsbuttonvisible","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ScrollableTabsButtonVisible component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/scrollabletabsbuttonvisible.webp',
    'r/scrollabletabsbuttonvisible.json',
    'hash-scrollabletabsbuttonvisible',
    1791914006575,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'search-button',
    'Search Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","search-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Search Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/search-button.webp',
    'r/search-button.json',
    'hash-search-button',
    1791914006581,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'shimmer-button',
    'Shimmer Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","shimmer-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Shimmer Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/shimmer-button.webp',
    'r/shimmer-button.json',
    'hash-shimmer-button',
    1791914006614,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'shiny-button',
    'Shiny Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","shiny-button","magic-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Shiny Button component harvested from magic-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/shiny-button.webp',
    'r/shiny-button.json',
    'hash-shiny-button',
    1791914006624,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'sign-in-button',
    'Sign In Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","sign-in-button","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Sign In Button component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/sign-in-button.webp',
    'r/sign-in-button.json',
    'hash-sign-in-button',
    1791914006628,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'sign-out-button',
    'Sign Out Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","sign-out-button","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Sign Out Button component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/sign-out-button.webp',
    'r/sign-out-button.json',
    'hash-sign-out-button',
    1791914006631,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'splitbutton',
    'SplitButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","splitbutton","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'SplitButton component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/splitbutton.webp',
    'r/splitbutton.json',
    'hash-splitbutton',
    1791914006643,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'sponsor-button',
    'Sponsor Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","sponsor-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Sponsor Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/sponsor-button.webp',
    'r/sponsor-button.json',
    'hash-sponsor-button',
    1791914006646,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'stackblitz-button',
    'Stackblitz Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","stackblitz-button","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Stackblitz Button component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/stackblitz-button.webp',
    'r/stackblitz-button.json',
    'hash-stackblitz-button',
    1791914006656,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'standalonetogglebutton',
    'StandaloneToggleButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","standalonetogglebutton","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'StandaloneToggleButton component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/standalonetogglebutton.webp',
    'r/standalonetogglebutton.json',
    'hash-standalonetogglebutton',
    1791914006662,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'submit-button',
    'Submit Button',
    'component',
    'buttons',
    '["buttons","react","tailwind","submit-button","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Submit Button component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/submit-button.webp',
    'r/submit-button.json',
    'hash-submit-button',
    1791914006670,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'tailwind--base-ui-12',
    'Tailwind',
    'component',
    'buttons',
    '["buttons","react","tailwind","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Tailwind component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/tailwind--base-ui-12.webp',
    'r/tailwind--base-ui-12.json',
    'hash-tailwind--base-ui-12',
    1791914006676,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'tailwind--base-ui-6',
    'Tailwind',
    'component',
    'buttons',
    '["buttons","react","tailwind","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Tailwind component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/tailwind--base-ui-6.webp',
    'r/tailwind--base-ui-6.json',
    'hash-tailwind--base-ui-6',
    1791914006678,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'togglebutton',
    'ToggleButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","togglebutton","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'ToggleButton component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/togglebutton.webp',
    'r/togglebutton.json',
    'hash-togglebutton',
    1791914006681,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'togglebutton-stories',
    'ToggleButton.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","togglebutton.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'ToggleButton.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/togglebutton-stories.webp',
    'r/togglebutton-stories.json',
    'hash-togglebutton-stories',
    1791914006691,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'togglebutton-stories--react-aria',
    'ToggleButton.stories',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","togglebutton.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'ToggleButton.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/togglebutton-stories--react-aria.webp',
    'r/togglebutton-stories--react-aria.json',
    'hash-togglebutton-stories--react-aria',
    1791914006696,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'togglebuttonnotempty',
    'ToggleButtonNotEmpty',
    'component',
    'buttons',
    '["buttons","react","tailwind","togglebuttonnotempty","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ToggleButtonNotEmpty component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/togglebuttonnotempty.webp',
    'r/togglebuttonnotempty.json',
    'hash-togglebuttonnotempty',
    1791914006707,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'togglebuttons',
    'ToggleButtons',
    'component',
    'buttons',
    '["buttons","react","tailwind","togglebuttons","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ToggleButtons component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/togglebuttons.webp',
    'r/togglebuttons.json',
    'hash-togglebuttons',
    1791914006711,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'togglebuttonsizes',
    'ToggleButtonSizes',
    'component',
    'buttons',
    '["buttons","react","tailwind","togglebuttonsizes","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ToggleButtonSizes component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/togglebuttonsizes.webp',
    'r/togglebuttonsizes.json',
    'hash-togglebuttonsizes',
    1791914006714,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'toolbarbutton',
    'ToolbarButton',
    'component',
    'buttons',
    '["buttons","react","tailwind","toolbarbutton","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'ToolbarButton component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/toolbarbutton.webp',
    'r/toolbarbutton.json',
    'hash-toolbarbutton',
    1791914006720,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'toolbarbutton-test',
    'ToolbarButton.test',
    'primitive',
    'buttons',
    '["buttons","react","tailwind","toolbarbutton.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'ToolbarButton.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/toolbarbutton-test.webp',
    'r/toolbarbutton-test.json',
    'hash-toolbarbutton-test',
    1791914006724,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'usebutton-test',
    'UseButton.test',
    'hook',
    'buttons',
    '["buttons","react","tailwind","usebutton.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'UseButton.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/usebutton-test.webp',
    'r/usebutton-test.json',
    'hash-usebutton-test',
    1791914006728,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'user-button',
    'User Button',
    'hook',
    'buttons',
    '["buttons","react","tailwind","user-button","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'User Button component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/user-button.webp',
    'r/user-button.json',
    'hash-user-button',
    1791914006731,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'variantbuttongroup',
    'VariantButtonGroup',
    'component',
    'buttons',
    '["buttons","react","tailwind","variantbuttongroup","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'VariantButtonGroup component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/variantbuttongroup.webp',
    'r/variantbuttongroup.json',
    'hash-variantbuttongroup',
    1791914006738,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'verticaltogglebuttons',
    'VerticalToggleButtons',
    'component',
    'buttons',
    '["buttons","react","tailwind","verticaltogglebuttons","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'VerticalToggleButtons component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/verticaltogglebuttons.webp',
    'r/verticaltogglebuttons.json',
    'hash-verticaltogglebuttons',
    1791914006742,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'chart',
    'Chart',
    'component',
    'charts',
    '["charts","react","tailwind","chart","shadcn-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Chart component harvested from shadcn-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/chart.webp',
    'r/chart.json',
    'hash-chart',
    1791914006745,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'chart--chakra-ui',
    'Chart',
    'component',
    'charts',
    '["charts","react","tailwind","chart","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Chart component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/chart--chakra-ui.webp',
    'r/chart--chakra-ui.json',
    'hash-chart--chakra-ui',
    1791914006749,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'radar',
    'Radar',
    'component',
    'charts',
    '["charts","react","tailwind","radar","react-bits"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Radar component harvested from react-bits with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/radar.webp',
    'r/radar.json',
    'hash-radar',
    1791914006757,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'components-animate-cursor',
    'Components Animate Cursor',
    'component',
    'cursors-and-pointer',
    '["cursors-and-pointer","react","tailwind","components-animate-cursor","animate-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Components Animate Cursor component harvested from animate-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/components-animate-cursor.webp',
    'r/components-animate-cursor.json',
    'hash-components-animate-cursor',
    1791914006761,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'crosshair',
    'Crosshair',
    'component',
    'cursors-and-pointer',
    '["cursors-and-pointer","react","tailwind","crosshair","react-bits"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Crosshair component harvested from react-bits with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'ready',
    'thumbs/crosshair.webp',
    'r/crosshair.json',
    'hash-crosshair',
    1791914006764,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'followcursortooltips',
    'FollowCursorTooltips',
    'component',
    'cursors-and-pointer',
    '["cursors-and-pointer","react","tailwind","followcursortooltips","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'FollowCursorTooltips component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/followcursortooltips.webp',
    'r/followcursortooltips.json',
    'hash-followcursortooltips',
    1791914006773,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-follow-value-test',
    'Use Follow Value.test',
    'hook',
    'cursors-and-pointer',
    '["cursors-and-pointer","react","tailwind","use-follow-value.test","motion"]',
    'react',
    'tailwind',
    '["motion"]',
    '["motion","clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Use Follow Value.test component harvested from motion with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-follow-value-test.webp',
    'r/use-follow-value-test.json',
    'hash-use-follow-value-test',
    1791914006776,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accessibletable',
    'AccessibleTable',
    'component',
    'data-display',
    '["data-display","react","tailwind","accessibletable","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'AccessibleTable component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accessibletable.webp',
    'r/accessibletable.json',
    'hash-accessibletable',
    1791914006779,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--base-ui',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/accordion--base-ui.webp',
    'r/accordion--base-ui.json',
    'hash-accordion--base-ui',
    1791914006782,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--base-ui-2',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/accordion--base-ui-2.webp',
    'r/accordion--base-ui-2.json',
    'hash-accordion--base-ui-2',
    1791914006789,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--chakra-ui',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion--chakra-ui.webp',
    'r/accordion--chakra-ui.json',
    'hash-accordion--chakra-ui',
    1791914006792,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--chakra-ui-2',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion--chakra-ui-2.webp',
    'r/accordion--chakra-ui-2.json',
    'hash-accordion--chakra-ui-2',
    1791914006795,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--mantine',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion--mantine.webp',
    'r/accordion--mantine.json',
    'hash-accordion--mantine',
    1791914006799,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--radix-ui',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","unstyled","radix-ui"]',
    'react',
    'unstyled',
    '["@radix-ui/react-primitive"]',
    '["@radix-ui/react-primitive"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from radix-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/accordion--radix-ui.webp',
    'r/accordion--radix-ui.json',
    'hash-accordion--radix-ui',
    1791914006807,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--react-aria',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/accordion--react-aria.webp',
    'r/accordion--react-aria.json',
    'hash-accordion--react-aria',
    1791914006810,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion--react-aria-2',
    'Accordion',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Accordion component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/accordion--react-aria-2.webp',
    'r/accordion--react-aria-2.json',
    'hash-accordion--react-aria-2',
    1791914006813,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-context',
    'Accordion Context',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-context","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Context component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-context.webp',
    'r/accordion-context.json',
    'hash-accordion-context',
    1791914006820,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-context--ark-ui',
    'Accordion Context',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-context","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Context component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-context--ark-ui.webp',
    'r/accordion-context--ark-ui.json',
    'hash-accordion-context--ark-ui',
    1791914006825,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-demo-chevron',
    'Accordion.demo.chevron',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion.demo.chevron","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion.demo.chevron component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion-demo-chevron.webp',
    'r/accordion-demo-chevron.json',
    'hash-accordion-demo-chevron',
    1791914006828,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-demo-icons',
    'Accordion.demo.icons',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion.demo.icons","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion.demo.icons component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion-demo-icons.webp',
    'r/accordion-demo-icons.json',
    'hash-accordion-demo-icons',
    1791914006832,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-demo-sidecontrols',
    'Accordion.demo.sideControls',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion.demo.sidecontrols","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion.demo.sideControls component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion-demo-sidecontrols.webp',
    'r/accordion-demo-sidecontrols.json',
    'hash-accordion-demo-sidecontrols',
    1791914006839,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-demo-stylesapi',
    'Accordion.demo.stylesApi',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion.demo.stylesapi","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion.demo.stylesApi component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion-demo-stylesapi.webp',
    'r/accordion-demo-stylesapi.json',
    'hash-accordion-demo-stylesapi',
    1791914006843,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-demo-transitions',
    'Accordion.demo.transitions',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion.demo.transitions","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion.demo.transitions component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion-demo-transitions.webp',
    'r/accordion-demo-transitions.json',
    'hash-accordion-demo-transitions',
    1791914006846,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-disabled-test',
    'Accordion Disabled.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-disabled.test","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Disabled.test component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-disabled-test.webp',
    'r/accordion-disabled-test.json',
    'hash-accordion-disabled-test',
    1791914006853,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-item',
    'Accordion Item',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-item","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Item component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-item.webp',
    'r/accordion-item.json',
    'hash-accordion-item',
    1791914006857,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-item-content',
    'Accordion Item Content',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-item-content","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Item Content component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-item-content.webp',
    'r/accordion-item-content.json',
    'hash-accordion-item-content',
    1791914006860,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-item-context',
    'Accordion Item Context',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-item-context","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Item Context component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-item-context.webp',
    'r/accordion-item-context.json',
    'hash-accordion-item-context',
    1791914006863,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-item-indicator',
    'Accordion Item Indicator',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-item-indicator","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Item Indicator component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-item-indicator.webp',
    'r/accordion-item-indicator.json',
    'hash-accordion-item-indicator',
    1791914006866,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-item-indicator--ark-ui',
    'Accordion Item Indicator',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-item-indicator","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Item Indicator component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-item-indicator--ark-ui.webp',
    'r/accordion-item-indicator--ark-ui.json',
    'hash-accordion-item-indicator--ark-ui',
    1791914006873,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-root',
    'Accordion Root',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion-root","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion Root component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-root.webp',
    'r/accordion-root.json',
    'hash-accordion-root',
    1791914006877,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-spec',
    'Accordion.spec',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion.spec","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Accordion.spec component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion-spec.webp',
    'r/accordion-spec.json',
    'hash-accordion-spec',
    1791914006880,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-stories--react-aria',
    'Accordion.stories',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Accordion.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-stories--react-aria.webp',
    'r/accordion-stories--react-aria.json',
    'hash-accordion-stories--react-aria',
    1791914006882,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-stories--react-aria-2',
    'Accordion.stories',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Accordion.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-stories--react-aria-2.webp',
    'r/accordion-stories--react-aria-2.json',
    'hash-accordion-stories--react-aria-2',
    1791914006891,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-stories--react-aria-3',
    'Accordion.stories',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Accordion.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-stories--react-aria-3.webp',
    'r/accordion-stories--react-aria-3.json',
    'hash-accordion-stories--react-aria-3',
    1791914006894,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-story',
    'Accordion.story',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordion.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordion-story.webp',
    'r/accordion-story.json',
    'hash-accordion-story',
    1791914006897,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-test',
    'Accordion.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.test","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion.test component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-test.webp',
    'r/accordion-test.json',
    'hash-accordion-test',
    1791914006904,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-test--ark-ui',
    'Accordion.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.test","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion.test component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-test--ark-ui.webp',
    'r/accordion-test--ark-ui.json',
    'hash-accordion-test--ark-ui',
    1791914006909,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-test--ark-ui-2',
    'Accordion.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.test","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Accordion.test component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-test--ark-ui-2.webp',
    'r/accordion-test--ark-ui-2.json',
    'hash-accordion-test--ark-ui-2',
    1791914006913,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-test--mantine',
    'Accordion.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Accordion.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-test--mantine.webp',
    'r/accordion-test--mantine.json',
    'hash-accordion-test--mantine',
    1791914006916,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordion-test--radix-ui',
    'Accordion.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordion.test","unstyled","radix-ui"]',
    'react',
    'unstyled',
    '["@radix-ui/react-primitive"]',
    '["@radix-ui/react-primitive"]',
    '[]',
    '["utils/cn"]',
    'Accordion.test component harvested from radix-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordion-test--radix-ui.webp',
    'r/accordion-test--radix-ui.json',
    'hash-accordion-test--radix-ui',
    1791914006924,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionchevron',
    'AccordionChevron',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordionchevron","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'AccordionChevron component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordionchevron.webp',
    'r/accordionchevron.json',
    'hash-accordionchevron',
    1791914006927,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordioncontrol',
    'AccordionControl',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordioncontrol","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'AccordionControl component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordioncontrol.webp',
    'r/accordioncontrol.json',
    'hash-accordioncontrol',
    1791914006930,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordioncontrol-test',
    'AccordionControl.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordioncontrol.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'AccordionControl.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordioncontrol-test.webp',
    'r/accordioncontrol-test.json',
    'hash-accordioncontrol-test',
    1791914006936,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionexpandicon',
    'AccordionExpandIcon',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordionexpandicon","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'AccordionExpandIcon component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordionexpandicon.webp',
    'r/accordionexpandicon.json',
    'hash-accordionexpandicon',
    1791914006941,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionheader',
    'AccordionHeader',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordionheader","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionHeader component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/accordionheader.webp',
    'r/accordionheader.json',
    'hash-accordionheader',
    1791914006944,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionheader-test',
    'AccordionHeader.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionheader.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionHeader.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionheader-test.webp',
    'r/accordionheader-test.json',
    'hash-accordionheader-test',
    1791914006948,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionitem',
    'AccordionItem',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionitem","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionItem component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionitem.webp',
    'r/accordionitem.json',
    'hash-accordionitem',
    1791914006961,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionitem-test',
    'AccordionItem.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionitem.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionItem.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionitem-test.webp',
    'r/accordionitem-test.json',
    'hash-accordionitem-test',
    1791914006965,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionpanel',
    'AccordionPanel',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordionpanel","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionPanel component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/accordionpanel.webp',
    'r/accordionpanel.json',
    'hash-accordionpanel',
    1791914006972,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionpanel--mantine',
    'AccordionPanel',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordionpanel","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'AccordionPanel component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordionpanel--mantine.webp',
    'r/accordionpanel--mantine.json',
    'hash-accordionpanel--mantine',
    1791914006975,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionpanel-test',
    'AccordionPanel.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionpanel.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionPanel.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionpanel-test.webp',
    'r/accordionpanel-test.json',
    'hash-accordionpanel-test',
    1791914006979,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionpanel-test--mantine',
    'AccordionPanel.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionpanel.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'AccordionPanel.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionpanel-test--mantine.webp',
    'r/accordionpanel-test--mantine.json',
    'hash-accordionpanel-test--mantine',
    1791914006982,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionroot',
    'AccordionRoot',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionroot","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionRoot component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionroot.webp',
    'r/accordionroot.json',
    'hash-accordionroot',
    1791914006989,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionroot-spec',
    'AccordionRoot.spec',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionroot.spec","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionRoot.spec component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionroot-spec.webp',
    'r/accordionroot-spec.json',
    'hash-accordionroot-spec',
    1791914006992,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordionroot-test',
    'AccordionRoot.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordionroot.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionRoot.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordionroot-test.webp',
    'r/accordionroot-test.json',
    'hash-accordionroot-test',
    1791914006996,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordiontransition',
    'AccordionTransition',
    'component',
    'data-display',
    '["data-display","react","tailwind","accordiontransition","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'AccordionTransition component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/accordiontransition.webp',
    'r/accordiontransition.json',
    'hash-accordiontransition',
    1791914006999,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordiontrigger',
    'AccordionTrigger',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordiontrigger","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionTrigger component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordiontrigger.webp',
    'r/accordiontrigger.json',
    'hash-accordiontrigger',
    1791914007006,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'accordiontrigger-test',
    'AccordionTrigger.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","accordiontrigger.test","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'AccordionTrigger.test component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/accordiontrigger-test.webp',
    'r/accordiontrigger-test.json',
    'hash-accordiontrigger-test',
    1791914007010,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'alternatereversetimeline',
    'AlternateReverseTimeline',
    'component',
    'data-display',
    '["data-display","react","tailwind","alternatereversetimeline","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'AlternateReverseTimeline component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/alternatereversetimeline.webp',
    'r/alternatereversetimeline.json',
    'hash-alternatereversetimeline',
    1791914007014,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'api-table',
    'Api Table',
    'component',
    'data-display',
    '["data-display","react","tailwind","api-table","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Api Table component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/api-table.webp',
    'r/api-table.json',
    'hash-api-table',
    1791914007020,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--ark-ui',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--ark-ui.webp',
    'r/avatar--ark-ui.json',
    'hash-avatar--ark-ui',
    1791914007026,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--ark-ui-2',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--ark-ui-2.webp',
    'r/avatar--ark-ui-2.json',
    'hash-avatar--ark-ui-2',
    1791914007029,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--ark-ui-3',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--ark-ui-3.webp',
    'r/avatar--ark-ui-3.json',
    'hash-avatar--ark-ui-3',
    1791914007032,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--ark-ui-4',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--ark-ui-4.webp',
    'r/avatar--ark-ui-4.json',
    'hash-avatar--ark-ui-4',
    1791914007039,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--ark-ui-5',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--ark-ui-5.webp',
    'r/avatar--ark-ui-5.json',
    'hash-avatar--ark-ui-5',
    1791914007049,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--chakra-ui',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar--chakra-ui.webp',
    'r/avatar--chakra-ui.json',
    'hash-avatar--chakra-ui',
    1791914007055,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--chakra-ui-2',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar--chakra-ui-2.webp',
    'r/avatar--chakra-ui-2.json',
    'hash-avatar--chakra-ui-2',
    1791914007060,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--chakra-ui-3',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar--chakra-ui-3.webp',
    'r/avatar--chakra-ui-3.json',
    'hash-avatar--chakra-ui-3',
    1791914007063,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--radix-ui',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","radix-ui"]',
    'react',
    'unstyled',
    '["@radix-ui/react-primitive"]',
    '["@radix-ui/react-primitive"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from radix-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--radix-ui.webp',
    'r/avatar--radix-ui.json',
    'hash-avatar--radix-ui',
    1791914007069,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--react-aria',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--react-aria.webp',
    'r/avatar--react-aria.json',
    'hash-avatar--react-aria',
    1791914007074,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar--react-aria-2',
    'Avatar',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Avatar component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar--react-aria-2.webp',
    'r/avatar--react-aria-2.json',
    'hash-avatar--react-aria-2',
    1791914007077,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-as-child-test',
    'Avatar As Child.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","avatar-as-child.test","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar As Child.test component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/avatar-as-child-test.webp',
    'r/avatar-as-child-test.json',
    'hash-avatar-as-child-test',
    1791914007081,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-demo-allowedcolors',
    'Avatar.demo.allowedColors',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.demo.allowedcolors","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.demo.allowedColors component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-demo-allowedcolors.webp',
    'r/avatar-demo-allowedcolors.json',
    'hash-avatar-demo-allowedcolors',
    1791914007088,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-demo-group',
    'Avatar.demo.group',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.demo.group","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.demo.group component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-demo-group.webp',
    'r/avatar-demo-group.json',
    'hash-avatar-demo-group',
    1791914007093,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-demo-grouptooltip',
    'Avatar.demo.groupTooltip',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.demo.grouptooltip","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.demo.groupTooltip component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-demo-grouptooltip.webp',
    'r/avatar-demo-grouptooltip.json',
    'hash-avatar-demo-grouptooltip',
    1791914007096,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-demo-link',
    'Avatar.demo.link',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.demo.link","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.demo.link component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-demo-link.webp',
    'r/avatar-demo-link.json',
    'hash-avatar-demo-link',
    1791914007099,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-demo-placeholders',
    'Avatar.demo.placeholders',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.demo.placeholders","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.demo.placeholders component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-demo-placeholders.webp',
    'r/avatar-demo-placeholders.json',
    'hash-avatar-demo-placeholders',
    1791914007107,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-demo-usage',
    'Avatar.demo.usage',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.demo.usage","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.demo.usage component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-demo-usage.webp',
    'r/avatar-demo-usage.json',
    'hash-avatar-demo-usage',
    1791914007112,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-fallback',
    'Avatar Fallback',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar-fallback","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar Fallback component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar-fallback.webp',
    'r/avatar-fallback.json',
    'hash-avatar-fallback',
    1791914007115,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-group',
    'Avatar Group',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar-group","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar Group component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar-group.webp',
    'r/avatar-group.json',
    'hash-avatar-group',
    1791914007121,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-root',
    'Avatar Root',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","avatar-root","unstyled","ark-ui"]',
    'react',
    'unstyled',
    '["@ark-ui/react"]',
    '["@ark-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar Root component harvested from ark-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/avatar-root.webp',
    'r/avatar-root.json',
    'hash-avatar-root',
    1791914007125,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-spec',
    'Avatar.spec',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.spec","unstyled","base-ui"]',
    'react',
    'unstyled',
    '["@base-ui-components/react"]',
    '["@base-ui-components/react"]',
    '[]',
    '["utils/cn"]',
    'Avatar.spec component harvested from base-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'needs-demo',
    'thumbs/avatar-spec.webp',
    'r/avatar-spec.json',
    'hash-avatar-spec',
    1791914007128,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-spec--mui',
    'Avatar.spec',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.spec","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Avatar.spec component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-spec--mui.webp',
    'r/avatar-spec--mui.json',
    'hash-avatar-spec--mui',
    1791914007131,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-stories--react-aria',
    'Avatar.stories',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","avatar.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Avatar.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/avatar-stories--react-aria.webp',
    'r/avatar-stories--react-aria.json',
    'hash-avatar-stories--react-aria',
    1791914007139,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-stories--react-aria-2',
    'Avatar.stories',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","avatar.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Avatar.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/avatar-stories--react-aria-2.webp',
    'r/avatar-stories--react-aria-2.json',
    'hash-avatar-stories--react-aria-2',
    1791914007143,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-stories--react-aria-3',
    'Avatar.stories',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","avatar.stories","unstyled","react-aria"]',
    'react',
    'unstyled',
    '["react-aria-components"]',
    '["react-aria-components"]',
    '[]',
    '["utils/cn"]',
    'Avatar.stories component harvested from react-aria with unstyled styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/avatar-stories--react-aria-3.webp',
    'r/avatar-stories--react-aria-3.json',
    'hash-avatar-stories--react-aria-3',
    1791914007147,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-story',
    'Avatar.story',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatar.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatar-story.webp',
    'r/avatar-story.json',
    'hash-avatar-story',
    1791914007153,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatar-test--mantine',
    'Avatar.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","avatar.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Avatar.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/avatar-test--mantine.webp',
    'r/avatar-test--mantine.json',
    'hash-avatar-test--mantine',
    1791914007158,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'avatarplaceholdericon',
    'AvatarPlaceholderIcon',
    'component',
    'data-display',
    '["data-display","react","tailwind","avatarplaceholdericon","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'AvatarPlaceholderIcon component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/avatarplaceholdericon.webp',
    'r/avatarplaceholdericon.json',
    'hash-avatarplaceholdericon',
    1791914007161,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'bar-list',
    'Bar List',
    'component',
    'data-display',
    '["data-display","react","tailwind","bar-list","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Bar List component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/bar-list.webp',
    'r/bar-list.json',
    'hash-bar-list',
    1791914007164,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'base',
    ' Base',
    'component',
    'data-display',
    '["data-display","react","tailwind","_base","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    ' Base component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/base.webp',
    'r/base.json',
    'hash-base',
    1791914007171,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'base--mantine',
    ' Base',
    'component',
    'data-display',
    '["data-display","react","tailwind","_base","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    ' Base component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/base--mantine.webp',
    'r/base--mantine.json',
    'hash-base--mantine',
    1791914007174,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'blog-card--chakra-ui',
    'Blog Card',
    'component',
    'data-display',
    '["data-display","react","tailwind","blog-card","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Blog Card component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/blog-card--chakra-ui.webp',
    'r/blog-card--chakra-ui.json',
    'hash-blog-card--chakra-ui',
    1791914007177,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'calendar--mantine',
    'Calendar',
    'component',
    'data-display',
    '["data-display","react","tailwind","calendar","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Calendar component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/calendar--mantine.webp',
    'r/calendar--mantine.json',
    'hash-calendar--mantine',
    1791914007181,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'calendar-demo-picker',
    'Calendar.demo.picker',
    'component',
    'data-display',
    '["data-display","react","tailwind","calendar.demo.picker","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Calendar.demo.picker component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/calendar-demo-picker.webp',
    'r/calendar-demo-picker.json',
    'hash-calendar-demo-picker',
    1791914007188,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'calendar-demo-weekpicker',
    'Calendar.demo.weekPicker',
    'component',
    'data-display',
    '["data-display","react","tailwind","calendar.demo.weekpicker","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Calendar.demo.weekPicker component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/calendar-demo-weekpicker.webp',
    'r/calendar-demo-weekpicker.json',
    'hash-calendar-demo-weekpicker',
    1791914007191,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'calendar-story',
    'Calendar.story',
    'component',
    'data-display',
    '["data-display","react","tailwind","calendar.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Calendar.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/calendar-story.webp',
    'r/calendar-story.json',
    'hash-calendar-story',
    1791914007195,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'calendar-test--mantine',
    'Calendar.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","calendar.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Calendar.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/calendar-test--mantine.webp',
    'r/calendar-test--mantine.json',
    'hash-calendar-test--mantine',
    1791914007204,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card--chakra-ui',
    'Card',
    'component',
    'data-display',
    '["data-display","react","tailwind","card","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Card component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/card--chakra-ui.webp',
    'r/card--chakra-ui.json',
    'hash-card--chakra-ui',
    1791914007210,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card--chakra-ui-2',
    'Card',
    'component',
    'data-display',
    '["data-display","react","tailwind","card","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Card component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/card--chakra-ui-2.webp',
    'r/card--chakra-ui-2.json',
    'hash-card--chakra-ui-2',
    1791914007216,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card-demo-horizontal',
    'Card.demo.horizontal',
    'component',
    'data-display',
    '["data-display","react","tailwind","card.demo.horizontal","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Card.demo.horizontal component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/card-demo-horizontal.webp',
    'r/card-demo-horizontal.json',
    'hash-card-demo-horizontal',
    1791914007228,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card-demo-link',
    'Card.demo.link',
    'component',
    'data-display',
    '["data-display","react","tailwind","card.demo.link","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Card.demo.link component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/card-demo-link.webp',
    'r/card-demo-link.json',
    'hash-card-demo-link',
    1791914007245,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card-demo-section',
    'Card.demo.section',
    'block',
    'data-display',
    '["data-display","react","tailwind","card.demo.section","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Card.demo.section component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/card-demo-section.webp',
    'r/card-demo-section.json',
    'hash-card-demo-section',
    1791914007248,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card-spec',
    'Card.spec',
    'component',
    'data-display',
    '["data-display","react","tailwind","card.spec","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Card.spec component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/card-spec.webp',
    'r/card-spec.json',
    'hash-card-spec',
    1791914007254,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card-story',
    'Card.story',
    'component',
    'data-display',
    '["data-display","react","tailwind","card.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Card.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/card-story.webp',
    'r/card-story.json',
    'hash-card-story',
    1791914007258,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card-test--mantine',
    'Card.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","card.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Card.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/card-test--mantine.webp',
    'r/card-test--mantine.json',
    'hash-card-test--mantine',
    1791914007261,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'card-test--mui',
    'Card.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","card.test","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'Card.test component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/card-test--mui.webp',
    'r/card-test--mui.json',
    'hash-card-test--mui',
    1791914007264,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'cardsection-test',
    'CardSection.test',
    'primitive',
    'data-display',
    '["data-display","react","tailwind","cardsection.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'CardSection.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/cardsection-test.webp',
    'r/cardsection-test.json',
    'hash-cardsection-test',
    1791914007271,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'collapsible--chakra-ui',
    'Collapsible',
    'component',
    'data-display',
    '["data-display","react","tailwind","collapsible","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Collapsible component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/collapsible--chakra-ui.webp',
    'r/collapsible--chakra-ui.json',
    'hash-collapsible--chakra-ui',
    1791914007275,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'colorstimeline',
    'ColorsTimeline',
    'component',
    'data-display',
    '["data-display","react","tailwind","colorstimeline","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ColorsTimeline component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/colorstimeline.webp',
    'r/colorstimeline.json',
    'hash-colorstimeline',
    1791914007279,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'columngroupingtable',
    'ColumnGroupingTable',
    'component',
    'data-display',
    '["data-display","react","tailwind","columngroupingtable","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ColumnGroupingTable component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/columngroupingtable.webp',
    'r/columngroupingtable.json',
    'hash-columngroupingtable',
    1791914007282,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'controlledaccordions',
    'ControlledAccordions',
    'component',
    'data-display',
    '["data-display","react","tailwind","controlledaccordions","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'ControlledAccordions component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/controlledaccordions.webp',
    'r/controlledaccordions.json',
    'hash-controlledaccordions',
    1791914007290,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'customizedaccordions',
    'CustomizedAccordions',
    'component',
    'data-display',
    '["data-display","react","tailwind","customizedaccordions","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'CustomizedAccordions component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/customizedaccordions.webp',
    'r/customizedaccordions.json',
    'hash-customizedaccordions',
    1791914007293,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'customizedtimeline',
    'CustomizedTimeline',
    'component',
    'data-display',
    '["data-display","react","tailwind","customizedtimeline","css-in-js","mui"]',
    'react',
    'css-in-js',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '["@mui/material","@emotion/react","@emotion/styled"]',
    '[]',
    '["utils/cn"]',
    'CustomizedTimeline component harvested from mui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/customizedtimeline.webp',
    'r/customizedtimeline.json',
    'hash-customizedtimeline',
    1791914007298,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'data-list',
    'Data List',
    'component',
    'data-display',
    '["data-display","react","tailwind","data-list","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Data List component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/data-list.webp',
    'r/data-list.json',
    'hash-data-list',
    1791914007308,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'data-list--chakra-ui',
    'Data List',
    'component',
    'data-display',
    '["data-display","react","tailwind","data-list","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Data List component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'unsupported',
    'thumbs/data-list--chakra-ui.webp',
    'r/data-list--chakra-ui.json',
    'hash-data-list--chakra-ui',
    1791914007312,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'usefilter',
    'UseFilter',
    'hook',
    'data-display',
    '["data-display","react","tailwind","usefilter","css-in-js","ant-design"]',
    'react',
    'css-in-js',
    '["antd"]',
    '["antd"]',
    '[]',
    '["utils/cn"]',
    'UseFilter component harvested from ant-design with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/usefilter.webp',
    'r/usefilter.json',
    'hash-usefilter',
    1791914007315,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'useitems',
    'UseItems',
    'hook',
    'data-display',
    '["data-display","react","tailwind","useitems","css-in-js","ant-design"]',
    'react',
    'css-in-js',
    '["antd"]',
    '["antd"]',
    '[]',
    '["utils/cn"]',
    'UseItems component harvested from ant-design with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/useitems.webp',
    'r/useitems.json',
    'hash-useitems',
    1791914007322,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'useselection',
    'UseSelection',
    'hook',
    'data-display',
    '["data-display","react","tailwind","useselection","css-in-js","ant-design"]',
    'react',
    'css-in-js',
    '["antd"]',
    '["antd"]',
    '[]',
    '["utils/cn"]',
    'UseSelection component harvested from ant-design with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/useselection.webp',
    'r/useselection.json',
    'hash-useselection',
    1791914007326,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'usesorter',
    'UseSorter',
    'hook',
    'data-display',
    '["data-display","react","tailwind","usesorter","css-in-js","ant-design"]',
    'react',
    'css-in-js',
    '["antd"]',
    '["antd"]',
    '[]',
    '["utils/cn"]',
    'UseSorter component harvested from ant-design with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/usesorter.webp',
    'r/usesorter.json',
    'hash-usesorter',
    1791914007330,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'it-supports-on-control-mouse-enter',
    'It Supports On Control Mouse Enter',
    'hook',
    'hooks',
    '["hooks","react","tailwind","it-supports-on-control-mouse-enter","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'It Supports On Control Mouse Enter component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/it-supports-on-control-mouse-enter.webp',
    'r/it-supports-on-control-mouse-enter.json',
    'hash-it-supports-on-control-mouse-enter',
    1791914007333,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'remount-on-mouse-in',
    'Remount On Mouse In',
    'hook',
    'hooks',
    '["hooks","react","tailwind","remount-on-mouse-in","animata"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Remount On Mouse In component harvested from animata with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/remount-on-mouse-in.webp',
    'r/remount-on-mouse-in.json',
    'hash-remount-on-mouse-in',
    1791914007340,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-active-press',
    'Use Active Press',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-active-press","headless-ui"]',
    'react',
    'tailwind',
    '[]',
    '["clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Use Active Press component harvested from headless-ui with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-active-press.webp',
    'r/use-active-press.json',
    'hash-use-active-press',
    1791914007343,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-animate-test',
    'Use Animate.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-animate.test","motion"]',
    'react',
    'tailwind',
    '["motion"]',
    '["motion","clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Use Animate.test component harvested from motion with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-animate-test.webp',
    'r/use-animate-test.json',
    'hash-use-animate-test',
    1791914007346,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-animated-state-test',
    'Use Animated State.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-animated-state.test","motion"]',
    'react',
    'tailwind',
    '["motion"]',
    '["motion","clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Use Animated State.test component harvested from motion with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-animated-state-test.webp',
    'r/use-animated-state-test.json',
    'hash-use-animated-state-test',
    1791914007348,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-animation-frame-test',
    'Use Animation Frame.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-animation-frame.test","motion"]',
    'react',
    'tailwind',
    '["motion"]',
    '["motion","clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Use Animation Frame.test component harvested from motion with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-animation-frame-test.webp',
    'r/use-animation-frame-test.json',
    'hash-use-animation-frame-test',
    1791914007361,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-attachment-src-test',
    'Use Attachment Src.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-attachment-src.test","mixed","assistant-ui"]',
    'react',
    'mixed',
    '["@assistant-ui/react"]',
    '["@assistant-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Use Attachment Src.test component harvested from assistant-ui with mixed styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/use-attachment-src-test.webp',
    'r/use-attachment-src-test.json',
    'hash-use-attachment-src-test',
    1791914007364,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-breakpoint-stories',
    'Use Breakpoint.stories',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-breakpoint.stories","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Use Breakpoint.stories component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-breakpoint-stories.webp',
    'r/use-breakpoint-stories.json',
    'hash-use-breakpoint-stories',
    1791914007366,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-breakpoint-test',
    'Use Breakpoint.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-breakpoint.test","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Use Breakpoint.test component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-breakpoint-test.webp',
    'r/use-breakpoint-test.json',
    'hash-use-breakpoint-test',
    1791914007373,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-breakpoint-value-test',
    'Use Breakpoint Value.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-breakpoint-value.test","css-in-js","chakra-ui"]',
    'react',
    'css-in-js',
    '["@chakra-ui/react"]',
    '["@chakra-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Use Breakpoint Value.test component harvested from chakra-ui with css-in-js styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-breakpoint-value-test.webp',
    'r/use-breakpoint-value-test.json',
    'hash-use-breakpoint-value-test',
    1791914007375,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-callback-ref',
    'Use Callback Ref',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-callback-ref","unstyled","radix-ui"]',
    'react',
    'unstyled',
    '["@radix-ui/react-primitive"]',
    '["@radix-ui/react-primitive"]',
    '[]',
    '["utils/cn"]',
    'Use Callback Ref component harvested from radix-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-callback-ref.webp',
    'r/use-callback-ref.json',
    'hash-use-callback-ref',
    1791914007378,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-click-outside-demo-events',
    'Use Click Outside.demo.events',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-click-outside.demo.events","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Click Outside.demo.events component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-click-outside-demo-events.webp',
    'r/use-click-outside-demo-events.json',
    'hash-use-click-outside-demo-events',
    1791914007381,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-click-outside-story',
    'Use Click Outside.story',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-click-outside.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Click Outside.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-click-outside-story.webp',
    'r/use-click-outside-story.json',
    'hash-use-click-outside-story',
    1791914007387,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-click-outside-test',
    'Use Click Outside.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-click-outside.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Click Outside.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-click-outside-test.webp',
    'r/use-click-outside-test.json',
    'hash-use-click-outside-test',
    1791914007391,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-clipboard-usage-demo',
    'Use Clipboard.usage.demo',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-clipboard.usage.demo","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Clipboard.usage.demo component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-clipboard-usage-demo.webp',
    'r/use-clipboard-usage-demo.json',
    'hash-use-clipboard-usage-demo',
    1791914007394,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-collapse-story',
    'Use Collapse.story',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-collapse.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Collapse.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-collapse-story.webp',
    'r/use-collapse-story.json',
    'hash-use-collapse-story',
    1791914007397,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-collapse-test',
    'Use Collapse.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-collapse.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Collapse.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-collapse-test.webp',
    'r/use-collapse-test.json',
    'hash-use-collapse-test',
    1791914007399,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-color-scheme-story',
    'Use Color Scheme.story',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-color-scheme.story","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Color Scheme.story component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-color-scheme-story.webp',
    'r/use-color-scheme-story.json',
    'hash-use-color-scheme-story',
    1791914007408,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-color-scheme-test',
    'Use Color Scheme.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-color-scheme.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Color Scheme.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-color-scheme-test.webp',
    'r/use-color-scheme-test.json',
    'hash-use-color-scheme-test',
    1791914007411,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-controllable-state',
    'Use Controllable State',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-controllable-state","unstyled","radix-ui"]',
    'react',
    'unstyled',
    '["@radix-ui/react-primitive"]',
    '["@radix-ui/react-primitive"]',
    '[]',
    '["utils/cn"]',
    'Use Controllable State component harvested from radix-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-controllable-state.webp',
    'r/use-controllable-state.json',
    'hash-use-controllable-state',
    1791914007414,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-controllable-state-reducer',
    'Use Controllable State Reducer',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-controllable-state-reducer","unstyled","radix-ui"]',
    'react',
    'unstyled',
    '["@radix-ui/react-primitive"]',
    '["@radix-ui/react-primitive"]',
    '[]',
    '["utils/cn"]',
    'Use Controllable State Reducer component harvested from radix-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-controllable-state-reducer.webp',
    'r/use-controllable-state-reducer.json',
    'hash-use-controllable-state-reducer',
    1791914007416,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-controllable-state-test',
    'Use Controllable State.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-controllable-state.test","unstyled","radix-ui"]',
    'react',
    'unstyled',
    '["@radix-ui/react-primitive"]',
    '["@radix-ui/react-primitive"]',
    '[]',
    '["utils/cn"]',
    'Use Controllable State.test component harvested from radix-ui with unstyled styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-controllable-state-test.webp',
    'r/use-controllable-state-test.json',
    'hash-use-controllable-state-test',
    1791914007423,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-copy-to-clipboard-test',
    'Use Copy To Clipboard.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-copy-to-clipboard.test","mixed","assistant-ui"]',
    'react',
    'mixed',
    '["@assistant-ui/react"]',
    '["@assistant-ui/react"]',
    '[]',
    '["utils/cn"]',
    'Use Copy To Clipboard.test component harvested from assistant-ui with mixed styling.',
    'Apache-2.0',
    0,
    'harvested',
    'primitive',
    'thumbs/use-copy-to-clipboard-test.webp',
    'r/use-copy-to-clipboard-test.json',
    'hash-use-copy-to-clipboard-test',
    1791914007426,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-cycle-test',
    'Use Cycle.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-cycle.test","motion"]',
    'react',
    'tailwind',
    '["motion"]',
    '["motion","clsx","tailwind-merge"]',
    '[]',
    '["utils/cn"]',
    'Use Cycle.test component harvested from motion with tailwind styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-cycle-test.webp',
    'r/use-cycle-test.json',
    'hash-use-cycle-test',
    1791914007429,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-dates-context-test',
    'Use Dates Context.test',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-dates-context.test","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Dates Context.test component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-dates-context-test.webp',
    'r/use-dates-context-test.json',
    'hash-use-dates-context-test',
    1791914007431,
    1
  );
INSERT OR REPLACE INTO components (
    id, name, kind, category, tags, framework, styling, requires, deps, depends_on, shared, description, license, favorite, origin, preview_status, thumb_key, body_key, content_hash, updated_at, version
  ) VALUES (
    'use-debounced-callback-demo-unmount',
    'Use Debounced Callback.demo.unmount',
    'hook',
    'hooks',
    '["hooks","react","tailwind","use-debounced-callback.demo.unmount","css-modules","mantine"]',
    'react',
    'css-modules',
    '["@mantine/core","@mantine/hooks"]',
    '["@mantine/core","@mantine/hooks"]',
    '[]',
    '["utils/cn"]',
    'Use Debounced Callback.demo.unmount component harvested from mantine with css-modules styling.',
    'MIT',
    0,
    'harvested',
    'primitive',
    'thumbs/use-debounced-callback-demo-unmount.webp',
    'r/use-debounced-callback-demo-unmount.json',
    'hash-use-debounced-callback-demo-unmount',
    1791914007437,
    1
  );