import { db } from './schema';
import { collectionsRepo } from './collections.repo';
import { filesRepo } from './files.repo';

export async function seedInitialDataIfNeeded(): Promise<void> {
  const fileCount = await db.files.count();
  if (fileCount > 0) return;

  const colCount = await db.collections.count();
  if (colCount > 0) return;

  // 1. Create collections
  const aiCollection = await collectionsRepo.create({
    name: 'AI Context',
    color: '#E28B38',
    icon: 'folder',
    order: 0,
  });

  const rulesCollection = await collectionsRepo.create({
    name: 'Rules & Configs',
    color: '#D4A234',
    icon: 'folder',
    order: 1,
  });

  const startersCollection = await collectionsRepo.create({
    name: 'Starters & Templates',
    color: '#6B8B9B',
    icon: 'folder',
    order: 2,
  });

  // 2. Create sample files
  await filesRepo.create({
    title: 'Claude Project Memory & Rules',
    filename: 'CLAUDE.md',
    content: `# Claude Project Context & Rules

## Project Overview
This file serves as persistent contextual memory for Claude Code and related AI agents.

## Behavioral Guidelines
- Write clean, maintainable TypeScript.
- Always check for edge cases before returning code.
- Prefer local-first architectural patterns.
- Do not add telemetry or external analytics without explicit user confirmation.
`,
    collectionId: aiCollection.id,
    tags: ['claude', 'prompt', 'rules'],
    pinned: true,
    size: 420,
  });

  await filesRepo.create({
    title: 'Cursor Rules Cheatsheet',
    filename: '.cursorrules',
    content: `# Cursor AI System Instructions

You are an expert full-stack developer working on high-performance web applications.

- Style: Follow Tailwind CSS tokens and strict TypeScript types.
- Architecture: Keep UI components modular, accessible, and responsive.
- Performance: Lazy load assets when suitable.
`,
    collectionId: rulesCollection.id,
    tags: ['cursor', 'ai', 'editor'],
    pinned: false,
    size: 310,
  });

  await filesRepo.create({
    title: 'Standard Project README Starter',
    filename: 'README-starter.md',
    content: `# Project Name

> A concise one-liner describing the core value proposition.

## Features
- **Local-first**: Stored on your device.
- **Fast**: Minimal footprint and snappy reactivity.
- **Craft Design**: Thoughtful aesthetic and smooth interactions.

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`
`,
    collectionId: startersCollection.id,
    tags: ['template', 'readme'],
    pinned: false,
    size: 360,
  });
}
