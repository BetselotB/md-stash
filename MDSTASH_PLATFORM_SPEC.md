# MDstash — Platform Specification & Architectural Deep Dive

> **The definitive technical and design specification for MDstash:** What it is, how it works, UI/UX philosophy, client-side frontend architecture, local-first database, AI context pipeline, and optional cloud synchronization.

---

## Table of Contents

1. [Executive Summary & Platform Identity](#1-executive-summary--platform-identity)
2. [Core Principles & Product Philosophy](#2-core-principles--product-philosophy)
3. [Desktop-First Architecture & Gating Logic](#3-desktop-first-architecture--gating-logic)
4. [Design System, Aesthetics & Materials](#4-design-system-aesthetics--materials)
5. [Frontend Architecture & Component Hierarchy](#5-frontend-architecture--component-hierarchy)
6. [Data Model & Client-Side Storage Engine (IndexedDB)](#6-data-model--client-side-storage-engine-indexeddb)
7. [Core Workflows & Business Logic](#7-core-workflows--business-logic)
   - [7.1 Ingestion & Import (Drag-and-Drop, Folder Traversal, Clipboard Paste)](#71-ingestion--import-drag-and-drop-folder-traversal-clipboard-paste)
   - [7.2 Search & Discovery (MiniSearch Client Engine)](#72-search--discovery-minisearch-client-engine)
   - [7.3 Organization (Collections, Drag-and-Drop Ordering, Tags, Pinning)](#73-organization-collections-drag-and-drop-ordering-tags-pinning)
   - [7.4 Markdown Preview & Sanitization](#74-markdown-preview--sanitization)
   - [7.5 Version History & Snapshot Rollback](#75-version-history--snapshot-rollback)
   - [7.6 AI Context Pipeline (Prompt Fencing, Multi-File Bundling)](#76-ai-context-pipeline-prompt-fencing-multi-file-bundling)
   - [7.7 Drag-Out Engine (`text/plain` and Chromium `DownloadURL`)](#77-drag-out-engine-textplain-and-chromium-downloadurl)
   - [7.8 Portable Backup & Restore (`fflate` Zip Architecture)](#78-portable-backup--restore-fflate-zip-architecture)
   - [7.9 Storage Persistence & Quota Management](#79-storage-persistence--quota-management)
8. [Optional Cloud Synchronization (Firebase Integration)](#8-optional-cloud-synchronization-firebase-integration)
9. [Marketing Landing Page & Motion Engine](#9-marketing-landing-page--motion-engine)
10. [Build, Deployment & Offline PWA Capabilities](#10-build-deployment--offline-pwa-capabilities)
11. [Summary File Map](#11-summary-file-map)

---

## 1. Executive Summary & Platform Identity

### 1.1 What is MDstash?
**MDstash** is a craft-inspired, local-first organizer designed specifically for Markdown files and AI context payloads. In modern software engineering and generative AI workflows, developers constantly curate context-heavy markdown files:
- System prompts and AI instruction files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `copilot-instructions.md`)
- Scratchpad notes, bug reports, and project context
- Architecture diagrams, ADRs (Architecture Decision Records), and API documentation
- Reusable prompt templates and persona snippets

Rather than keeping dozens of unsaved scratch tabs open or repeatedly hunting through deep repository trees to copy context into Claude, ChatGPT, Cursor, or terminal prompts, MDstash serves as a persistent, high-speed staging crate.

### 1.2 The One-Liner
> *"Your markdown files, stashed, sorted, and ready to drop anywhere."*

### 1.3 Key Value Proposition
- **Pure Local-First Privacy:** All files, tags, and collections live natively in the user's browser using IndexedDB. No external servers receive document contents by default.
- **Instant AI Prompt Readiness:** One-click formatting into structured AI prompt headers, safely fenced code blocks, or raw text.
- **Context Bundling:** Multi-select files and compile them into a unified context payload with automated directory table-of-contents.
- **Physical Drag-Out Workflows:** Drag cards directly into AI web chat inputs, IDE editor tabs, or directly onto the operating system Desktop.
- **Craft Aesthetic:** Breaks away from generic corporate SaaS design with a warm, tactile palette inspired by mid-century paper ephemera, vintage brewery stencils, and industrial crates.

---

## 2. Core Principles & Product Philosophy

1. **Local-First, Private by Default**
   Zero telemetry, zero tracking, zero mandatory account registration. The user owns their data entirely on their physical hardware.
2. **Frictionless Ingestion**
   Dropping files, dropping entire folders, or simply hitting `Ctrl+V` anywhere on the screen immediately creates a categorized stash item.
3. **Prompt & Context Ergonomics**
   Copying text for an LLM is a first-class feature, not an afterthought. Dynamic backtick calculation ensures code blocks never break when nested.
4. **Tactile Craft Materiality**
   Warm olive sage, natural oat paper cards, amber-orange pushpins, and subtle noise grain overlays replace sterile dark/light SaaS tropes.
5. **Zero Data Trap**
   One-click zip export produces real `.md` files in human-readable directory structures alongside a standardized `manifest.json`.

---

## 3. Desktop-First Architecture & Gating Logic

MDstash is purpose-built for desktop productivity workflows (multi-window drag-and-drop, IDE side-by-side splitting, clipboard bridges).

### 3.1 Gating Detection Logic
In `src/App.tsx`, MDstash evaluates hardware capabilities using modern CSS media features:

```typescript
export const DESKTOP_MEDIA_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';
```

- `min-width: 1024px`: Ensures sufficient screen real estate for split-panel reading and bundle trays.
- `hover: hover`: Verifies the primary input device can hover (ruling out pure touch devices).
- `pointer: fine`: Verifies the presence of a mouse or precision trackpad required for dragging items across windows.

### 3.2 Live Responsive Handling & Resource Cleanup
- Listens to `matchMedia.addEventListener('change')` rather than window resize listeners, eliminating resize layout thrashing.
- If a user resizes below the threshold or switches into a touch profile:
  - GSAP timelines and ScrollTriggers are killed via `ScrollTrigger.getAll().forEach(st => st.kill())`.
  - Lenis smooth scroll instances are destroyed.
  - PWA install prompts are suppressed (`e.preventDefault()` on `beforeinstallprompt`).
  - The lazy-loaded application bundle (`DesktopApp.tsx`) unmounts and renders `DesktopGate.tsx`.

### 3.3 The `DesktopGate` UX
When gated on mobile or tablet, the user is presented with:
- An explanation of why MDstash requires a desktop pointing device.
- A live window dimension readout (`window.innerWidth`).
- One-click **"Copy Link"** button to paste to a computer.
- One-click **"Email Myself a Link"** button generating a pre-filled `mailto:` link.

---

## 4. Design System, Aesthetics & Materials

The design language draws inspiration from vintage industrial packaging, artisanal craft breweries, warm paper ephemera, and tactile stationery.

### 4.1 Color Tokens (`src/styles/tokens.css`)

| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--sage` | `#838D78` | Primary canvas mid-tone background (Olive-sage) |
| `--sage-deep` | `#5E6A54` | Deeper sage for sidebar, contrast panels, and borders |
| `--cream` | `#F8F7E6` | Warm cream text, header linework, and curtain surface |
| `--cream-dim` | `#E6E4D1` | Secondary muted text and subtle borders |
| `--cream-card` | `#FDFAF2` | Crisp cream surface for floating badges |
| `--oat` | `#D8D3BC` | Warm oat paper card surface (high contrast with ink) |
| `--oat-light` | `#E2DEC9` | Lighter oat tone for label strips and headers |
| `--orange` | `#EEB257` | Primary craft accent (warm marigold/amber orange) |
| `--orange-deep` | `#D99E41` | Hover state and active borders for amber elements |
| `--forest` | `#2F3A33` | Deep charcoal-pine for card footers and high-contrast text |
| `--forest-dark` | `#242C27` | Recessed dark wells and dark cards |
| `--ink` | `#26332A` | Crisp typography color on oat paper (contrast ratio > 8.7:1) |
| `--danger` | `#A8382A` | Muted brick-clay red for destructive actions |

### 4.2 Typography Stack (`src/styles/fonts.css`)
- **Display Headlines:** *Chelsea Market* (`font-display`) — Hand-cut bohemian retro sans with round terminals, wide-open C, low crossbars, and quirky authentic lowercase glyphs.
- **UI & Body:** *Nunito* / system sans-serif — Friendly, legible rounded grotesque sans.
- **Code & Raw Text:** *JetBrains Mono* (`font-mono`) — Monospaced font for raw markdown viewing, prompt headers, and token counts.

### 4.3 Material Shaders & Grain Overlay
A fixed full-screen SVG fractal noise grain overlay (`.grain-overlay`) is layered across the application with `pointer-events: none` and `mix-blend-mode: multiply` at `11%` opacity, giving digital surfaces the organic texture of unbleached cardstock.

---

## 5. Frontend Architecture & Component Hierarchy

### 5.1 Tech Stack
- **Framework:** React 18.3.1 (with TypeScript)
- **Bundler:** Vite 6.1.0
- **Routing:** React Router v6.29.0
- **State Management:** Zustand 5.0.3 (`useUIStore`)
- **Database:** Dexie 4.0.11 (IndexedDB wrapper) + `dexie-react-hooks`
- **Drag-and-Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Markdown Rendering:** `react-markdown` 9.0.3, `remark-gfm` 4.0.1, `rehype-sanitize` 6.0.0
- **Search:** MiniSearch 7.1.2
- **Compression / Archives:** `fflate` 0.8.2
- **Animation & Physics:** GSAP 3.15.0, Lenis 1.3.26
- **Cloud Backend (Opt-in):** Firebase 13.0.0 (Auth & Firestore)
- **Styling:** Tailwind CSS 3.4.17 with custom design tokens

### 5.2 Application Routing Structure (`src/DesktopApp.tsx`)

```
/                     -> Landing (Marketing page with GSAP & Lenis)
/privacy              -> Privacy (Verification walkthrough & zero-cloud proof)
/dev/fonts            -> DevFonts (Typography candidate inspector)
/app                  -> Shell (Main App Layout)
  ├── /app            -> Library (All files, Pinned section, Quick add)
  ├── /app/c/:id      -> CollectionView (Filtered files for collection or unsorted)
  ├── /app/f/:id      -> FileDetail (Preview/Raw split view, versions, copy modes)
  └── /app/settings   -> Settings (Storage quota, ZIP backup/restore, cloud sync)
/*                    -> NotFound (Custom 404 screen)
```

### 5.3 Shell Layout Hierarchy (`src/components/layout/Shell.tsx`)
```
Shell
├── DropOverlay (Full-window drag-drop ingestion target)
├── Sidebar
│   ├── Logo (Crate & Stash branding)
│   ├── Navigation Links (All Files, Pinned)
│   ├── Sortable Collections (@dnd-kit list with drag-to-sort and drop targets)
│   ├── Tag Filter Cloud
│   ├── Storage Quota Indicator
│   └── Cloud Sync Status Badge
├── Topbar
│   ├── Breadcrumb / Title
│   ├── Global Search Bar (with clear button & keyboard navigation)
│   ├── View Switcher (Grid vs. List)
│   ├── "New File" Button (+ Quick Add)
│   └── "Import" Button (Drop & File Picker)
├── Main Outlet (<Library /> | <CollectionView /> | <FileDetail /> | <Settings />)
├── BundleTray (Floating bottom drawer appearing on >=2 selections)
└── ToastContainer (Zustand-driven transient notifications)
```

---

## 6. Data Model & Client-Side Storage Engine (IndexedDB)

All persistent data is stored in the browser's IndexedDB instance using **Dexie.js** under database name `MDstashDB`.

### 6.1 Database Schema (`src/db/schema.ts`)

```typescript
export class MDstashDatabase extends Dexie {
  files!: Table<StashFile, string>;
  collections!: Table<Collection, string>;
  versions!: Table<Version, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('MDstashDB');
    this.version(1).stores({
      files: 'id, collectionId, filename, *tags, pinned, updatedAt, title',
      collections: 'id, order',
      versions: 'id, fileId, createdAt',
      settings: 'key',
    });
  }
}
```

### 6.2 Entity Types (`src/domain/types.ts`)

```typescript
export interface StashFile {
  id: string;              // UUID
  title: string;           // Derived or custom human-readable title
  filename: string;        // Stored filename e.g. "CLAUDE.md"
  content: string;         // Full markdown text content
  collectionId: string | null; // Parent collection ID (null = Unsorted)
  tags: string[];          // Free-form tag array
  pinned: boolean;         // Pinned status flag
  size: number;            // Size in bytes
  createdAt: number;       // Unix epoch ms
  updatedAt: number;       // Unix epoch ms
}

export interface Collection {
  id: string;              // UUID
  name: string;            // Collection name e.g. "Prompt Templates"
  color: string;           // Hex color accent
  icon: string;            // Icon identifier
  order: number;           // Sort rank for drag-and-drop ordering
  createdAt: number;
}

export interface Version {
  id: string;              // UUID
  fileId: string;          // Target StashFile reference
  content: string;         // Snapshot text content
  createdAt: number;       // Timestamp when snapshot was captured
}

export interface Setting {
  key: string;             // Setting identifier
  value: unknown;          // Setting value
}
```

### 6.3 Repository Pattern & Reactive Subscriptions
The database operations are decoupled into repository modules (`filesRepo`, `collectionsRepo`, `versionsRepo`, `settingsRepo`). 

In the React layer, `src/hooks/useDb.ts` uses `dexie-react-hooks` (`useLiveQuery`) to establish reactive database queries. When a file is created, edited, moved, or deleted in any component or background service, every subscribed view updates instantly without manual state synchronization.

---

## 7. Core Workflows & Business Logic

### 7.1 Ingestion & Import (Drag-and-Drop, Folder Traversal, Clipboard Paste)
MDstash supports three seamless ingestion channels:

1. **Global Drag-and-Drop Dropzone (`src/components/layout/Shell.tsx`):**
   - Dragging any file over the browser window activates `DropOverlay.tsx`.
   - Uses `webkitGetAsEntry()` in `fileImport.ts` to recursively scan directories if the user drops an entire project folder.
   - Automatically parses all `.md`, `.markdown`, `.txt`, and `.zip` archives.
   - Preserves directory structures by creating matching collections for root directories.
2. **Context-Aware Drops onto Collections:**
   - Dropping a card or native OS files onto a specific collection row in `Sidebar.tsx` immediately imports or moves files into that collection.
3. **Global Clipboard Intercept:**
   - Pressing `Ctrl+V` / `Cmd+V` anywhere in the app (outside active input elements) triggers `QuickAddModal.tsx` prefilled with clipboard contents.
   - Automatic title extraction (`extractTitle`) derives a clean title from the first `# Header` or non-empty line.

### 7.2 Search & Discovery (MiniSearch Client Engine)
Full-text client-side searching is handled by **MiniSearch** (`src/services/search.ts`):
- Indexes `title`, `filename`, `content`, and `tags`.
- Features fuzzy matching with prefix matching and auto-suggestions.
- Reactively resynchronizes with IndexedDB records on every dataset modification.

### 7.3 Organization (Collections, Drag-and-Drop Ordering, Tags, Pinning)
- **Collections:** User-defined grouping crates with customizable colors and icons.
- **Drag Reordering:** Powered by `@dnd-kit/sortable` using pointer and keyboard sensors. Reordering updates the `order` field persisted in IndexedDB.
- **Tags Cloud:** Dynamic aggregation of all active tags across files (`useAllTags`). Clicking a tag filters the library view instantly.
- **Pinning:** Files can be pinned via pushpin buttons, elevating them to a dedicated top shelf on the Library screen.

### 7.4 Markdown Preview & Sanitization
The `FileDetail.tsx` route provides a split-view experience:
- **Preview Tab:** Rendered via `react-markdown` with `remark-gfm` (tables, task lists, strikethrough) and `rehype-sanitize` (XSS prevention against malicious HTML/script injections).
- **Raw Tab:** Monospaced editing environment powered by JetBrains Mono.
- **Live Metrics:** Displays character count, line count, and byte size.

### 7.5 Version History & Snapshot Rollback
- Every manual edit or save action captures a snapshot in the `versions` IndexedDB table (`versionsRepo.create`).
- The `VersionHistoryModal` allows users to:
  - Inspect timestamped snapshots.
  - Review historical contents.
  - Roll back any file to an earlier version with one click.

### 7.6 AI Context Pipeline (Prompt Fencing, Multi-File Bundling)

MDstash addresses key frustrations when feeding markdown context into AI chats (Claude, ChatGPT, Cursor, GitHub Copilot):

#### Copy Modes (`src/domain/copyFormats.ts`)
1. **Prompt-ready:** Prepends document context with standardized headers:
   ```markdown
   ### File: CLAUDE.md

   <content>
   ```
2. **Fenced code block (Dynamic backtick calculation):**
   Markdown files often contain triple backtick code blocks (```). Wrapping them inside static triple backticks breaks markdown parsing. MDstash inspects the file for backtick sequences and dynamically generates a fence longer than the longest backtick group:
   ```typescript
   const backtickMatches = content.match(/`+/g);
   const maxBackticks = backtickMatches ? Math.max(...backtickMatches.map((m) => m.length)) : 0;
   const fenceLength = Math.max(3, maxBackticks + 1);
   const fence = '`'.repeat(fenceLength);
   return `${fence}markdown\n${content}\n${fence}`;
   ```
3. **Raw:** Copies the exact plain text without modifications.

#### Multi-File Context Bundling (`src/components/bundle/BundleTray.tsx`)
- Selecting two or more files activates the floating **Bundle Tray**.
- Allows reordering files up and down to structure LLM context primacy.
- Bundles all selected files into a single master prompt payload:
  ```markdown
  # Bundled Markdown Context (3 files)
  1. `AGENTS.md` (Agents Instructions)
  2. `CLAUDE.md` (Project Guidelines)
  3. `schema.sql` (Database DDL)

  ---

  ### File: AGENTS.md
  ...
  ---
  ### File: CLAUDE.md
  ...
  ```

### 7.7 Drag-Out Engine (`text/plain` and Chromium `DownloadURL`)
The drag handle on file cards (`setupDragOut` in `src/services/dragOut.ts`) configures browser drag events with two payload types:
1. `text/plain`: Pastes markdown content directly into any target text field, terminal, Claude chat box, or IDE editor window.
2. `DownloadURL`: In Chromium browsers, dragging the card out of the browser window onto the OS Desktop or File Explorer downloads the note as a real `.md` file on the filesystem.

### 7.8 Portable Backup & Restore (`fflate` Zip Architecture)
Using `fflate` (`src/services/importExport.ts`), MDstash provides zero-lock-in migration:
- **Export:** Packages all notes into a `.zip` archive. Notes are organized in real folders named after their collections (e.g. `Prompts/system-prompt.md`, `Unsorted/scratch.md`). It also includes a machine-readable `manifest.json`.
- **Import:** Reads user-supplied zip files, reconstructs collection hierarchies, and restores all files into IndexedDB.

### 7.9 Storage Persistence & Quota Management
Browsers can evict IndexedDB data if device storage becomes constrained. MDstash mitigates this via `persistenceService.ts`:
- Requests durable storage via `navigator.storage.persist()`.
- Queries `navigator.storage.estimate()` to show live disk usage and remaining quota in the Settings view.

---

## 8. Optional Cloud Synchronization (Firebase Integration)

While MDstash is strictly local-first by default, users who wish to sync their stash across multiple desktop workstations can optionally connect an encrypted Google account.

### 8.1 Opt-in Model
- No cloud calls are made until the user explicitly opens the **Cloud Sync** modal in `Settings.tsx` or `Sidebar.tsx` and signs in.
- All credentials are handled via Firebase Auth (`signInWithPopup(GoogleAuthProvider)`).

### 8.2 Synchronization Mechanics (`src/services/cloudSync.ts`)
- **Push Pipeline:** Any local write in `filesRepo` or `collectionsRepo` triggers an asynchronous background push to Firestore under `users/{uid}/files/{fileId}`.
- **Pull Pipeline:** Real-time listeners (`onSnapshot`) track remote collection and file updates.
- **Conflict Resolution:** Last-write-wins based on `updatedAt` timestamps.
- **Batch Processing:** Initial sync utilizes Firestore `writeBatch` to synchronize all local files without flooding HTTP requests.

---

## 9. Marketing Landing Page & Motion Engine

The marketing landing page (`src/routes/Landing.tsx`) features high-precision physics-based scrolling and brand storytelling.

### 9.1 Motion & Scroll Stack
- **Lenis Smooth Scroll:** Provides weighted inertia scrolling (`duration: 1.05`, custom exponential ease-out).
- **GSAP & ScrollTrigger:** Drives scroll-synchronized transitions:
  - **The Cream Curtain:** Smooth transition where an arched SVG curtain rolls up over the olive sage background, inverting navigation themes.
  - **Dynamic Spline Curve:** An SVG connector line calculated via spline interpolation connecting the "How It Works" story cards, with an animated canvas particle traveling along the path.
  - **Interactive Playground:** An interactive sandbox letting prospective users test prompt fencing, backtick escapes, and tag filtering directly on the landing page before entering the app.
  - **Privacy Proof Panel:** A real-time devtools inspector mockup proving that zero network requests are dispatched while creating notes.

---

## 10. Build, Deployment & Offline PWA Capabilities

### 10.1 PWA Offline Support (`vite-plugin-pwa`)
MDstash is configured as an installable Progressive Web App:
- Service worker caches application shell, fonts, and assets.
- Full offline functionality — the app can run on an airplane with zero network connection.

### 10.2 Production Scripts & Build Commands
```bash
# Start local development server
npm run dev

# Run TypeScript typechecks and production build
npm run build

# Run unit tests via Vitest
npm run test

# Run ESLint linter
npm run lint
```

### 10.3 Deployment Configuration (`netlify.toml`)
Configured for single-page application (SPA) routing with rewrite rules:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 11. Summary File Map

| File Path | Description & Responsibility |
| :--- | :--- |
| `src/App.tsx` | Root component, desktop media query gating, cleanup routines |
| `src/DesktopApp.tsx` | Desktop application router and route registry |
| `src/db/schema.ts` | Dexie.js database schema definition and index declarations |
| `src/db/files.repo.ts` | File CRUD repository, transactions, and cloud sync hooks |
| `src/db/collections.repo.ts` | Collection CRUD and ordering operations |
| `src/db/versions.repo.ts` | Version snapshot persistence and rollback |
| `src/domain/copyFormats.ts` | Prompt-ready, fenced code block, and raw copy formatting |
| `src/domain/bundle.ts` | Multi-file bundling logic and table-of-contents generator |
| `src/services/dragOut.ts` | `text/plain` and Chromium `DownloadURL` drag-out provider |
| `src/services/fileImport.ts` | Recursive directory traversal via `webkitGetAsEntry` |
| `src/services/importExport.ts` | `fflate` zip archive creator and importer |
| `src/services/search.ts` | MiniSearch client-side indexing and fuzzy querying |
| `src/services/cloudSync.ts` | Optional Firebase Firestore sync service |
| `src/store/uiStore.ts` | Zustand global UI state (selection, search query, toasts) |
| `src/routes/Library.tsx` | Main files explorer (grid/list, pinned shelf, search) |
| `src/routes/FileDetail.tsx` | Split markdown preview, raw editor, versions, copy menu |
| `src/routes/CollectionView.tsx` | Collection filtered file view |
| `src/routes/Settings.tsx` | Quota inspector, zip backup/restore, cloud auth |
| `src/routes/Landing.tsx` | Brand landing page with Lenis smooth scroll and GSAP |
| `src/components/gate/DesktopGate.tsx` | Mobile/touch gating screen with sharing utilities |
| `src/components/bundle/BundleTray.tsx` | Floating multi-select bundle drawer and reordering |
| `src/styles/tokens.css` | Design system color variables, typography tokens, surfaces |
