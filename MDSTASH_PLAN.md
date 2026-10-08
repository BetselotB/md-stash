# MDstash — Master Plan

> A local-first organizer for Markdown files. Drag files in, sort them into collections, copy or drag them back out into your IDE or AI chat. Nothing ever leaves your device.

This document is the single source of truth for the project: product, design, architecture, data model, and a phase-by-phase build roadmap with commits and deliverables. Feed it to your AI IDE as context.

---

## 1. Product

### 1.1 One-liner
Your markdown files, stashed, sorted, and ready to drop anywhere.

### 1.2 Principles
1. **Local-first, private by default.** All data lives in the browser (IndexedDB, optionally a real folder). No backend, no tracking, no account required.
2. **Simple.** Drop, sort, copy. Every core action is one gesture.
3. **Never lose a file.** Persistent storage request, version history, one-click export/import.
4. **Craft feel.** Retro, handmade, calm. Not another cold SaaS dashboard.
5. **Shareable online.** Static site, installable PWA, works offline.

### 1.3 Target users
Developers and AI-tool users who keep many context files (`CLAUDE.md`, `AGENTS.md`, `README`s, cursor rules, prompts, notes) and keep re-pasting them.

### 1.4 Non-goals (v1)
- No user accounts, no cloud sync, no server storage.
- No full markdown editor (light edit only; this is an organizer, not Obsidian).
- No collaboration.

---

## 2. Features

### 2.1 v1 (launch)
| Feature | Notes |
|---|---|
| Drag-and-drop import | Multi-file, `.md` / `.markdown` / `.txt`; also whole-folder drops |
| Collections | Name, color, icon; reorder; drag files between them |
| Tags | Free-form, on top of collections |
| File detail page | Rendered preview + raw toggle, metadata, light edit |
| Copy modes | Raw, as fenced code block, as prompt-ready snippet (with filename header) |
| Drag-out | Drag a file to desktop/IDE (see 6.4) |
| Quick-add via paste | Paste text anywhere, it becomes a new file |
| Pin / favorites | Pinned section at top |
| Search | Titles + content, fuzzy, local (MiniSearch) |
| Bundles | Multi-select, copy as one combined block with file headers |
| Version history | Snapshot on edit, restore/diff |
| Export / import | Full library as `.zip` (real `.md` files + `manifest.json`) |
| PWA | Installable, offline |
| Landing page | See section 8 |

### 2.2 v1.5 (post-launch)
- **Share via URL fragment:** compressed content in `#...` (never sent to a server). Small files only; show a size warning.
- **Folder sync (File System Access API):** user picks a real folder; MDstash reads/writes actual `.md` files. Chromium only, progressive enhancement.
- **Token counts:** per file and per bundle, lazy-loaded tokenizer.
- **Templates:** starters for `CLAUDE.md`, `AGENTS.md`, `README`, cursor rules.

### 2.3 Later
- Optional Google sign-in via Firebase for end-to-end-encrypted sync (opt-in only).
- VS Code extension / CLI to pull from your stash.
- Keyboard command palette.

---

## 3. Name & Brand

- **Name:** MDstash
- **Tagline options:** "Stash it. Sort it. Drop it anywhere." / "Your markdown, close at hand." / "Local markdown, zero cloud."
- **Logo:** SVG icon already generated, stored at `public/logo.svg`. Wordmark is typeset in the headline font (do not generate lettering with image tools).
- **Pre-launch checks:** domain, npm package name, GitHub org/handle, trademark glance.

---

## 4. Design System

Reference: Brew District landing (sage background, cream type, dusty pink accent, chunky condensed retro headlines). Body font inspired by National Park (rounded, friendly sans).

### 4.1 Color tokens
| Token | Hex | Use |
|---|---|---|
| `--sage` | `#6B7B6E` | Page background |
| `--sage-deep` | `#5A6A5D` | Subtle section contrast, hover |
| `--forest` | `#2F3A33` | Cards, panels, code surfaces |
| `--cream` | `#F5F2E3` | Primary text, linework |
| `--cream-dim` | `#D9D6C6` | Secondary text |
| `--pink` | `#C99AB5` | Single accent: CTAs, active states, highlights |
| `--pink-deep` | `#B5839F` | Accent hover/pressed |
| `--line` | `rgba(245,242,227,0.35)` | Thin rules and borders |

