import React, { useState } from 'react';
import { Copy, Check, FileText, Sparkles, Send, GripVertical, Trash2 } from 'lucide-react';

interface SampleFile {
  id: string;
  name: string;
  desc: string;
  content: string;
}

const SAMPLE_FILES: SampleFile[] = [
  {
    id: 'claude',
    name: 'CLAUDE.md',
    desc: 'Project directives & tone',
    content: `# Claude Guidelines
- Keep responses concise and focused.
- Preserve all existing comments and tests.
- Verify changes with test suite before committing.`,
  },
  {
    id: 'agents',
    name: 'AGENTS.md',
    desc: 'Multi-agent orchestration',
    content: `# Agent Protocol
- Role: Senior Architecture Pair Programmer.
- Local First: Never transmit raw tokens to third parties.
- Conventions: Conventional Commits with scope.`,
  },
  {
    id: 'cursorrules',
    name: '.cursorrules',
    desc: 'IDE context rules',
    content: `# Cursor Rules
- Prefer TypeScript strict mode.
- Tailwind tokens only: --sage, --cream, --orange, --forest.
- Self-host all fonts and assets.`,
  },
];

type CopyMode = 'raw' | 'code' | 'prompt';

export const InteractivePlayground: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SampleFile>(SAMPLE_FILES[0]);
  const [mode, setMode] = useState<CopyMode>('prompt');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: 'user' | 'assistant'; text: string; fileName?: string }>
  >([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! Drag a file chip or copy prompt text into this chat window to simulate feeding context to an AI assistant.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const formatContent = (file: SampleFile, copyMode: CopyMode): string => {
    switch (copyMode) {
      case 'raw':
        return file.content;
      case 'code':
        return `\`\`\`markdown\n<!-- ${file.name} -->\n${file.content}\n\`\`\``;
      case 'prompt':
        return `---
File: ${file.name}
Description: ${file.desc}
---

${file.content}`;
    }
  };

  const formattedText = formatContent(selectedFile, mode);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(formattedText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', formattedText);
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const data = e.dataTransfer.getData('text/plain') || formattedText;
    setChatMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'user',
        text: data,
        fileName: selectedFile.name,
      },
      {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `Got context from ${selectedFile.name}! Ready to execute using these guidelines.`,
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: 'user', text: chatInput },
      {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `Understood: "${chatInput}". Prompt context is active.`,
      },
    ]);
    setChatInput('');
  };

  return (
    <section id="playground" className="py-24 bg-cream border-t border-line-ink/40 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-dim border border-line-ink text-[11px] font-mono text-ink font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange" />
            Live Product Demo
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
            Try it right here.
          </h2>
          <p className="text-sm text-ink/75 mt-2 font-sans">
            Pick a markdown file, toggle copy formatting, and drag the file chip straight into the mock chat box.
          </p>
        </div>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: File Selector & Formatter Preview (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-cream-dim/60 border-2 border-line-ink p-6 shadow-sm space-y-6">
            {/* Step 1: Pick File */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-ink tracking-wider">
                  1. Choose Sample File
                </span>
                <span className="text-[10px] font-mono text-ink/60">3 preset files</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_FILES.map((file) => {
                  const isSelected = selectedFile.id === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cream border-orange shadow-sm ring-1 ring-orange'
                          : 'bg-cream-dim/70 border-line-ink/60 hover:border-ink hover:bg-cream'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-orange' : 'text-ink/60'}`} />
                        <span className="font-mono text-xs font-bold text-ink truncate">
                          {file.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink/70 font-sans truncate">{file.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Toggle Copy Mode & Working Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-ink tracking-wider">
                  2. Output Format
                </span>
                <div className="flex rounded-lg bg-cream border border-line-ink/60 p-0.5">
                  {(['raw', 'code', 'prompt'] as CopyMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-md capitalize transition-colors ${
                        mode === m
                          ? 'bg-ink text-cream shadow-sm'
                          : 'text-ink/70 hover:text-ink'
                      }`}
                    >
                      {m === 'code' ? 'Code block' : m === 'prompt' ? 'Prompt-ready' : 'Raw'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Preview Box */}
              <div className="relative rounded-xl bg-forest text-cream p-4 font-mono text-xs leading-relaxed border border-cream/20 shadow-inner overflow-x-auto min-h-[170px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-cream/10 text-[10px] text-cream-dim">
                  <span>
                    Format: <strong className="text-orange">{mode}</strong>
                  </span>
                  <span>{selectedFile.name}</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[11px] text-cream/90 selection:bg-orange selection:text-forest">
                  {formattedText}
                </pre>
              </div>
            </div>

            {/* Step 3: Interactive Draggable Chip & Copy Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {/* HTML5 Draggable File Chip */}
              <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="w-full sm:w-auto flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-orange text-forest font-mono text-xs font-bold border-2 border-forest shadow-sm cursor-grab active:cursor-grabbing hover:bg-orange-deep transition-all select-none"
                title="Drag this chip into the mock chat box on the right"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-forest/70" />
                  <span>Drag {selectedFile.name} chip</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-forest/10 rounded">
                  Drag me →
                </span>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-ink text-cream hover:bg-ink/90 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange"
              >
                {copied ? <Check className="w-4 h-4 text-orange" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to clipboard!' : 'Copy to clipboard'}
              </button>
            </div>
          </div>

          {/* Right Column: Fake Chat Box Receiver (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-cream-dim/60 border-2 border-line-ink p-6 shadow-sm flex flex-col h-full min-h-[460px]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-line-ink/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                <span className="font-display text-lg text-ink">Mock AI Chat Box</span>
              </div>
              <button
                onClick={() =>
                  setChatMessages([
                    {
                      id: 'welcome',
                      sender: 'assistant',
                      text: 'Hello! Drag a file chip or copy prompt text into this chat window to simulate feeding context to an AI assistant.',
                    },
                  ])
                }
                className="text-ink/60 hover:text-ink text-[10px] font-mono flex items-center gap-1"
                title="Reset messages"
              >
                <Trash2 className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Drop Zone & Chat History */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={handleDrop}
              className={`flex-1 overflow-y-auto space-y-3 p-3 rounded-xl transition-all border-2 ${
                isDragging
                  ? 'border-dashed border-orange bg-orange/10 scale-[1.01]'
                  : 'border-line-ink/40 bg-cream'
              }`}
              style={{ maxHeight: '300px' }}
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-xl text-xs font-sans leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-forest text-cream font-mono text-[10px]'
                        : 'bg-cream-dim border border-line-ink text-ink'
                    }`}
                  >
                    {msg.fileName && (
                      <div className="text-[9px] font-mono text-orange mb-1 font-bold">
                        📄 Dropped: {msg.fileName}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="mt-4 pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Drop file here or type message..."
                  className="flex-1 px-3 py-2 text-xs font-mono bg-cream border border-line-ink rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-orange placeholder:text-ink/40"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="p-2 rounded-xl bg-orange hover:bg-orange-deep text-forest transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-[10px] font-mono text-ink/60 text-center mt-2">
                Drop zone accepts native HTML5 file drags
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
