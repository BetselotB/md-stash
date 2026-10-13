# 01 — MDstash Upgrade Plan: Component Library Platform

## 1. Vision

MDstash stays what it is visually — a warm, tactile crate of things you keep — but the things in the crates are now **8,000+ living UI components** you can see running, copy in the exact form you need, extend whenever you want, and hand to any AI agent by pasting one link.

**Three promises**
1. *See it:* every component that can render, renders live (and as a thumbnail in the grid).
2. *Take it:* one click gives code, markdown, an AI prompt, an install command, or a deep link into an AI tool.
3. *Share it with agents:* one MCP URL or one prompt-link makes every agent use *your* library first.

### What stays / changes

| Area | Stays | Changes |
|---|---|---|
| Visual system | tokens, fonts, grain, crates, pushpins, label strips | new screens only reuse them; add `--preview-well` etc. |
| Notes (`StashFile`) | all CRUD, versions, tags | becomes **Docs & Rules** (AGENTS.md, design rules, prompt templates) — also served to agents |
| Collections | sidebar + drag-sort | become **Kits** (ordered component sets + notes), shareable as links |
| Library route | grid/list, search, pins | **Gallery** of components (virtualized, thumbnails, filters) |
| FileDetail | preview/raw/versions/copy modes | **ComponentDetail** with live preview + tabs; FileDetail remains for Docs |
| Bundle tray | multi-select → prompt bundle | **Kit tray**: prompt bundle, install command, zip, save as kit |
| Cloud sync | optional Firebase | replaced by **own API sync** (same opt-in model); Firebase Auth kept for sign-in |
| Search | MiniSearch | MiniSearch over metadata (client) + FTS5 (server) |

Working name in code: `APP_NAME` constant (currently "MDstash"); rename later without refactors.

## 2. Corpus audit (Phase 0) — problems to fix before anything else

Findings from the corpus guide that the plan must resolve:

| # | Finding | Action |
|---|---|---|
| A1 | **4,182 / 8,072 (52%) are in `misc`** | Re-classify using `kind` + better taxonomy. Target `misc` < 15%. Rules: registry type → folder/path → source category → keyword map → (optional, offline, batched) LLM labeling pass with human spot-check |
| A2 | Guide claims uniform "TSX + Tailwind", but Mantine, MUI, Ant Design, Chakra, Base UI, React Aria, Ark, HeroUI are not Tailwind-first | Compute `styling` truth per component from code (class usage, `styled`, `sx`, CSS modules imports). Add `requires` (e.g. `@mantine/core`). Show a styling badge; allow filtering. Do not claim Tailwind where it isn't |
| A3 | Inconsistent ids (`dialog--radix-ui`, `dialog`, `components-backgrounds-stars`, `messageprimitive`) | Deterministic slug rules: `<name>` if unique else `<name>--<source>`; strip path-derived prefixes; human `name` from registry or title-cased slug; keep old ids as `aliases` for redirects |
| A4 | No `kind` | Add `kind: component | primitive | block | hook | util | style | icon-index`. Sub-parts like `PopperAnchor`, `VisuallyHidden`, context providers → `primitive` (hidden from default gallery, still fetchable) |
| A5 | Previewability unknown | Probe each item (compile + render smoke test, §6) → `preview` status + reason |
| A6 | Props only in some md files | Extract props from TS types with `ts-morph` into a normalized `props[]` |
| A7 | Shared asset enum has only `utils/cn` | Inventory all `shared/*` and `registry_deps`; resolve a full dependency graph (`depends_on` component ids + npm `deps`) |
| A8 | License is a bare SPDX id | Add `attribution` (copyright line + source URL) captured from repo LICENSE; required in copy outputs |
| A9 | Import alias `utils/cn` is non-standard | Keep canonical form in storage, **rewrite on output** to the caller's alias (default `@/lib/utils`) |
| A10 | Duplicate/near-dup re-check after re-classification | Re-run hash/simhash checks; report |

Deliverable: `/docs/AUDIT-REPORT.md` with before/after counts per category, per `kind`, per `styling`, per `preview` status.

## 3. Architecture