Rules: one accent only (pink). No light/dark switch; the sage look is the theme. Check contrast of cream-on-sage for small text; use `--forest` panels under long-form reading.

### 4.2 Typography
- **Display / headlines:** a chunky condensed face (Anton or Bebas Neue), uppercase, tight leading.
- **UI / body:** National Park (SIL OFL, free) if self-hosted; fallback Nunito/Inter.
- **Mono (raw view):** JetBrains Mono.
- Self-host fonts as `woff2` (no third-party requests; consistent with the privacy claim).

### 4.3 Look & feel
- Subtle grain/noise overlay on the sage background.
- Thin cream rule lines, circular stamp-style badges, rounded pill buttons (pink fill, forest text).
- Motion: gentle, spring-like on drag/drop; respect `prefers-reduced-motion`.

---

## 5. Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Build | Vite + React + TypeScript | Static output, fast dev |
| Routing | React Router | Simple SPA routes |
| Styling | Tailwind CSS (tokens in CSS variables) | Fast, consistent |
| State | Zustand (UI) + Dexie `liveQuery` (data) | Light, reactive |
| Storage | IndexedDB via Dexie | Reliable, queryable |
| Search | MiniSearch | Local fuzzy search |
| DnD (in-app) | dnd-kit | Sortable, accessible |
| DnD (in/out of browser) | Native HTML5 drag events | File import and drag-out |
| MD render | `react-markdown` + `remark-gfm` + `rehype-sanitize` | Safe preview |
| Zip | `fflate` | Export/import, also share-link compression |
| PWA | `vite-plugin-pwa` | Offline + install |
| Tests | Vitest + Testing Library; Playwright for e2e | Confidence |
| Lint/format | ESLint + Prettier | Consistency |
| Hosting | Cloudflare Pages / Netlify / Vercel (static) | Free |
| Later | Firebase Auth (Google only), File System Access API | Optional |

---

## 6. Architecture

### 6.1 Overview
```
Browser
├── UI (React)
│   ├── Landing (public marketing page)
│   └── App (library, collections, file detail, bundles, settings)
├── Domain layer (pure TS: copy formatters, bundle builder, parser, tag utils)
├── Data layer (Dexie repositories: files, collections, versions, settings)
├── Services
│   ├── search (MiniSearch index, rebuilt from Dexie)
│   ├── import/export (fflate zip)
│   ├── clipboard (copy modes)
│   ├── dragout (DownloadURL + text/plain)
│   └── persistence (navigator.storage.persist, quota)
└── PWA shell (service worker, manifest)
```
No network calls in the app. The only requests are static assets from the host.

### 6.2 Folder structure
```
mdstash/
├── public/
│   ├── logo.svg              # generated icon (already in project)
│   ├── favicon.svg
│   ├── icons/                # PWA icons (192, 512, maskable)
│   └── fonts/                # self-hosted woff2
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── Landing.tsx
│   │   ├── Library.tsx
│   │   ├── CollectionView.tsx
│   │   ├── FileDetail.tsx
│   │   ├── Settings.tsx
│   │   ├── SharedView.tsx    # v1.5
│   │   └── Privacy.tsx
│   ├── components/
│   │   ├── layout/           # Shell, Sidebar, Topbar
│   │   ├── library/          # DropZone, FileCard, CollectionList, TagChips
│   │   ├── file/             # Preview, RawView, CopyMenu, DragHandle, VersionList
│   │   ├── bundle/           # BundleTray, BundleBuilder
│   │   ├── landing/          # Hero, HowItWorks, Features, Privacy, Footer
│   │   └── ui/               # Button, Dialog, Toast, Badge, Input
│   ├── db/
│   │   ├── schema.ts         # Dexie schema + migrations
│   │   ├── files.repo.ts
│   │   ├── collections.repo.ts
│   │   ├── versions.repo.ts
│   │   └── settings.repo.ts
│   ├── domain/
│   │   ├── copyFormats.ts    # raw / codeblock / prompt
│   │   ├── bundle.ts
│   │   ├── titleFromContent.ts
│   │   └── types.ts
│   ├── services/
│   │   ├── search.ts
│   │   ├── importExport.ts
│   │   ├── dragOut.ts
│   │   ├── persistence.ts
│   │   └── share.ts          # v1.5
│   ├── hooks/
│   ├── styles/
│   │   ├── tokens.css        # color/type variables
│   │   └── index.css
│   └── lib/
├── tests/
│   ├── unit/
│   └── e2e/
├── vite.config.ts
├── tailwind.config.ts
├── MDSTASH_PLAN.md          # this file
└── README.md
```

