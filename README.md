# MDstash

A craft-inspired, local-first organizer for markdown files and AI context prompts. Keep your `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, and scratch notes organized, searchable, and ready to drop into any workflow.

Runs entirely in your browser with offline storage. Nothing ever leaves your device.

---

## Features

- **Local-first storage:** Pure IndexedDB persistence with offline PWA support. Zero external network requests, zero telemetry, and zero accounts.
- **Drag-and-drop import:** Drop markdown files, text files, or full folders directly into the library with recursive directory traversal.
- **Collections and tags:** Organize files into color-coded collections or filter on the fly with free-form tags.
- **Instant search:** Fast client-side fuzzy search across file titles, tags, and full body content.
- **Prompt-ready context copying:** Copy notes formatted as prompt headers (`### File: <name>`), fenced code blocks, or raw text.
- **Context bundling:** Select multiple files to reorder and bundle them into a single coherent prompt payload.
- **Live markdown preview:** Clean, sanitized markdown rendering with an instant raw source toggle and editing.
- **Version history:** Non-destructive save snapshots with instant rollback.
- **Portable export and import:** Backup or restore your entire stash as a zip archive preserving folder structure and metadata.

---

## Copy modes

When feeding context into AI coding assistants or LLM interfaces, MDstash provides three one-click copy modes:

1. **Prompt-ready:** Prefixes each file with `### File: <filename>` headers for structured prompt context.
2. **Fenced code block:** Wraps markdown safely inside dynamically-sized backtick fences to prevent breaking nested code blocks.
3. **Raw:** Copies the exact document text without any surrounding formatting.

---

## Drag-out compatibility

File cards and detail views provide a native drag handle that attaches both `text/plain` and Chromium `DownloadURL`:

- **AI chat inputs and text editors:** Dragging into Claude, ChatGPT, Cursor chat, or any text editor pastes the markdown content immediately.
- **Desktop and file manager:** Dragging to desktop or file folders saves a `.md` file directly in Chromium-based browsers.
- **IDE file trees:** Browser security boundaries prevent dragging into native IDE tree views. Use the one-click copy or download buttons as universal fallbacks.

---

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run test suite
npm test

# Type checking and linting
npx tsc --noEmit
npm run lint

# Production build
npm run build
```

---

## License

MIT