```
                         ┌────────────────────────── apps/web (MDstash, local-first) ───────────────────────────┐
 /corpus ──► corpus-build│ Gallery · ComponentDetail · Kits · Docs&Rules · Editor · Agent Access               │
 (Node)      │           │ Dexie (components meta + lazy code) · MiniSearch · preview runtime (iframe)          │
   │         │           └───────────────▲──────────────────────────────────────────────┬───────────────────────┘
   │ publish │                           │ sync (owner token)                            │ same runtime
   ▼         ▼                           │                                               ▼
 registry JSON · catalog.json · thumbs ──┴──► apps/api (Cloudflare Workers + Hono)    Playwright thumbnails
                                              ├─ /mcp            MCP (Streamable HTTP)
                                              ├─ /r/{id}.json    shadcn registry items
                                              ├─ /c/{id}.md      raw markdown (token-lean)
                                              ├─ /kit/{slug}.md  kit as prompt-ready bundle
                                              ├─ /llms.txt       prompt-link for chats without MCP
                                              ├─ /api/*          REST (search, get, install-plan, admin)
                                              └─ D1 (FTS5, tokens, usage, wishlist) · R2 (bodies, thumbs) · KV (hot cache)
```

**Source of truth:** the API (D1/R2). The manage app is a local-first *cache + editor*: it works offline for browsing and editing, and syncs when connected (last-write-wins by `updatedAt`, same as today). Notes/Docs sync through the same API.

**Why edge + static artifacts:** immutable per-component JSON on a CDN is the fastest possible `get`; D1 FTS5 handles search; MCP/REST handlers are thin.

## 4. Data model v2

### 4.1 Component record (shared zod schema in `packages/shared`)

```ts
interface Component {
  id: string;                    // stable slug; aliases[] redirect
  name: string;
  kind: 'component'|'primitive'|'block'|'hook'|'util'|'style'|'icon-index';
  category: Category;            // taxonomy (refined, §2 A1)
  subcategory?: string;
  tags: string[];
  framework: 'react'|'vue'|'svelte'|'solid';
  styling: 'tailwind'|'css'|'css-modules'|'css-in-js'|'mixed';
  requires: string[];            // UI libs needed beyond React (e.g. '@mantine/core')
  language: 'tsx'|'ts'|'jsx';
  deps: string[];                // npm packages (with pinned semver range when known)
  dependsOn: string[];           // other component ids in the library
  shared: string[];              // shared assets (utils/cn, styles/...)
  code: string;                  // canonical source
  description: string;
  usage?: string;                // minimal example (first valid)
  props: Prop[];                 // extracted
  preview: { status:'ready'|'needs-demo'|'primitive'|'unsupported'; mode?:'usage'|'auto-props'|'demo'; demo?:string; reason?:string; thumb?:string };
  license: string; attribution: string;
  sources: { source:string; url:string; relation:string }[];
  variants?: { label:string; diff:string; source:string }[];
  hashes: { content:string; ast:string };
  origin: 'harvested'|'user';    // user = added/edited by owner
  favorite: boolean;             // pushpin; boosts ranking for agents
  notes?: string;                // owner's private notes
  createdAt:number; updatedAt:number; version:number;
}
```

### 4.2 Dexie v2 (migration from v1 is additive)

```ts
this.version(2).stores({
  files:       'id, collectionId, filename, *tags, pinned, updatedAt, title',   // unchanged (Docs & Rules)
  collections: 'id, order',                                                      // reused as Kits metadata
  versions:    'id, fileId, createdAt',
  settings:    'key',
  components:  'id, category, kind, source, favorite, origin, updatedAt, *tags, previewStatus',  // metadata only
  codeBlobs:   'id',          // { id, code, props, usage } lazy-loaded per component
  kitItems:    '[kitId+id], kitId, order',
  compVersions:'id, componentId, createdAt',   // history for user-edited components
  wishlist:    'id, status, createdAt',        // synced from agent requests
  sync:        'key'
});
```

Rules: `components` holds only metadata (~0.5 KB each ⇒ ~4 MB for 8k) so listing/search is instant; `codeBlobs` loads on demand. A MiniSearch index is built over `name, tags, category, description, requires` (not code) and persisted/serialized after first build.