### 6.3 Data model (Dexie / IndexedDB)

```ts
// src/domain/types.ts
export interface StashFile {
  id: string;               // uuid
  title: string;            // from first H1 or filename
  filename: string;         // e.g. "CLAUDE.md"
  content: string;
  collectionId: string | null;
  tags: string[];
  pinned: boolean;
  size: number;             // bytes
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  color: string;            // token name or hex
  icon: string;             // icon key
  order: number;
  createdAt: number;
}

export interface Version {
  id: string;
  fileId: string;
  content: string;
  createdAt: number;
}

export interface Setting { key: string; value: unknown; }
```

```ts
// src/db/schema.ts
db.version(1).stores({
  files: 'id, collectionId, *tags, pinned, updatedAt, title',
  collections: 'id, order',
  versions: 'id, fileId, createdAt',
  settings: 'key',
});
```
Always add a new `db.version(n)` for changes; never edit a shipped version.

### 6.4 Key behaviors

**Import**
- Accept drops anywhere on the app plus a file picker. Read via `File.text()`.
- Folder drops: use `DataTransferItem.webkitGetAsEntry()` to walk directories, keep only markdown-like extensions.
- Dropped onto a collection = assigned to it; otherwise lands in "Unsorted".
- Dedupe prompt on identical filename + content hash.

**Copy modes** (`copyFormats.ts`)
- *Raw:* file content as-is.
- *Code block:* fenced with `markdown` language, safely handling content containing backticks (use a longer fence).
- *Prompt-ready:* `### File: <filename>` header followed by content.

**Bundles**
- Multi-select files, order them, copy as one block with per-file headers. v1.5 adds a combined token count.

**Drag-out**
- On `dragstart` of the file handle, set both:
  - `text/plain` = file content (works when dropping into editor text areas and chat inputs),
  - `DownloadURL` = `text/markdown:<filename>:<blob-url>` (Chromium: creates a real file on desktop/Finder/Explorer).
- Caveat: browsers cannot reliably drop into an IDE's file explorer. Document honestly and always offer Copy and Download as fallbacks. Test matrix in Phase 4.

**Persistence**
- Call `navigator.storage.persist()` on first successful import; surface status and quota in Settings.
- Show a gentle "Back up your stash" nudge after N files or X days.

**Export / import**
- Export: zip of real `.md` files in collection folders plus `manifest.json` (collections, tags, pins, timestamps).
- Import: read manifest if present, otherwise treat folders as collections.

**Search**
- MiniSearch index over `title`, `filename`, `content`, `tags`; incrementally updated on writes; boosted title matches.

**Security**
- Sanitize rendered markdown (`rehype-sanitize`); never use `dangerouslySetInnerHTML` with raw content.
- Strict CSP in host config; no third-party scripts, analytics, or font CDNs.

### 6.5 Routes
| Path | Screen |
|---|---|
| `/` | Landing |
| `/app` | Library (all files, pinned, unsorted) |
| `/app/c/:collectionId` | Collection view |
| `/app/f/:fileId` | File detail |
| `/app/settings` | Storage, export/import, about |
| `/s` | Shared view (v1.5, reads URL fragment) |
| `/privacy` | Plain-language privacy statement |

---

## 7. App UX Spec

- **Library layout:** left sidebar (collections, tags, pinned), main grid/list of file cards, top bar with search and "Add" button, full-window drop overlay on drag.
- **File card:** title, filename, size, tags, collection color dot, pin toggle, drag handle, multi-select checkbox.
- **File detail:** header (title, collection, tags), tabs `Preview | Raw`, sticky action bar: **Copy** (with mode dropdown), **Download**, **Drag me** handle, **Edit**, **History**.
- **Bundle tray:** appears at the bottom when 2+ files are selected: reorder, choose format, **Copy bundle**.
- **Empty states:** friendly, illustrated with the logo; big drop target.
- **Accessibility:** keyboard operable DnD (dnd-kit sensors), visible focus rings in pink, ARIA live toasts for copy.

---

## 8. Landing Page Spec

Style: the Brew District reference. Sage background, cream type, pink accent, condensed headline, grain, thin rules.

