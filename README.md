# MDstash

> **Your markdown files, stashed, sorted, and ready to drop anywhere.**  
> *Nothing ever leaves your device.*

MDstash is a craft-inspired, local-first organizer for Markdown files and AI prompts. Designed for developers and AI-tool power users who frequently reference `CLAUDE.md`, `AGENTS.md`, `README`s, `.cursorrules`, and context prompts.

---

## ✨ Features

- 📁 **Instant Drag-and-Drop Import:** Drop files (`.md`, `.markdown`, `.txt`) or entire directories straight into your browser with recursive directory traversal.
- 🗂️ **Collections & Reordering:** Color-coded collections with custom icons; reorder with move controls; delete collections without losing files (preserved in Unsorted).
- 🏷️ **Tags & Dynamic Filtering:** Free-form tags per file with real-time tag chips filtering.
- 📄 **Deep-Linkable File Detail Route (`/app/f/:fileId`):** Sanitized preview (`react-markdown` + `rehype-sanitize`) and raw toggle, light in-browser edit, download, and delete.
- 📋 **Three Copy Modes:**
  - **Prompt-ready:** Prefixes `### File: <filename>` for AI models.
  - **Fenced Code Block:** Dynamic fence length calculation preventing broken backticks.
  - **Raw:** Exact markdown content as-is.
- 📦 **Bundle Multi-Select & Reordering:** Select 2+ files to activate the floating Bundle Tray; reorder files with up/down arrows and copy as a single combined context block with per-file headers.
- 🔍 **Instant Fuzzy Search:** Local client-side MiniSearch indexing over title, filename, tags, and full body content with boosted title weighting.
- 📌 **Pinned Favorites:** Fast one-click pin/unpin keeping critical rules at the top of your library.
- ⚡ **Quick-Add via Paste (`Ctrl+V`):** Paste markdown text anywhere outside an active text input to trigger an instant stashing dialog.
- 📜 **Version History Snapshots:** Non-destructive snapshots captured on each save, capped per file, with instant restore.
- 💾 **Full Zip Export & Import Round-Trip:** Export your entire stash as a `.zip` archive containing real `.md` files organized by collection folders + a portable `manifest.json`.
- 🔒 **Zero Cloud & Absolute Privacy:** Pure IndexedDB storage with persistent storage request support (`navigator.storage.persist`). Zero analytics, zero cookies, zero external network requests.
- 📱 **Responsive & Accessible:** Off-canvas mobile navigation drawer, visible orange focus rings, Escape key modal dismissal, and Lenis smooth scrolling on the landing page (with `prefers-reduced-motion` detection).
- 📦 **Offline PWA:** Installable desktop web app powered by Service Worker precaching.

---

## 🎯 Drag-Out Compatibility Note

The drag handle on file cards and file detail views sets both `text/plain` and Chromium `DownloadURL`:
- **Editor Text Panes & AI Chat Inputs:** Fully supported across Chrome, Edge, Brave, Firefox, and Safari via `text/plain`.
- **Desktop / File Explorer (Chromium):** Creates a real `.md` file on desktop, Windows File Explorer, or macOS Finder via `DownloadURL`.
- **IDE File Explorers (e.g. VS Code / Cursor Explorer tree):** Browser security sandboxes prevent web drag events from injecting filesystem entries into native IDE file trees. **Copy** and **Download** buttons are always provided as universal fallbacks.

---

## 🎨 Design System

Inspired by the Brew District craft aesthetic:
- **Palette:** Sunny Sage `#8A9A78`, Warm Cream `#F6F1DC`, Craft Orange `#F2A33A`, Deep Forest `#2F3A33`, and Ink `#26332A`.
- **Typography:** Self-hosted Passion One display headline (with sentence-case craft glyphs), friendly rounded Nunito UI sans, and crisp JetBrains Mono for code.
- **Craft Signature:** Seamless rotating circular badge, warm sun-glow radial hero gradient, analog grain overlay, fluid Lenis + ScrollTrigger cream curtain transition, and pinned scroll-story.

---

## 🧪 Testing & Verification

```bash
# Run Vitest test suite (51 unit and integration tests across 16 test suites)
npm test

# Run ESLint (zero warnings or errors)
npm run lint

# Type check
npx tsc --noEmit

# Build production bundle and PWA service worker
npm run build
```

---

## 📜 License

MIT License. Crafted with care.