### 4.3 Server schema (D1)

```sql
CREATE TABLE components (id TEXT PRIMARY KEY, name TEXT, kind TEXT, category TEXT, subcategory TEXT,
  tags TEXT, framework TEXT, styling TEXT, requires TEXT, deps TEXT, depends_on TEXT, shared TEXT,
  description TEXT, license TEXT, favorite INTEGER, origin TEXT, preview_status TEXT, thumb_key TEXT,
  body_key TEXT,            -- R2 key of the full record JSON
  content_hash TEXT, updated_at INTEGER, version INTEGER);
CREATE VIRTUAL TABLE components_fts USING fts5(id, name, tags, category, description, requires, tokenize='porter unicode61');
CREATE TABLE kits (slug TEXT PRIMARY KEY, name TEXT, description TEXT, items TEXT, updated_at INTEGER);
CREATE TABLE docs (id TEXT PRIMARY KEY, title TEXT, kind TEXT, body_key TEXT, updated_at INTEGER); -- rules, tokens, templates
CREATE TABLE tokens (id TEXT PRIMARY KEY, name TEXT, hash TEXT, scope TEXT, created_at INTEGER, last_used INTEGER, revoked INTEGER);
CREATE TABLE usage (ts INTEGER, token_id TEXT, client TEXT, tool TEXT, component_id TEXT, query TEXT, hits INTEGER, ms INTEGER);
CREATE TABLE wishlist (id TEXT PRIMARY KEY, query TEXT, description TEXT, count INTEGER, status TEXT, first_seen INTEGER, last_seen INTEGER);
```

## 5. Corpus build & pack format

`pnpm corpus:build` (incremental, hash-based):
1. Parse + validate every md with zod; apply the audit normalizations (§2).
2. Extract props (ts-morph), dependency graph, `kind`, `styling`, `requires`.
3. Probe previewability (§6) and render thumbnails (Playwright, 640×400, WebP ≤ 15 KB, light + dark where theme-sensitive).
4. Emit artifacts:
   - `registry/<id>.json` — shadcn registry item (`name`, `type` mapped from `kind`, `dependencies`, `registryDependencies`, `files[{path,content,type}]`, `css`/`cssVars` for keyframes/tokens, plus `meta` with license/attribution).
   - `registry/index.json` and `registry.json`.
   - `catalog.json` — slim metadata (no code); gzip ≈ < 1.5 MB for 8k.
   - `packs/<category>.json.gz` — code blobs grouped by category for first-run import.
   - D1 seed SQL + R2 upload manifest; only changed hashes are uploaded.
5. Publish with `wrangler`; bump `catalog.version` (clients diff by version).

**First-run in the app:** fetch `catalog.json` (metadata) → instant gallery; code packs download lazily by category in the background with a progress chip (“Stocking crates 3,214 / 8,072”) styled like the quota indicator. Offline after that.

## 6. Live preview runtime

### 6.1 Principles
- Sandboxed `<iframe sandbox="allow-scripts" srcdoc=…>` (null origin), CSP restricting network to the module CDN.
- **One runtime**: `packages/shared/preview-runtime` — used by gallery cards, detail page, editor, thumbnail generator, tests.
- Module graph built per component: server/pack provides the **dependency closure** (component + `dependsOn` + `shared`); the runtime transpiles each file with `sucrase` (TS/JSX → JS), creates Blob URLs, and writes an **import map** that maps (a) internal aliases (`@/components/ui/x`, `utils/cn`) to the blob URLs and (b) npm packages to **pinned** `https://esm.sh/<pkg>@<ver>?external=react,react-dom` URLs. React/ReactDOM are single-instance via the map.
- Styling: Tailwind via the official browser build inside the iframe (v4) with the MDstash-agnostic **neutral shadcn token sheet** (`--background`, `--primary`, … from the corpus guide §2.1) plus light/dark class; Tailwind v3-only syntax is detected at probe time and flagged.
- Demo source order: `usage` example → `auto-props` (render default export with props synthesized from the TS types: strings “Label”, booleans false, arrays of 3 sample items, children “Content”) → stored `demo` → none.
- Error boundary + timeout (5 s) inside the iframe; failures post a message to the parent and mark the card “can’t render” with a reason, never a blank box.