1. **Nav:** logo mark, "How it works", "Features", "Privacy", pink pill **Open MDstash**.
2. **Hero:** huge condensed headline, e.g. "YOUR MARKDOWN, STASHED. NOTHING LEAVES YOUR DEVICE." Subline: "Drag in, sort out, drop anywhere." Primary CTA **Open the app**; secondary **See how it works**. The logo mark floats centered over the headline like the can in the reference, with a subtle parallax/tilt on hover.
3. **Circular badge:** rotating text ring ("LOCAL FIRST · PRIVATE & HONEST") beside the scroll arrow.
4. **How it works (3 steps):** Drag in → Sort into collections → Copy or drag out.
5. **Features grid:** collections, bundles, drag-out, search, version history, offline.
6. **Privacy section:** "No account. No server. No tracking." with a short how-it-works explanation (IndexedDB, optional folder sync).
7. **Use cases:** CLAUDE.md / AGENTS.md / cursor rules / prompts.
8. **Final CTA + footer:** links (GitHub, Privacy), "Made with care."

---

## 9. Build Roadmap

Conventions:
- Branching: `main` (deployable) + short-lived `feat/*` branches.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Each phase ends with a working, deployable state.

### Phase 0 — Setup (0.5 day)
**Tasks**
- Create repo, add this plan, choose license (MIT suggested), reserve name/domain.
- Scaffold Vite + React + TS; add Tailwind, ESLint, Prettier, Vitest.

**Commits**
- `chore: scaffold vite react ts`
- `chore: add tailwind, eslint, prettier, vitest`
- `docs: add MDSTASH_PLAN.md and README`

**Deliverables:** repo runs locally; CI lint + test on push.

### Phase 1 — Foundation & Design System (1 day)
**Tasks**
- Define tokens in `tokens.css`; wire to Tailwind theme.
- Self-host fonts; add grain overlay.
- Place `logo.svg`; create favicon; build `Logo` component.
- Build UI primitives: Button, Badge, Input, Dialog, Toast.
- App shell with sidebar/topbar and router skeleton.

**Commits**
- `feat(ui): design tokens and global styles`
- `feat(ui): self-hosted fonts and grain background`
- `feat(brand): logo component and favicon`
- `feat(ui): base components`
- `feat(app): layout shell and routes`

**Deliverables:** styled empty app matching the sage/cream/pink palette; a tiny `/dev/ui` page showing all primitives.

### Phase 2 — Data Layer (1 day)
**Tasks**
- Dexie schema v1; repositories with typed CRUD.
- `liveQuery` hooks (`useFiles`, `useCollections`).
- Title/filename helpers; content hashing for dedupe.
- Persistence service (`storage.persist`, quota estimate).

**Commits**
- `feat(db): dexie schema and repositories`
- `feat(db): live query hooks`
- `feat(domain): title extraction and hashing`
- `feat(services): storage persistence`
- `test(db): repository unit tests`

**Deliverables:** tested CRUD for files/collections; data survives reload.

### Phase 3 — Library & Import (2 days)
**Tasks**
- Full-window drop overlay; file picker; folder-drop traversal.
- Library grid/list; file cards; Unsorted default.
- Collections CRUD (name, color, icon, reorder).
- Drag files onto collections (dnd-kit); tags editor.
- Toasts and empty states.

**Commits**
- `feat(import): drag and drop and file picker`
- `feat(import): folder drop traversal and dedupe`
- `feat(library): file cards and views`
- `feat(collections): create, edit, reorder`
- `feat(dnd): move files between collections`
- `feat(tags): add and filter by tags`

**Deliverables:** user can import many files and organize them into collections with tags.

### Phase 4 — File Detail, Copy & Drag-out (2 days)
**Tasks**
- Detail route with Preview/Raw tabs; sanitized markdown render.
- Copy menu (raw, code block, prompt-ready) with confirmation toast.
- Download button; light editor with save.
- Drag-out handle (`text/plain` + `DownloadURL`); test matrix: Chrome, Edge, Firefox, Safari × desktop, VS Code editor pane, VS Code explorer, Cursor, chat inputs. Record results in README.

**Commits**
- `feat(file): detail page with preview and raw`
- `feat(clipboard): copy modes`
- `feat(file): download and light edit`
- `feat(dragout): drag file out to desktop and editors`
- `docs: drag-out compatibility matrix`

**Deliverables:** open a file, copy it three ways, drag it out where supported, with documented limits.

