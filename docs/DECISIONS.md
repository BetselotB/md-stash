# Architectural & Engineering Decisions Log

This document records architectural, taxonomy, data modeling, and engineering judgment calls made during the upgrade of MDstash into a Component Library Platform.

---

## 1. Taxonomy & Category Remapping (`misc` Reduction)

- **Context:** The harvested corpus placed 4,182 of 8,072 components (51.8%) into `misc` because the harvester relied on strict exact-token matching against directory names.
- **Decision:** Implemented a multi-tier classification hierarchy:
  1. Primary: Explicit registry / source folder metadata.
  2. Secondary: Component `name`, `id`, and slug token decomposition (e.g. `angleslider` -> `selection`, `alerttitle` -> `feedback`).
  3. Tertiary: Frontmatter tags and docstring inspection.
  4. Quaternary: Any component not matched stays in `misc` (< 6%).
- **Outcome:** `misc` reduced from 51.8% to 6.2%, surpassing the Phase 0 gate requirement (< 15%).

---

## 2. Truthful Styling & Library Dependency Tracking

- **Context:** The original harvest blindly stamped `styling: tailwind` across all 8,072 components, despite sources like Mantine, MUI, Ant Design, Chakra UI, Base UI, Ark UI, and React Aria relying on CSS modules, CSS-in-JS, or unstyled headless state machines.
- **Decision:** 
  - Never falsify styling claims. Stamped truthful styling: `tailwind` (1,510 items), `css-in-js` (1,589 items), `css-modules` (1,705 items), `unstyled` (2,013 items), `mixed` (1,255 items).
  - Added a `requires: string[]` field to capture non-React UI packages (`@mantine/core`, `@mui/material`, `antd`, `@chakra-ui/react`, `@ark-ui/react`, etc.).
  - Default Gallery filter defaults to `styling: tailwind` to protect developer experience, with clear multi-select badges allowing users and agents to explore all styling paradigms.

---

## 3. Component `kind` Categorization

- **Context:** Sub-components (`DialogTitle`, `PopperAnchor`, `VisuallyHidden`), hooks (`useMediaQuery`), stories, and full blocks were all classified uniformly as top-level components.
- **Decision:** Added `kind: 'component' | 'primitive' | 'block' | 'hook' | 'util' | 'style' | 'icon-index'`.
  - Sub-parts, context providers, portals, and test fixtures are flagged as `primitive` (hidden from default gallery view, but searchable and resolved in dependency closures).
  - Hooks are classified as `hook`.
  - Complex landing/marketing compositions are classified as `block`.

---

## 4. Honest Preview Status & Sandboxed Runtime

- **Context:** Many components cannot render standalone without specific context providers (e.g. `MantineProvider`, `ThemeProvider`, `ConfigProvider`) or mock props.
- **Decision:** Every component carries an honest `preview.status`:
  - `ready`: Self-contained visual components (1,102 items). Renders live in detail view and has a WebP thumbnail.
  - `needs-demo`: Headless primitives or components requiring state/props stubs (1,730 items). Can render when stubs are attached.
  - `primitive`: Sub-parts, hooks, or non-visual utilities (2,882 items). Renders code view only.
  - `unsupported`: Complex framework-coupled components requiring external providers not yet stubbed (2,358 items).
- **Rule:** Never fake a preview. An error boundary or fallback card explicitly explains the preview state.

---

## 5. Storage & Source of Truth Architecture

- **Context:** Agents running in Claude, ChatGPT, Cursor, and IDEs cannot query a local IndexedDB running in a user's browser.
- **Decision:**
  - **Edge API (Cloudflare Workers + D1 + R2 + KV)** is the public source of truth for agents.
  - **Manage App (Dexie IndexedDB in browser)** is a high-speed, local-first cache, offline workspace, and editor.
  - Synchronization follows an optimistic, last-write-wins pattern based on `updatedAt`.
  - Offline mode gracefully falls back to cached metadata and WebP thumbnails.

---

## 6. Pilot Set Selection Strategy (Phase 0 -> Phase 2)

- **Context:** Building, testing, and optimizing an end-to-end pipeline on 8,072 components simultaneously risks massive feedback cycles.
- **Decision:** Established a curated **Pilot Set of 300 components**:
  - 120 Tailwind primitives & components (shadcn/ui, Magic UI, Animate UI, Tremor, React Bits, Animata).
  - 40 Blocks (marketing sections, pricing tables, hero grids).
  - 40 Headless & Accessible primitives (Radix UI, Base UI, Ark UI, React Aria).
  - 40 Framework-coupled components (Mantine, MUI, Chakra, Ant Design) to validate `requires` and `styling` truth.
  - 30 Hooks and utilities.
  - 30 AI Chat components (assistant-ui).
- All gates from Phase 1 through Phase 7 will be verified against this Pilot Set before batching the remaining 7,772 components in Phase 8.

---

## 7. Licensing & Attribution Guarantee

- **Context:** The harvest report listed 8,051 components with `license: unknown`.
- **Decision:** 
  - Mapped all 25 source repositories to their official upstream permissive licenses (MIT, Apache-2.0, ISC).
  - Added mandatory `attribution` string and `sources[].url` to every component record.
  - All copy/export outputs for MIT/Apache/BSD components automatically prepend/append the attribution header.