### 6.2 Preview status
`ready` (rendered in probe) · `needs-demo` (compiles, no sensible demo) · `primitive` (non-visual or sub-part) · `unsupported` (needs framework/provider we can’t stub, e.g. MUI ThemeProvider variants, SSR-only). A **Preview Coverage** tile in Settings shows real percentages. Owner can attach a demo to any `needs-demo` item in the editor (§9).

### 6.3 Gallery performance rule
Never mount 8k iframes. Grid cards show the **WebP thumbnail**; the live iframe mounts only on (a) hover for ≥ 300 ms or (b) the detail page, with a global cap of **4 live iframes** (LRU unmount). Offline: previews degrade to thumbnails + code (npm modules aren’t available offline) and the UI says so.

## 7. UI/UX spec (same theme, new surfaces)

### 7.1 Routes

```
/app                     Gallery (default)
/app/c/:id               ComponentDetail
/app/kits                Kits list      /app/kits/:id  Kit view (was CollectionView)
/app/docs                Docs & Rules (existing files UI)   /app/f/:id  FileDetail (unchanged)
/app/add                 Add component (paste / drop / URL / editor)
/app/inbox               Wishlist & agent requests
/app/connect             Agent Access
/app/settings            Quota, backup, sync, preview coverage, token admin shortcuts
```

### 7.2 Shell changes
- **Sidebar** (sage-deep): sections — *Gallery* (All, Favorites 📌, Recently added, Mine), *Categories* (collapsible, counts), *Kits* (sortable, drop targets — drag a card onto a kit to add), *Docs & Rules*, *Inbox* (badge), *Connect*. Filter blocks: Source, Styling, Framework, Preview status, License. Quota + sync badge stay.
- **Topbar**: global search with filter chips (`cat:`, `tag:`, `src:`, `kind:`), result count, grid size slider, density (grid/list), “Add” split button (Paste / Drop / URL / Editor). **Cmd/Ctrl+K command palette** (`cmdk`): jump to component, run copy actions, switch category.
- **Kit tray** (existing bundle tray, evolved) appears at ≥ 2 selections: reorder, “Copy prompt bundle”, “Copy install command”, “Download zip”, “Save as kit”, “Open in…”.

### 7.3 Gallery card (“crate card”)
Oat card with the existing pushpin. Top: 16:10 **preview window** on a recessed `--forest-dark` well with rounded inner corners (thumbnail; live on hover). Below on the label strip (`--oat-light`): name (Nunito bold), category + source chips, styling badge, preview-status dot. Footer (`--forest`): quick actions on hover — **Copy code**, **Copy prompt**, **Pin**, **Select**. Keyboard: arrows move focus, `Enter` opens, `C` copy code, `P` copy prompt, `Space` select. Virtualized (`@tanstack/react-virtual`), skeletons in oat tone.

### 7.4 ComponentDetail
Layout: left 2/3 main, right 1/3 sticky info rail.

**Main — tabs as label strips:**
1. **Preview** — large well; toolbar: light/dark, viewport (mobile 390 / tablet 768 / desktop / fluid) with drag-resize handle, zoom, reload, “open in new tab”, background grid toggle, theme token picker (neutral / MDstash craft palette / custom), **props playground** (controls generated from `props[]`: text, boolean, select, number — live re-render; shown when `mode` supports it).
2. **Code** — shiki, filename header, `TS | JS` toggle (JS via sucrase type-strip), `use client` toggle, import-alias field (default `@/lib/utils`), `Tailwind v3/v4 notes`, line copy, wrap, **dependency closure view** (“this needs: cn, button, …” each expandable and individually copyable), single-file-bundle toggle (inline helpers).
3. **Props** — table with types, defaults, descriptions.
4. **Prompt** — prompt builder (see §8.2) with live preview, token count, target model preset.
5. **Markdown** — raw md + rendered md; copy.
6. **Install** — package-manager tabs (pnpm/npm/yarn/bun): `shadcn add` from own registry, plus manual `npm i` of deps, plus “files to create” list.
7. **Variants** — diffs from other sources (from corpus dedup) with side-by-side view and “promote to canonical”.
8. **History** — (user-edited) version list + rollback (reuses VersionHistoryModal).