### Phase 5 — Search, Pins, Quick-add (1 day)
**Tasks**
- MiniSearch index service; search bar with results and highlights.
- Pin/unpin; pinned section.
- Global paste handler → "Save as new file?" dialog.

**Commits**
- `feat(search): minisearch index and ui`
- `feat(library): pin favorites`
- `feat(import): quick-add via paste`

**Deliverables:** instant local search; pinned files; paste-to-create.

### Phase 6 — Bundles (1 day)
**Tasks**
- Multi-select state; bundle tray; reorder; format choice.
- `bundle.ts` builder with per-file headers; copy bundle.

**Commits**
- `feat(bundle): multi-select and tray`
- `feat(bundle): combined copy with headers`
- `test(bundle): formatter tests`

**Deliverables:** select several files, copy as one prompt-ready block.

### Phase 7 — Versions, Export/Import, Settings (1.5 days)
**Tasks**
- Snapshot on save (debounced, capped per file); history list; restore; simple diff.
- Export zip + manifest; import zip with merge/skip options.
- Settings page: storage status, persist request, backup nudge, danger zone (wipe).

**Commits**
- `feat(versions): snapshots and restore`
- `feat(export): zip export with manifest`
- `feat(import): zip import`
- `feat(settings): storage status and backup nudge`
- `test: export/import round trip`

**Deliverables:** nobody loses data; round-trip export/import verified.

### Phase 8 — Landing Page (2 days)
**Tasks**
- Build sections per section 8; hero with floating logo, rotating badge, grain.
- Responsive pass (mobile first); reduced-motion variants.
- Privacy page in plain language.

**Commits**
- `feat(landing): hero and nav`
- `feat(landing): how it works, features, privacy`
- `feat(landing): footer, final cta`
- `feat(landing): responsive and motion polish`
- `docs: privacy page`

**Deliverables:** shareable landing page that clearly sells the local-first idea.

### Phase 9 — PWA, Polish, QA (1.5 days)
**Tasks**
- `vite-plugin-pwa` manifest, icons (incl. maskable), offline caching.
- Accessibility audit (keyboard DnD, contrast, focus); Lighthouse ≥ 90.
- Playwright e2e: import → organize → copy → export → re-import.
- Performance check with 1,000+ files.
- Error boundaries and quota-exceeded handling.

**Commits**
- `feat(pwa): manifest, icons, service worker`
- `fix(a11y): focus, contrast, keyboard dnd`
- `test(e2e): core flows`
- `perf: virtualize large lists`
- `fix: quota and error handling`
- `chore: release v1.0.0`

---

## 10. Quality Bar (Definition of Done per feature)
- Works with keyboard only.
- No network requests triggered by user content.
- Unit tests for domain logic; e2e for the core flow.
- No data-loss path (writes are awaited and errors surfaced).
- Matches design tokens; no off-palette colors.

---

## 11. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Browser evicts IndexedDB | `storage.persist()`, backup nudge, easy export, PWA install |
| Drag-out inconsistent across browsers/IDEs | Progressive enhancement, documented matrix, Copy/Download fallbacks |
| Large libraries slow search/render | Virtualized lists, incremental index, lazy-load heavy libs |
| Share links too long | Size guard, suggest zip export for big content |
| Firefox/Safari lack File System Access | Folder sync is optional; IndexedDB is the baseline |
| XSS from rendered markdown | `rehype-sanitize`, strict CSP |
| Name conflicts | Verify domain/npm/GitHub early (Phase 0) |

---

## 12. Open Decisions
- [ ] Final tagline.
- [ ] License (MIT vs. other).
- [ ] Hosting provider and domain.
- [ ] Whether to ship optional Firebase sign-in at all, or keep MDstash account-free permanently as a selling point.
- [ ] Display font final pick (Anton vs. Bebas Neue vs. other condensed face).

---

## 13. First Session Checklist
1. `npm create vite@latest mdstash -- --template react-ts`
2. Add `public/logo.svg` (already generated) and this file to the repo root.
3. Install: `tailwindcss`, `dexie`, `dexie-react-hooks`, `zustand`, `react-router-dom`, `@dnd-kit/core`, `@dnd-kit/sortable`, `minisearch`, `react-markdown`, `remark-gfm`, `rehype-sanitize`, `fflate`, `vite-plugin-pwa`.
4. Create `tokens.css` from section 4.1.
5. Start Phase 1.