**Right rail:** copy-action stack (primary = Copy code; secondary = Copy prompt, Copy md, Copy install, Copy agent link), pin/favorite, add to kit, “Open in…” menu, tags (editable), category, source(s) + license + attribution link, deps chips, related components (same category/tags/co-used in kits), owner notes, “Used by agents N times” (from usage log).

### 7.5 Add / Edit (`/app/add`, editor in detail page)
See §9. Same oat/forest styling; editor is a split pane: Monaco-free **CodeMirror 6** (lightweight) on the left, live preview well on the right, metadata form (name, category, tags, deps auto-detected) beneath.

### 7.6 Inbox
Cards for agent requests (“no result for: ‘command palette with fuzzy search’ — requested 4×”). Actions: *Add component* (opens Add with the query prefilled), *Mark won’t-do*, *Link to existing component* (adds an alias/tag so future searches hit).

### 7.7 Agent Access (`/app/connect`)
Detailed in `02-API-AND-MCP-SPEC.md` §8. Layout: connection card (MCP URL with copy + QR-less “test connection”), prompt-link card, shadcn registry card, snippet tabs (CLAUDE.md / AGENTS.md / .cursorrules / system prompt / chat one-liner), token table, live usage feed, top-pulled and never-pulled components.

### 7.8 Motion & polish (kept tasteful)
Use existing GSAP only on Landing. In-app motion via CSS transitions: card lift (translateY −2 px + shadow), tab underline slide, toast. Respect `prefers-reduced-motion`. Skeletons, empty states (“This crate is empty” with illustrations in the existing style).

### 7.9 Landing & Privacy updates
Landing: new hero line, e.g. *“Your components, stashed, sorted, and ready for any agent.”*; playground becomes a mini component demo (copy code / copy prompt toggle). Privacy page: be explicit — browsing and notes stay local by default; **publishing to the API is opt-in** and what it sends; agent tokens and usage log live on your edge account only.

## 8. Copy / export engine (`packages/shared/copy`)

### 8.1 Formats (all produce text via pure functions → golden-file tests)

| Action | Output |
|---|---|
| Copy code | Component source, alias-rewritten, TS or JS per toggle |
| Copy with deps | Single-file bundle (inlines `cn` etc.) or multi-file fenced list with filenames |
| Copy Markdown | The component md (frontmatter + usage + props + code), or “doc style” without frontmatter |
| Copy AI prompt | Prompt builder output (below) |
| Copy install | `npx shadcn@latest add https://<host>/r/<id>.json` (pm variants) + dep install line |
| Copy agent link | `https://<host>/c/<id>.md` (token-lean markdown) |
| Copy MCP call | `get_component({ id: "<id>", include: ["code","props"] })` |
| Copy as kit prompt | for selected items: ordered bundle with TOC (extends current bundle format) |
| Download | `.tsx`, `.md`, or `.zip` (files + shared + `package.json` deps + README with attribution) |
| Drag-out | existing `text/plain` + `DownloadURL`; payload = prompt-ready by default (setting) |
| Open in… | v0, Cursor, ChatGPT, Claude, StackBlitz — see §8.3 |

### 8.2 AI prompt builder
Modes (tabs) — each is a template with variables, editable and savable as an owner template (stored in Docs & Rules):

1. **Implement** — “Add this component to my project.”
2. **Adapt** — restyle to my design tokens (pulls the owner’s `design-tokens` doc) / convert to another UI lib.
3. **Compose** — use with the other selected components to build `<brief>`.
4. **Convert** — to Vue/Svelte/plain CSS (framework param).
5. **Review** — a11y + perf review of this code.
6. **Test** — write Vitest + Testing Library tests.

Options: include props table · include usage · include dependency closure · target model preset (Claude / GPT / Cursor / v0 → adjusts tag style: XML-tag vs markdown-fence) · token estimate · attribution block on/off · project facts (framework version, alias, package manager) saved once in Settings.

Base template (Implement):

```
<task>
Add the "{{name}}" component to my {{framework}} project and wire it up where I describe.
</task>
<project>
Framework: {{projectFramework}} · Styling: Tailwind {{tailwindVersion}} · Alias: {{alias}} · Package manager: {{pm}}
</project>
<install>
{{installCommand}}
</install>
<files>
{{#each files}}### {{path}}
{{fence}}{{lang}}
{{code}}
{{fence}}
{{/each}}
</files>
<notes>
- Keep the public props unchanged. - Do not add new dependencies beyond those listed. - Preserve the license header below.
</notes>
<license>{{attribution}}</license>
```

Fence length uses the existing dynamic-backtick calculator. Prompts never include owner private `notes`.

### 8.3 “Open in…” deep links
Provide for v0, Cursor, ChatGPT, Claude, StackBlitz. URL schemes change often → implement each as a small adapter with a **verified-on date** and a fallback: if the prompt exceeds the URL limit or the scheme fails, copy the prompt and open the tool’s homepage with a toast (“Prompt copied — paste it”). For long payloads, adapters send a **link prompt** (“Use the component at https://<host>/c/<id>.md”) instead of inlining code. Adapters live in `packages/shared/openin` with a test that checks URL length rules.

## 9. Adding & managing components

| Path | Behavior |
|---|---|
| **Paste** (Ctrl+V anywhere, as today) | Detects TSX/JSX → opens Add with code prefilled |
| **Drop** | `.tsx/.jsx/.ts`, `.md` (corpus format), `.zip` (batch), whole folders (existing traversal) |
| **Registry URL** | Paste any shadcn registry item/registry URL → fetch, map to Component, import (single or whole registry with a count preview) |
| **GitHub URL** | File or folder → fetch raw via API/tarball, import with license detection |
| **Editor** | New or edit existing; live preview; metadata form |

**Auto-metadata on add (deterministic, no LLM required):** parse imports → `deps`/`dependsOn`/`shared`; ts-morph props; category/tags from keyword map + name; `kind`; `styling`; license field required (default `UNLICENSED/own` for owner-authored). Optional **AI enrich** button (calls the owner’s model via an MCP-style prompt copy, or a configured API key stored only locally) to write description/tags/usage/demo.

**Dedupe on add:** same pipeline as the harvest (content hash → AST hash → simhash). Dialog: *Looks like “X” (96%)* → **Add as variant** / **Replace canonical** / **Keep both** / **Cancel**, with a diff view.

**Edit rules:** every save snapshots to `compVersions`; harvested components can be edited (becomes `origin: user`, keeps `sources` provenance); “Reset to harvested” available. Publishing happens on save when sync is on (≤ 10 s to agent visibility, §API 9).

**Bulk ops:** multi-select → retag, move category, add to kit, pin, export, delete (harvested items are soft-hidden, not deleted, so re-harvest doesn’t resurrect them).

## 10. Docs & Rules (the old MDstash, repurposed)

Existing note features remain for: `design-tokens.md`, `AGENTS.md` rules, prompt templates, project briefs. Marked docs can be **published to agents** (`get_rules`, `get_design_system` tools), so agents receive the owner’s conventions alongside components.

## 11. Budgets, security, a11y, testing

**Performance budgets (measured in CI + manual report)**
- Gallery first contentful paint (warm cache) < 1.5 s; cold first-run shows metadata gallery < 3 s on broadband.
- Client search (8k, filtered) < 30 ms p95; typing never blocks (debounce 60 ms, worker if needed).
- Grid scroll ≥ 55 fps with thumbnails; ≤ 4 live iframes; thumbnail ≤ 15 KB.
- Detail page: code visible < 200 ms from click (blob in Dexie); live preview < 1.5 s typical.
- App JS initial < 250 KB gz; shiki/sucrase/CodeMirror lazy-loaded.
- API: p95 < 100 ms edge for `search`/`get`; `get_component` default payload < 8 KB typical; `search` result ≤ 2 KB for 10 hits.

**Security**
- Preview iframes: `sandbox="allow-scripts"`, null origin, strict CSP; no access to parent storage; only whitelisted module hosts; pinned versions (no `latest`), prefer versions older than 14 days.
- Agent tokens: random 32-byte, shown once, stored hashed (SHA-256), scope = read-only (+ `request`), optional per-kit scope, IP/rate limits, revocation, `last_used`.
- Owner auth: Firebase ID token verified server-side, allowlist.
- Content served to agents is data: always fenced, with a header line stating it is third-party source code; no executable endpoints.
- No analytics SDKs; usage log is first-party and owner-visible.

**Accessibility:** keyboard-complete gallery and detail, visible focus rings (orange), tab roles, `aria-live` for copy toasts, contrast per existing ink/oat tokens, reduced-motion support, preview iframe titled.

**Testing:** Vitest (migrations, rewriter, prompt templates, ranking, dedupe, props extraction), Playwright e2e (open → preview → copy code → clipboard check; add by paste; add by registry URL; connect flow), MCP conformance (Inspector script), load test (k6/autocannon on search & get), visual regression on 10 key screens.

## 12. Phase detail & acceptance criteria

**Phase 0 — Audit.** Output `AUDIT-REPORT.md` + normalized corpus in `/corpus-v2` (originals untouched). *Accept:* misc < 15%; every item has `kind/styling/preview`; ids unique with alias map; no exact/AST duplicates; attribution present for 100%.

**Phase 1 — Data model & import.** Dexie v2 migration with lossless v1 data (test with fixture DB). Catalog import + lazy packs + progress chip. *Accept:* 8k metadata import < 5 s after download; search < 30 ms; v1 notes intact.

**Phase 2 — Build artifacts.** `corpus:build`, registry JSON, catalog, packs, D1 seed, thumbnails. *Accept:* `npx shadcn add <local-registry-url>/r/<pilot-id>.json` succeeds into a fresh Next app and renders; thumbnail coverage = `ready` count.

**Phase 3 — API & MCP.** Implement `02` fully. *Accept:* Inspector green; curl latency report meets budget; tokens (create/revoke/scope) tested; usage rows appear.

**Phase 4 — Preview + gallery + detail.** Runtime, virtualized grid, live-on-hover, tabs. *Accept:* budgets met; 20 sampled `ready` components render correctly in light/dark; failures show reasons.

**Phase 5 — Copy/export/prompt/kit.** *Accept:* all formats have golden tests; “Copy code” output compiles in a fresh Vite+Tailwind project for 25 sampled components (automated).

**Phase 6 — Add/edit/import/inbox.** *Accept:* each import path works end-to-end; dedupe dialog correct on seeded dupes; agent request → inbox → add → searchable by agents < 10 s.

**Phase 7 — Agent Access.** *Accept:* a real MCP client completes “build a pricing page using my library” using only the tools; a link-only chat completes the same via `/llms.txt`; snippets verified.

**Phase 8 — Scale & polish.** Full 8k import; budgets; a11y audit; e2e; docs; Landing/Privacy updates. *Accept:* Definition of Done in the master prompt.

## 13. Decisions made (change if you disagree) & open questions

**Decisions**
1. Edge API (Cloudflare) is source of truth; browser is a local-first cache/editor. (Needed because agents can’t reach IndexedDB.)
2. One backend: sync moves from Firestore to the API; Firebase stays for Google sign-in only.
3. shadcn registry compatibility is a first-class output (instant CLI/IDE support).
4. Build-time thumbnails + live-on-demand previews instead of live grids.
5. MiniSearch client-side, FTS5 server-side; embeddings are a later, optional upgrade (Vectorize) once the keyword baseline is measured.
6. Previews depend on a pinned module CDN, so they’re online-only; offline shows thumbnails + code.

**Open questions for the owner** (agent should ask once, at plan approval)
1. Public vs private library: should read access need a token by default, or can the library be public-readable (simplest for chats)? Default in plan: **private, token required; per-kit public links optional**.
2. Is the library only for you, or might others use it later? (Affects multi-tenant tables; plan assumes single owner.)
3. Domain name for the API (needed for stable MCP/registry URLs).
4. Do you want non-React frameworks (Vue/Svelte) in the gallery now, or React-only first? Plan default: **React-only first**, other frameworks tagged and hidden behind a filter.
