import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, FileText, Send, GripVertical, RotateCcw, Play, Pause } from 'lucide-react';
import gsap from 'gsap';
import { Pill } from '../ui/Pill';
import { formatFileForCopy } from '../../domain/copyFormats';
import { CopyMode } from '../../domain/types';

// Module-level flag to mark demo-generated interactions so takeover listeners ignore them
// and copy handler skips navigator.clipboard.writeText.
let isDemoDispatching = false;

export function dispatchDemoClick(el: HTMLElement | null) {
  if (!el) return;
  isDemoDispatching = true;
  const activeBefore = document.activeElement;
  try {
    const pEvt = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    pEvt.preventDefault();
    el.dispatchEvent(pEvt);
    const mEvt = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    mEvt.preventDefault();
    el.dispatchEvent(mEvt);

    el.click();

    // Defensively ensure focus did not move to the element clicked by the demo
    if (document.activeElement && (document.activeElement === el || el.contains(document.activeElement))) {
      (document.activeElement as HTMLElement).blur();
      if (activeBefore && activeBefore !== el && !el.contains(activeBefore) && activeBefore instanceof HTMLElement && activeBefore !== document.body) {
        activeBefore.focus({ preventScroll: true });
      }
    }
  } finally {
    isDemoDispatching = false;
  }
}

export interface SampleFile {
  id: string;
  name: string;
  desc: string;
  content: string;
}

export const SAMPLE_FILES: SampleFile[] = [
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

export function truncatePromptLines(text: string, maxLines = 3): string {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return text;
  return lines.slice(0, maxLines).join('\n') + '\n…';
}

export type DemoAct = 1 | 2 | 3;

export interface TakeoverLogEntry {
  type: string;
  target: string;
  time: number;
}

export interface TraceEntry {
  t: number;
  act: number;
  step: string;
  event: 'start' | 'end';
  selectedFile: string;
  chatState: 'greeting' | 'sent' | 'empty';
  inputChip: null | string;
  copyState: 'idle' | 'copied';
  resetClicks: number;
  ringElements: string[];
}

export interface DemoErrorEntry {
  step: string;
  message: string;
  state?: Record<string, unknown>;
}

declare global {
  interface Window {
    __demo?: {
      act: DemoAct;
      step: string;
      phase: string;
      userPaused: boolean;
      interactionPaused: boolean;
      loopCount: number;
      takeoverReason: string | null;
      cursorRect: { left: number; top: number; width: number; height: number } | null;
      takeoverLog: TakeoverLogEntry[];
      errors: DemoErrorEntry[];
      trace: TraceEntry[];
    };
  }
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'assistant' as const,
  text: 'Drop a file chip here to feed it to the assistant.',
};

export const InteractivePlayground: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SampleFile>(SAMPLE_FILES[0]);
  const [mode, setMode] = useState<CopyMode>('prompt');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: 'user' | 'assistant'; text: string; fileName?: string }>
  >([WELCOME_MESSAGE]);
  const [chatInput, setChatInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<SampleFile | null>(null);
  const [pastedContent, setPastedContent] = useState<string | null>(null);
  const [isResettingChat, setIsResettingChat] = useState(false);
  const [resetClickCount, setResetClickCount] = useState(0);
  const [isDemoInputFocus, setIsDemoInputFocus] = useState(false);

  // Demo playback states
  const [userPaused, setUserPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [demoAct, setDemoAct] = useState<DemoAct>(1);
  const [demoStep, setDemoStep] = useState<string>('idle');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Synchronous State & DOM Refs
  const containerRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ghostChipRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const chipHintRef = useRef<HTMLSpanElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);
  const chatInputContainerRef = useRef<HTMLDivElement>(null);
  const chatInputElRef = useRef<HTMLInputElement>(null);
  const dropRingRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const resetBtnRef = useRef<HTMLButtonElement>(null);
  const fileCardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Runner Control Refs
  const loopCountRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(false);
  const takeoverReasonRef = useRef<string | null>(null);
  const takeoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const takeoverLogRef = useRef<TakeoverLogEntry[]>([]);
  const errorsRef = useRef<DemoErrorEntry[]>([]);
  const traceRef = useRef<TraceEntry[]>([]);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State Mirror Refs for immediate reading inside async runner
  const selectedFileRef = useRef<SampleFile>(SAMPLE_FILES[0]);
  selectedFileRef.current = selectedFile;
  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;
  const attachedFileRef = useRef(attachedFile);
  attachedFileRef.current = attachedFile;
  const pastedContentRef = useRef(pastedContent);
  pastedContentRef.current = pastedContent;
  const copiedRef = useRef(copied);
  copiedRef.current = copied;
  const resetClickCountRef = useRef(resetClickCount);
  resetClickCountRef.current = resetClickCount;
  const userPausedRef = useRef(userPaused);
  userPausedRef.current = userPaused;
  const interactionPausedRef = useRef(interactionPaused);
  interactionPausedRef.current = interactionPaused;
  const demoActRef = useRef<DemoAct>(1);
  demoActRef.current = demoAct;
  const demoStepRef = useRef<string>('idle');
  demoStepRef.current = demoStep;
  const chatInputRef = useRef(chatInput);
  chatInputRef.current = chatInput;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Active Runner and Tween Handles
  const runAbortControllerRef = useRef<AbortController | null>(null);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);
  const pauseGateRef = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  const runnerRestartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const assistantReplyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetChatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formattedText = formatFileForCopy(
    selectedFile.name,
    selectedFile.content,
    mode
  );

  // Helper: Publish State to window.__demo
  const updateDebugHook = useCallback(() => {
    if (typeof window === 'undefined') return;
    const cursorEl = cursorRef.current;
    let cursorRect = null;
    if (cursorEl) {
      const r = cursorEl.getBoundingClientRect();
      cursorRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
    window.__demo = {
      act: demoActRef.current,
      step: demoStepRef.current,
      phase: demoStepRef.current,
      userPaused: userPausedRef.current,
      interactionPaused: interactionPausedRef.current,
      loopCount: loopCountRef.current,
      takeoverReason: takeoverReasonRef.current,
      cursorRect,
      takeoverLog: [...takeoverLogRef.current],
      errors: [...errorsRef.current],
      trace: [...traceRef.current],
    };
  }, []);

  // Reduced motion detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // UI Handlers: Copy, Drag, Send, Reset
  const handleCopy = () => {
    const textToCopy = formatFileForCopy(
      selectedFileRef.current.name,
      selectedFileRef.current.content,
      modeRef.current
    );
    if (!isDemoDispatching) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).catch(() => {});
        }
      } catch {
        // fallback
      }
    }
    setCopied(true);
    copiedRef.current = true;
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
      copiedRef.current = false;
      copyTimerRef.current = null;
    }, 1200);
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
    const userMsg = {
      id: String(Date.now()),
      sender: 'user' as const,
      text: data,
      fileName: selectedFileRef.current.name,
    };
    const assistantMsg = {
      id: String(Date.now() + 1),
      sender: 'assistant' as const,
      text: `Got context from ${selectedFileRef.current.name}! Ready to execute using these guidelines.`,
    };
    const nextMsgs = [userMsg, assistantMsg];
    setChatMessages(nextMsgs);
    chatMessagesRef.current = nextMsgs;
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const curAttached = attachedFileRef.current;
    const curPasted = pastedContentRef.current;
    const curInput = chatInputRef.current;
    if (!curInput.trim() && !curAttached && !curPasted) return;

    let userText = curInput;
    let fileName: string | undefined = undefined;

    const isNarrow = typeof window !== 'undefined' && window.innerWidth <= 400;
    const promptLines = isNarrow ? 2 : 3;

    if (curAttached) {
      userText = truncatePromptLines(formatFileForCopy(curAttached.name, curAttached.content, 'prompt'), promptLines);
      fileName = curAttached.name;
    } else if (curPasted) {
      userText = truncatePromptLines(curPasted, promptLines);
      fileName = selectedFileRef.current.name;
    }

    const targetFileName = fileName || selectedFileRef.current.name;
    const userMsg = { id: String(Date.now()), sender: 'user' as const, text: userText, fileName: targetFileName };

    // 1. Remove greeting bubble immediately and add user message
    setChatMessages([userMsg]);
    chatMessagesRef.current = [userMsg];
    setChatInput('');
    chatInputRef.current = '';
    setAttachedFile(null);
    attachedFileRef.current = null;
    setPastedContent(null);
    pastedContentRef.current = null;
    setIsDemoInputFocus(false);

    // 2. Add assistant reply after ~0.7s
    if (assistantReplyTimerRef.current) clearTimeout(assistantReplyTimerRef.current);
    assistantReplyTimerRef.current = setTimeout(() => {
      const assistantMsg = {
        id: String(Date.now() + 1),
        sender: 'assistant' as const,
        text: targetFileName
          ? `Got context from ${targetFileName}! Ready to execute using these guidelines.`
          : `Understood: "${curInput}". Prompt context is active.`,
      };
      setChatMessages((prev) => {
        const next = [...prev.filter((m) => m.id !== 'welcome'), assistantMsg];
        chatMessagesRef.current = next;
        return next;
      });
      assistantReplyTimerRef.current = null;
    }, 700);
  };

  const handleResetChat = () => {
    setResetClickCount((c) => c + 1);
    resetClickCountRef.current += 1;
    setIsResettingChat(true);
    if (assistantReplyTimerRef.current) {
      clearTimeout(assistantReplyTimerRef.current);
      assistantReplyTimerRef.current = null;
    }
    if (resetChatTimerRef.current) clearTimeout(resetChatTimerRef.current);
    resetChatTimerRef.current = setTimeout(() => {
      setChatMessages([WELCOME_MESSAGE]);
      chatMessagesRef.current = [WELCOME_MESSAGE];
      setChatInput('');
      chatInputRef.current = '';
      setAttachedFile(null);
      attachedFileRef.current = null;
      setPastedContent(null);
      pastedContentRef.current = null;
      setIsDemoInputFocus(false);
      setIsResettingChat(false);
      resetChatTimerRef.current = null;
    }, 400);
  };

  // =========================================================================
  // RUNNER PRIMITIVES: Pause Gate, Preconditions, Tween Helpers
  // =========================================================================

  // Pause Gate Checker: Blocks between steps or during sleeps if paused
  const checkGate = useCallback(async (signal: AbortSignal) => {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    while (pauseGateRef.current) {
      await pauseGateRef.current.promise;
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
    }
  }, []);

  // Sleep Helper: Respects abort and pause gate
  const sleep = useCallback(
    (ms: number, signal: AbortSignal): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        let timer: NodeJS.Timeout;
        const onAbort = () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        };
        signal.addEventListener('abort', onAbort, { once: true });
        timer = setTimeout(() => {
          signal.removeEventListener('abort', onAbort);
          checkGate(signal).then(resolve, reject);
        }, ms);
      });
    },
    [checkGate]
  );

  // Position Calculator: Relative coordinates inside container
  const getRelPos = useCallback((el: HTMLElement | null, offsetXRatio = 0.5, offsetYRatio = 0.5) => {
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    const cRect = containerRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - cRect.left + r.width * offsetXRatio,
      y: r.top - cRect.top + r.height * offsetYRatio,
    };
  }, []);

  // Tween Runner: Animates with GSAP, cancel-safe, pause-safe
  const tween = useCallback(
    (target: gsap.TweenTarget, vars: gsap.TweenVars, signal: AbortSignal): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));

        let tw: gsap.core.Tween;
        const onAbort = () => {
          tw.kill();
          reject(new DOMException('Aborted', 'AbortError'));
        };
        signal.addEventListener('abort', onAbort, { once: true });

        const originalOnComplete = vars.onComplete;
        tw = gsap.to(target, {
          ...vars,
          onComplete: () => {
            signal.removeEventListener('abort', onAbort);
            activeTweenRef.current = null;
            if (originalOnComplete) originalOnComplete();
            checkGate(signal).then(resolve, reject);
          },
        });
        activeTweenRef.current = tw;
      });
    },
    [checkGate]
  );

  // Linear / Eased Move to Target
  const moveTo = useCallback(
    (targetPos: { x: number; y: number }, duration: number, signal: AbortSignal, ease = 'power3.inOut') => {
      if (!cursorRef.current) return Promise.resolve();
      return tween(cursorRef.current, { x: targetPos.x, y: targetPos.y, duration, ease }, signal);
    },
    [tween]
  );

  // Quadratic Curved Move (Arc)
  const curveTo = useCallback(
    (
      targetPos: { x: number; y: number },
      arcYOffset: number,
      duration: number,
      signal: AbortSignal,
      onProgress?: (prog: number, curPos: { x: number; y: number }) => void
    ) => {
      if (!cursorRef.current) return Promise.resolve();
      const cursor = cursorRef.current;
      const startX = gsap.getProperty(cursor, 'x') as number;
      const startY = gsap.getProperty(cursor, 'y') as number;

      const ctrlX = (startX + targetPos.x) / 2;
      const ctrlY = Math.min(startY, targetPos.y) - arcYOffset;

      const obj = { progress: 0 };
      return tween(
        obj,
        {
          progress: 1,
          duration,
          ease: 'power3.inOut',
          onUpdate: () => {
            const p = obj.progress;
            const x = (1 - p) * (1 - p) * startX + 2 * (1 - p) * p * ctrlX + p * p * targetPos.x;
            const y = (1 - p) * (1 - p) * startY + 2 * (1 - p) * p * ctrlY + p * p * targetPos.y;
            gsap.set(cursor, { x, y });
            if (onProgress) onProgress(p, { x, y });
          },
        },
        signal
      );
    },
    [tween]
  );

  // Button Click Press Scale Animation
  const press = useCallback(
    async (el: HTMLElement | null, signal: AbortSignal, scale = 0.92, duration = 0.24) => {
      if (!cursorRef.current) return;
      const half = duration / 2;
      await Promise.all([
        tween(cursorRef.current, { scale: 0.88, duration: half, ease: 'power2.in' }, signal),
        el ? tween(el, { scale, duration: half, ease: 'power2.in' }, signal) : Promise.resolve(),
      ]);
      await Promise.all([
        tween(cursorRef.current, { scale: 1, duration: half, ease: 'power2.out' }, signal),
        el ? tween(el, { scale: 1, duration: half, ease: 'power2.out' }, signal) : Promise.resolve(),
      ]);
    },
    [tween]
  );

  // Detect which playground elements currently display a visible outline or ring
  const inspectRingElements = useCallback((): string[] => {
    if (typeof window === 'undefined' || !containerRef.current) return [];
    const playground = containerRef.current;
    const controls = playground.querySelectorAll<HTMLElement>(
      '[data-card-index], [data-testid="copy-btn"], [data-testid="send-btn"], [data-testid="reset-chat-btn"], [data-testid="drag-chip"], [data-testid="chat-input-container"], input'
    );
    const ringList: string[] = [];
    controls.forEach((el) => {
      const cs = window.getComputedStyle(el);
      const outlineWidth = parseFloat(cs.outlineWidth) || 0;
      const hasOutline = cs.outlineStyle !== 'none' && outlineWidth > 0;
      const hasBoxShadowRing = cs.boxShadow && cs.boxShadow !== 'none' && cs.boxShadow.includes('238, 178, 87');
      if (hasOutline || hasBoxShadowRing) {
        ringList.push(el.getAttribute('data-testid') || el.getAttribute('data-file-id') || el.tagName.toLowerCase());
      }
    });
    return ringList;
  }, []);

  // Step Wrapper: Preconditions, Trace, Timing & Error Boundary
  const runStep = useCallback(
    async (
      act: DemoAct,
      stepName: string,
      precondition: (() => string | null) | null,
      stepFn: (signal: AbortSignal) => Promise<void>,
      signal: AbortSignal
    ) => {
      await checkGate(signal);

      // 1. Guard Rails: Assert Preconditions
      if (precondition) {
        const errorMsg = precondition();
        if (errorMsg) {
          const errEntry: DemoErrorEntry = {
            step: stepName,
            message: errorMsg,
            state: {
              act,
              selectedFile: selectedFileRef.current.name,
              attachedFile: attachedFileRef.current?.name,
              pastedContent: !!pastedContentRef.current,
              chatMessagesCount: chatMessagesRef.current.length,
            },
          };
          errorsRef.current.push(errEntry);
          updateDebugHook();
          throw new Error(`[Precondition Failed in ${stepName}]: ${errorMsg}`);
        }
      }

      // 2. Trace 'start'
      const getChatState = (): 'greeting' | 'sent' | 'empty' => {
        const msgs = chatMessagesRef.current;
        if (msgs.length === 1 && msgs[0].id === 'welcome') return 'greeting';
        if (msgs.some((m) => m.sender === 'user')) return 'sent';
        return 'empty';
      };

      const getInputChip = (): null | string => {
        if (attachedFileRef.current) return `file:${attachedFileRef.current.name}`;
        if (pastedContentRef.current) return `paste:${selectedFileRef.current.name}`;
        return null;
      };

      traceRef.current.push({
        t: performance.now(),
        act,
        step: stepName,
        event: 'start',
        selectedFile: selectedFileRef.current.name,
        chatState: getChatState(),
        inputChip: getInputChip(),
        copyState: copiedRef.current ? 'copied' : 'idle',
        resetClicks: resetClickCountRef.current,
        ringElements: inspectRingElements(),
      });

      // 3. Update Sync State and DOM dataset
      demoActRef.current = act;
      demoStepRef.current = stepName;
      setDemoAct(act);
      setDemoStep(stepName);
      if (containerRef.current) {
        containerRef.current.setAttribute('data-demo-act', String(act));
        containerRef.current.setAttribute('data-demo-phase', stepName);
      }
      updateDebugHook();

      // 4. Run Step Body
      await stepFn(signal);
      await checkGate(signal);

      // 5. Trace 'end'
      traceRef.current.push({
        t: performance.now(),
        act,
        step: stepName,
        event: 'end',
        selectedFile: selectedFileRef.current.name,
        chatState: getChatState(),
        inputChip: getInputChip(),
        copyState: copiedRef.current ? 'copied' : 'idle',
        resetClicks: resetClickCountRef.current,
        ringElements: inspectRingElements(),
      });
      updateDebugHook();
    },
    [checkGate, inspectRingElements, updateDebugHook]
  );

  // Restore Idempotent HOME State
  const restoreHome = useCallback(() => {
    setSelectedFile(SAMPLE_FILES[0]);
    selectedFileRef.current = SAMPLE_FILES[0];
    setMode('prompt');
    setCopied(false);
    copiedRef.current = false;
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    if (assistantReplyTimerRef.current) {
      clearTimeout(assistantReplyTimerRef.current);
      assistantReplyTimerRef.current = null;
    }
    if (resetChatTimerRef.current) {
      clearTimeout(resetChatTimerRef.current);
      resetChatTimerRef.current = null;
    }
    setAttachedFile(null);
    attachedFileRef.current = null;
    setPastedContent(null);
    pastedContentRef.current = null;
    setChatInput('');
    chatInputRef.current = '';
    setIsDemoInputFocus(false);
    setIsResettingChat(false);
    setChatMessages([WELCOME_MESSAGE]);
    chatMessagesRef.current = [WELCOME_MESSAGE];

    if (ghostChipRef.current) {
      gsap.set(ghostChipRef.current, { opacity: 0, scale: 0.95, rotation: 0 });
    }
    if (dropRingRef.current) {
      gsap.set(dropRingRef.current, { opacity: 0 });
    }
    if (chipRef.current) {
      gsap.set(chipRef.current, { y: 0, opacity: 1 });
    }
  }, []);

  // Cancel Active Execution cleanly
  const cancelRunner = useCallback(() => {
    if (assistantReplyTimerRef.current) {
      clearTimeout(assistantReplyTimerRef.current);
      assistantReplyTimerRef.current = null;
    }
    if (resetChatTimerRef.current) {
      clearTimeout(resetChatTimerRef.current);
      resetChatTimerRef.current = null;
    }
    if (runAbortControllerRef.current) {
      runAbortControllerRef.current.abort();
      runAbortControllerRef.current = null;
    }
    if (activeTweenRef.current) {
      activeTweenRef.current.kill();
      activeTweenRef.current = null;
    }
    if (runnerRestartTimerRef.current) {
      clearTimeout(runnerRestartTimerRef.current);
      runnerRestartTimerRef.current = null;
    }
    if (pauseGateRef.current) {
      const gate = pauseGateRef.current;
      pauseGateRef.current = null;
      gate.resolve();
    }
  }, []);

  // =========================================================================
  // THE SCRIPT: 3 Acts in Continuous Await-Based Sequence
  // =========================================================================
  const runMasterScript = useCallback(
    async (signal: AbortSignal) => {
      if (!containerRef.current || !cursorRef.current) return;
      const cursor = cursorRef.current;
      const ghost = ghostChipRef.current;
      const chip = chipRef.current;
      const copyBtn = copyBtnRef.current;
      const sendBtn = sendBtnRef.current;
      const resetBtn = resetBtnRef.current;
      const cardClaude = fileCardRefs.current[0];
      const cardAgents = fileCardRefs.current[1];
      const cardCursorrules = fileCardRefs.current[2];

      // HOME Position: CLAUDE.md card center-right area
      const homePos = getRelPos(cardClaude, 0.65, 0.5);

      // Initial entry: cursor smoothly fades in at HOME
      gsap.set(cursor, { x: homePos.x, y: homePos.y, scale: 1, rotation: 0 });
      await tween(cursor, { opacity: 1, duration: 0.35, ease: 'power2.out' }, signal);

      // =====================================================================
      // ACT 1: CLAUDE.md (via Drag and Drop)
      // =====================================================================
      // 1. Move to Grip of chip
      await runStep(
        1,
        'act1-move-to-chip',
        null,
        async (sig) => {
          const gripPos = getRelPos(chip, 0.08, 0.5);
          await moveTo(gripPos, 0.85, sig);
        },
        signal
      );

      // 2. Grab: compact ghost attaches
      await runStep(
        1,
        'act1-grab',
        () => (selectedFileRef.current.id !== 'claude' ? 'CLAUDE.md must be selected before grab' : null),
        async (sig) => {
          if (ghost) gsap.set(ghost, { opacity: 0, scale: 0.85, rotation: 0 });
          await Promise.all([
            tween(cursor, { scale: 0.9, duration: 0.12, ease: 'power2.in' }, sig),
            chip ? tween(chip, { opacity: 0.5, duration: 0.12 }, sig) : Promise.resolve(),
            ghost ? tween(ghost, { opacity: 1, scale: 1, duration: 0.12 }, sig) : Promise.resolve(),
          ]);
        },
        signal
      );

      // 3. Drag arc to chat input
      await runStep(
        1,
        'act1-drag',
        null,
        async (sig) => {
          const inputPos = getRelPos(chatInputContainerRef.current, 0.35, 0.5);
          await curveTo(inputPos, 50, 1.25, sig, (prog) => {
            if (ghost) {
              const tilt = Math.sin(prog * Math.PI) * 5;
              gsap.set(ghost, { rotation: tilt });
            }
            if (prog > 0.65 && dropRingRef.current) {
              gsap.set(dropRingRef.current, { opacity: 1 });
            }
          });
        },
        signal
      );

      // 4. Release / Drop chip into input
      await runStep(
        1,
        'act1-drop',
        null,
        async (sig) => {
          if (dropRingRef.current) gsap.set(dropRingRef.current, { opacity: 0 });
          if (ghost) gsap.set(ghost, { opacity: 0, scale: 0.9, rotation: 0 });
          if (chip) gsap.set(chip, { opacity: 1 });
          setAttachedFile(SAMPLE_FILES[0]);
          attachedFileRef.current = SAMPLE_FILES[0];
          await tween(cursor, { scale: 1, duration: 0.15, ease: 'back.out' }, sig);
          await sleep(200, sig);
        },
        signal
      );

      // 5. Move to Send
      await runStep(
        1,
        'act1-move-to-send',
        () => (!attachedFileRef.current ? 'Attachment chip must be in input before move to Send' : null),
        async (sig) => {
          const sendPos = getRelPos(sendBtn, 0.5, 0.5);
          await moveTo(sendPos, 0.65, sig);
        },
        signal
      );

      // 6. Click Send: chip removed immediately, user msg added, reply added
      await runStep(
        1,
        'act1-send',
        () => (!attachedFileRef.current ? 'Input must contain attachment chip before clicking Send' : null),
        async (sig) => {
          await press(sendBtn, sig);
          handleSendMessage();
          await sleep(850, sig); // wait for assistant message to mount
        },
        signal
      );

      // 7. Sent message hold (~1.6s) with bubbles fully opaque
      await runStep(
        1,
        'act1-sent',
        () => (chatMessagesRef.current.length < 2 ? 'Chat must have user and reply bubbles during hold' : null),
        async (sig) => {
          await sleep(1600, sig);
        },
        signal
      );

      // 8. Move to Reset button
      await runStep(
        1,
        'act1-move-to-reset',
        null,
        async (sig) => {
          const resetPos = getRelPos(resetBtn, 0.5, 0.5);
          await moveTo(resetPos, 0.75, sig);
        },
        signal
      );

      // 9. Click Reset: chat cleared, greeting returns
      await runStep(
        1,
        'act1-reset',
        () => (chatMessagesRef.current.length < 2 ? 'Chat must contain sent messages before Reset' : null),
        async (sig) => {
          await press(resetBtn, sig);
          handleResetChat();
          await sleep(450, sig); // wait for 400ms slide-out and greeting return
        },
        signal
      );

      // 10. Move to AGENTS.md card & Click
      await runStep(
        1,
        'select-agents',
        () => (chatMessagesRef.current.length !== 1 || chatMessagesRef.current[0].id !== 'welcome' ? 'Chat must be at greeting before selecting AGENTS.md' : null),
        async (sig) => {
          const agentsPos = getRelPos(cardAgents, 0.5, 0.5);
          await moveTo(agentsPos, 0.95, sig);
          await press(cardAgents, sig);
          setSelectedFile(SAMPLE_FILES[1]);
          selectedFileRef.current = SAMPLE_FILES[1];
          await sleep(250, sig);
        },
        signal
      );

      // =====================================================================
      // ACT 2: AGENTS.md (via Copy to Clipboard & Paste)
      // =====================================================================
      // 1. Move to Copy button
      await runStep(
        2,
        'act2-move-to-copy',
        null,
        async (sig) => {
          const copyPos = getRelPos(copyBtn, 0.5, 0.5);
          await moveTo(copyPos, 0.95, sig);
        },
        signal
      );

      // 2. Click Copy button: button shows "Copied!" for 1.2s, ends ONLY when idle
      await runStep(
        2,
        'act2-copy',
        null,
        async (sig) => {
          isDemoDispatching = true;
          try {
            await press(copyBtn, sig);
            handleCopy();
            traceRef.current.push({
              t: performance.now(),
              act: 2,
              step: 'act2-copy',
              event: 'start',
              selectedFile: selectedFileRef.current.name,
              chatState: chatMessagesRef.current.length > 1 ? 'sent' : 'greeting',
              inputChip: null,
              copyState: 'copied',
              resetClicks: resetClickCountRef.current,
              ringElements: inspectRingElements(),
            });
            updateDebugHook();
          } finally {
            isDemoDispatching = false;
          }
          await sleep(1250, sig); // ensure copy state reverts to idle before proceeding
          setCopied(false);
          copiedRef.current = false;
        },
        signal
      );

      // 3. Move to chat input
      await runStep(
        2,
        'act2-move-to-input',
        () => (copiedRef.current ? 'Copy button must be idle before moving to input' : null),
        async (sig) => {
          const inputPos = getRelPos(chatInputContainerRef.current, 0.35, 0.5);
          await moveTo(inputPos, 0.85, sig);
        },
        signal
      );

      // 4. Click input & Visual Demo Focus
      await runStep(
        2,
        'act2-focus-input',
        null,
        async (sig) => {
          await press(null, sig);
          setIsDemoInputFocus(true);
          await sleep(150, sig);
        },
        signal
      );

      // 5. Paste: pasted chip appears, fake focus turns off
      await runStep(
        2,
        'act2-paste',
        null,
        async (sig) => {
          const snippet = formatFileForCopy('AGENTS.md', SAMPLE_FILES[1].content, 'prompt');
          setPastedContent(snippet);
          pastedContentRef.current = snippet;
          setIsDemoInputFocus(false);
          await sleep(300, sig);
        },
        signal
      );

      // 6. Move to Send
      await runStep(
        2,
        'act2-move-to-send',
        () => (!pastedContentRef.current ? 'Input must contain pasted chip before move to Send' : null),
        async (sig) => {
          const sendPos = getRelPos(sendBtn, 0.5, 0.5);
          await moveTo(sendPos, 0.65, sig);
        },
        signal
      );

      // 7. Click Send
      await runStep(
        2,
        'act2-send',
        () => (!pastedContentRef.current ? 'Input must contain pasted chip before clicking Send' : null),
        async (sig) => {
          await press(sendBtn, sig);
          handleSendMessage();
          await sleep(850, sig);
        },
        signal
      );

      // 8. Sent message hold (~1.6s)
      await runStep(
        2,
        'act2-sent',
        () => (chatMessagesRef.current.length < 2 ? 'Chat must have user and reply bubbles during hold' : null),
        async (sig) => {
          await sleep(1600, sig);
        },
        signal
      );

      // 9. Move to Reset button
      await runStep(
        2,
        'act2-move-to-reset',
        null,
        async (sig) => {
          const resetPos = getRelPos(resetBtn, 0.5, 0.5);
          await moveTo(resetPos, 0.75, sig);
        },
        signal
      );

      // 10. Click Reset: chat cleared, greeting returns
      await runStep(
        2,
        'act2-reset',
        () => (chatMessagesRef.current.length < 2 ? 'Chat must contain sent messages before Reset' : null),
        async (sig) => {
          await press(resetBtn, sig);
          handleResetChat();
          await sleep(450, sig);
        },
        signal
      );

      // 11. Move to .cursorrules card & Click
      await runStep(
        2,
        'select-cursorrules',
        () => (chatMessagesRef.current.length !== 1 || chatMessagesRef.current[0].id !== 'welcome' ? 'Chat must be at greeting before selecting .cursorrules' : null),
        async (sig) => {
          const cursorrulesPos = getRelPos(cardCursorrules, 0.5, 0.5);
          await moveTo(cursorrulesPos, 0.95, sig);
          await press(cardCursorrules, sig);
          setSelectedFile(SAMPLE_FILES[2]);
          selectedFileRef.current = SAMPLE_FILES[2];
          await sleep(250, sig);
        },
        signal
      );

      // =====================================================================
      // ACT 3: .cursorrules (via Drag and Drop)
      // =====================================================================
      // 1. Move to Grip of chip
      await runStep(
        3,
        'act3-move-to-chip',
        () => (copiedRef.current ? 'Copied must NEVER be true in Act 3' : null),
        async (sig) => {
          const gripPos = getRelPos(chip, 0.08, 0.5);
          await moveTo(gripPos, 0.85, sig);
        },
        signal
      );

      // 2. Grab: compact ghost attaches
      await runStep(
        3,
        'act3-grab',
        () => (selectedFileRef.current.id !== 'cursorrules' ? '.cursorrules must be selected before grab' : null),
        async (sig) => {
          if (ghost) gsap.set(ghost, { opacity: 0, scale: 0.85, rotation: 0 });
          await Promise.all([
            tween(cursor, { scale: 0.9, duration: 0.12, ease: 'power2.in' }, sig),
            chip ? tween(chip, { opacity: 0.5, duration: 0.12 }, sig) : Promise.resolve(),
            ghost ? tween(ghost, { opacity: 1, scale: 1, duration: 0.12 }, sig) : Promise.resolve(),
          ]);
        },
        signal
      );

      // 3. Drag arc to chat input
      await runStep(
        3,
        'act3-drag',
        null,
        async (sig) => {
          const inputPos = getRelPos(chatInputContainerRef.current, 0.35, 0.5);
          await curveTo(inputPos, 50, 1.25, sig, (prog) => {
            if (ghost) {
              const tilt = Math.sin(prog * Math.PI) * 5;
              gsap.set(ghost, { rotation: tilt });
            }
            if (prog > 0.65 && dropRingRef.current) {
              gsap.set(dropRingRef.current, { opacity: 1 });
            }
          });
        },
        signal
      );

      // 4. Release / Drop chip into input
      await runStep(
        3,
        'act3-drop',
        null,
        async (sig) => {
          if (dropRingRef.current) gsap.set(dropRingRef.current, { opacity: 0 });
          if (ghost) gsap.set(ghost, { opacity: 0, scale: 0.9, rotation: 0 });
          if (chip) gsap.set(chip, { opacity: 1 });
          setAttachedFile(SAMPLE_FILES[2]);
          attachedFileRef.current = SAMPLE_FILES[2];
          await tween(cursor, { scale: 1, duration: 0.15, ease: 'back.out' }, sig);
          await sleep(200, sig);
        },
        signal
      );

      // 5. Move to Send
      await runStep(
        3,
        'act3-move-to-send',
        () => (!attachedFileRef.current ? 'Attachment chip must be in input before move to Send' : null),
        async (sig) => {
          const sendPos = getRelPos(sendBtn, 0.5, 0.5);
          await moveTo(sendPos, 0.65, sig);
        },
        signal
      );

      // 6. Click Send: chip removed immediately, user msg added, reply added
      await runStep(
        3,
        'act3-send',
        () => (!attachedFileRef.current ? 'Input must contain attachment chip before clicking Send' : null),
        async (sig) => {
          await press(sendBtn, sig);
          handleSendMessage();
          await sleep(850, sig);
        },
        signal
      );

      // 7. Sent message hold (~1.6s)
      await runStep(
        3,
        'act3-sent',
        () => (chatMessagesRef.current.length < 2 ? 'Chat must have user and reply bubbles during hold' : null),
        async (sig) => {
          await sleep(1600, sig);
        },
        signal
      );

      // 8. Move to Reset button
      await runStep(
        3,
        'act3-move-to-reset',
        null,
        async (sig) => {
          const resetPos = getRelPos(resetBtn, 0.5, 0.5);
          await moveTo(resetPos, 0.75, sig);
        },
        signal
      );

      // 9. Click Reset: chat cleared, greeting returns
      await runStep(
        3,
        'act3-reset',
        () => (chatMessagesRef.current.length < 2 ? 'Chat must contain sent messages before Reset' : null),
        async (sig) => {
          await press(resetBtn, sig);
          handleResetChat();
          await sleep(450, sig);
        },
        signal
      );

      // 10. CLOSING: Move to CLAUDE.md card (= HOME) and Click
      await runStep(
        3,
        'select-claude',
        () => (chatMessagesRef.current.length !== 1 || chatMessagesRef.current[0].id !== 'welcome' ? 'Chat must be at greeting before selecting CLAUDE.md' : null),
        async (sig) => {
          await moveTo(homePos, 0.95, sig);
          await press(cardClaude, sig);
          setSelectedFile(SAMPLE_FILES[0]);
          selectedFileRef.current = SAMPLE_FILES[0];
          await sleep(250, sig);
        },
        signal
      );

      // 11. Rest at HOME for ~0.8s
      await runStep(
        3,
        'rest',
        null,
        async (sig) => {
          await sleep(800, sig);
        },
        signal
      );

      // Increment loop count
      loopCountRef.current += 1;
      updateDebugHook();
    },
    [getRelPos, moveTo, curveTo, press, tween, sleep, runStep, updateDebugHook]
  );

  // Self-Healing Runner Loop
  const startRunnerLoop = useCallback(async () => {
    cancelRunner();
    if (userPausedRef.current || interactionPausedRef.current || !isVisibleRef.current || reducedMotion) {
      return;
    }

    const controller = new AbortController();
    runAbortControllerRef.current = controller;

    try {
      while (!controller.signal.aborted) {
        await runMasterScript(controller.signal);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Normal cancellation
        return;
      }
      console.warn('[Demo Runner] Error encountered, self-healing back to HOME:', err);

      // Self-Heal: Cancel, restore HOME, rest 0.6s, restart
      cancelRunner();
      restoreHome();
      if (!userPausedRef.current && !interactionPausedRef.current && isVisibleRef.current && !reducedMotion) {
        runnerRestartTimerRef.current = setTimeout(() => {
          startRunnerLoop();
        }, 600);
      }
    }
  }, [cancelRunner, restoreHome, runMasterScript, reducedMotion]);

  // Pause / Resume in place for Viewport & Tab Visibility
  const pauseInPlace = useCallback(() => {
    if (!pauseGateRef.current) {
      let resolveFn = () => {};
      const promise = new Promise<void>((r) => {
        resolveFn = r;
      });
      pauseGateRef.current = { promise, resolve: resolveFn };
    }
    if (activeTweenRef.current) {
      activeTweenRef.current.pause();
    }
  }, []);

  const resumeInPlace = useCallback(() => {
    if (activeTweenRef.current) {
      activeTweenRef.current.resume();
    }
    if (pauseGateRef.current) {
      const gate = pauseGateRef.current;
      pauseGateRef.current = null;
      gate.resolve();
    }
  }, []);

  // Real Intent Takeover: cancels runner, fades cursor out, restores HOME, auto-resumes after 6s
  const triggerTakeover = useCallback(
    (reason: string, targetName = 'unknown') => {
      takeoverReasonRef.current = reason;
      interactionPausedRef.current = true;
      setInteractionPaused(true);
      takeoverLogRef.current = [
        ...takeoverLogRef.current.slice(-9),
        { type: reason, target: targetName, time: performance.now() },
      ];

      cancelRunner();
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      }
      restoreHome();
      setDemoStep('idle');
      demoStepRef.current = 'idle';

      if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);
      takeoverTimerRef.current = setTimeout(() => {
        if (userPausedRef.current || !isVisibleRef.current || reducedMotion) return;
        interactionPausedRef.current = false;
        setInteractionPaused(false);
        takeoverReasonRef.current = null;
        restoreHome();
        startRunnerLoop();
      }, 6000);

      updateDebugHook();
    },
    [cancelRunner, restoreHome, startRunnerLoop, updateDebugHook, reducedMotion]
  );

  // IntersectionObserver & Visibility handling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    const checkInView = () => {
      const r = container.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    if (checkInView() && !document.hidden) {
      isVisibleRef.current = true;
      if (!userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
        startRunnerLoop();
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !document.hidden) {
            isVisibleRef.current = true;
            if (!userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
              if (!runAbortControllerRef.current) {
                startRunnerLoop();
              } else {
                resumeInPlace();
              }
            }
          } else {
            isVisibleRef.current = false;
            pauseInPlace();
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseInPlace();
      } else {
        if (isVisibleRef.current && !userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
          if (!runAbortControllerRef.current) {
            startRunnerLoop();
          } else {
            resumeInPlace();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelRunner();
      if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);
    };
  }, [startRunnerLoop, pauseInPlace, resumeInPlace, cancelRunner, reducedMotion]);

  // Handle Resize and Font Loading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isVisibleRef.current && !userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
          // Re-evaluate positions without breaking state
          resumeInPlace();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [resumeInPlace, reducedMotion]);

  // Toggle Pause Button
  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userPaused) {
      setUserPaused(false);
      userPausedRef.current = false;
      interactionPausedRef.current = false;
      setInteractionPaused(false);
      if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);

      restoreHome();
      updateDebugHook();
      setTimeout(() => {
        if (isVisibleRef.current && !reducedMotion) {
          startRunnerLoop();
        }
      }, 50);
    } else {
      setUserPaused(true);
      userPausedRef.current = true;
      if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);
      cancelRunner();
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      }
      restoreHome();
      setDemoStep('idle');
      demoStepRef.current = 'idle';
      updateDebugHook();
    }
  };

  return (
    <section
      id="playground"
      ref={containerRef}
      data-demo-act={String(demoAct)}
      data-demo-phase={demoStep}
      className="py-24 bg-cream border-t border-line-ink/40 relative overflow-hidden"
      onPointerDown={(e) => {
        if (!e.isTrusted || isDemoDispatching) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest('button[aria-label*="demo"]')) return;
        const control = target?.closest(
          '[data-card-index], [data-testid="copy-btn"], [data-testid="send-btn"], [data-testid="reset-chat-btn"], [data-testid="drag-chip"], [data-format-toggle], input, textarea'
        ) as HTMLElement | null;
        if (!control) return;
        const controlName =
          control.getAttribute('data-testid') ||
          control.getAttribute('data-file-id') ||
          (control.hasAttribute('data-format-toggle') ? 'format-toggle' : control.tagName.toLowerCase());
        triggerTakeover('pointerdown', controlName);
      }}
      onTouchStart={(e) => {
        if (!e.isTrusted || isDemoDispatching) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest('button[aria-label*="demo"]')) return;
        const control = target?.closest(
          '[data-card-index], [data-testid="copy-btn"], [data-testid="send-btn"], [data-testid="reset-chat-btn"], [data-testid="drag-chip"], [data-format-toggle], input, textarea'
        ) as HTMLElement | null;
        if (!control) return;
        const controlName =
          control.getAttribute('data-testid') ||
          control.getAttribute('data-file-id') ||
          (control.hasAttribute('data-format-toggle') ? 'format-toggle' : control.tagName.toLowerCase());
        triggerTakeover('touchstart', controlName);
      }}
    >
      {/* Auto-playing Fake Cursor Overlay with Soft Orange Halo */}
      {!reducedMotion && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          data-testid="fake-cursor"
          className="absolute top-0 left-0 pointer-events-none z-[35] opacity-0 will-change-transform select-none"
          style={{ transformOrigin: '4px 3px' }}
        >
          {/* Soft Orange Halo */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 'clamp(38px, 2.3vw, 56px)',
              height: 'clamp(38px, 2.3vw, 56px)',
              top: '-12px',
              left: '-12px',
              background: 'radial-gradient(circle, rgba(242,163,58,0.45) 0%, rgba(242,163,58,0.2) 55%, transparent 75%)',
              filter: 'blur(3px)',
              opacity: 0.35,
            }}
          />

          {/* Desktop Arrow Cursor */}
          <div className="hidden sm:block relative">
            <svg
              className="w-[clamp(23px,1.35vw,35px)] h-[clamp(23px,1.35vw,35px)] filter drop-shadow-[0_5px_8px_rgba(28,42,36,0.35)]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 3L11 20L13.5 13.5L20 11L4 3Z"
                fill="#FDFBF7"
                stroke="#1C2A24"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Touch / Mobile Finger Indicator */}
          <div className="block sm:hidden">
            <svg
              className="w-7 h-7 filter drop-shadow-[0_4px_8px_rgba(28,42,36,0.25)] -translate-x-1/2 -translate-y-1/2"
              viewBox="0 0 34 34"
              fill="none"
            >
              <circle
                cx="17"
                cy="17"
                r="13"
                fill="#FDFBF7"
                fillOpacity="0.85"
                stroke="#1C2A24"
                strokeWidth="2"
              />
              <circle cx="17" cy="17" r="5" fill="#C87A38" />
            </svg>
          </div>

          {/* Compact Pill Ghost Chip: Cursor tip sits exactly 14px inside ghost left edge, centered vertically */}
          <div
            ref={ghostChipRef}
            data-testid="ghost-chip"
            className="absolute pointer-events-none rounded-xl bg-orange text-forest border-2 border-forest px-3 py-1.5 shadow-md flex items-center gap-1.5 text-xs font-mono font-bold select-none opacity-0 scale-95 origin-[0px_17px] whitespace-nowrap"
            style={{
              left: '14px',
              top: '-17px',
              width: 'max-content',
              maxWidth: '220px',
              height: '34px',
            }}
          >
            <FileText className="w-3.5 h-3.5 text-forest/70 shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6">
        {/* Header with Circular Pause/Play Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-16">
          <div className="text-center sm:text-left max-w-2xl">
            <Pill className="mb-3">Live product demo</Pill>
            <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
              Try it right here.
            </h2>
            <p className="text-sm text-ink/75 mt-2 font-sans">
              Pick a markdown file, toggle copy formatting, and drag the file chip straight into the mock chat box.
            </p>
          </div>

          {!reducedMotion && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={togglePause}
              aria-pressed={userPaused}
              aria-label={userPaused ? 'Play demo' : 'Pause demo'}
              className="w-10 h-10 rounded-full border-2 border-line-ink/60 bg-cream hover:bg-cream-dim text-ink flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 shrink-0 shadow-sm cursor-pointer"
            >
              {userPaused ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Pause className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: File Selector & Formatter Preview (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-cream-dim/60 border-2 border-line-ink p-6 shadow-sm space-y-6 min-h-[500px] overflow-hidden">
            {/* Step 1: Pick File */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-display text-ink tracking-tight">
                  Choose a sample file
                </span>
                <span className="text-xs font-display text-ink/70">3 preset files</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_FILES.map((file, idx) => {
                  const isSelected = selectedFile.id === file.id;
                  return (
                    <button
                      key={file.id}
                      data-file-id={file.id}
                      data-card-index={idx}
                      ref={(el) => {
                        fileCardRefs.current[idx] = el;
                      }}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
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
                      <p className="text-[11px] text-ink/70 font-sans truncate">{file.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Toggle Copy Mode & Working Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-display text-ink tracking-tight">
                  Output format
                </span>
                <div className="flex rounded-lg bg-cream border border-line-ink/60 p-0.5">
                  {(['raw', 'codeblock', 'prompt'] as CopyMode[]).map((m) => (
                    <button
                      key={m}
                      data-format-toggle="true"
                      onClick={() => setMode(m)}
                      className={`px-3 py-1 text-xs font-display font-bold rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                        mode === m
                          ? 'bg-ink text-cream shadow-sm'
                          : 'text-ink/70 hover:text-ink'
                      }`}
                    >
                      {m === 'codeblock' ? 'Code block' : m === 'prompt' ? 'Prompt-ready' : 'Raw'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Preview Box */}
              <div className="relative rounded-xl bg-forest text-cream p-4 font-mono text-xs leading-relaxed border border-cream/20 shadow-inner overflow-hidden h-[185px] min-h-[185px] max-h-[185px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-cream/10 text-[11px] text-cream-dim">
                  <span className="font-display">
                    Format: <strong className="text-orange">{mode === 'codeblock' ? 'Code block' : mode === 'prompt' ? 'Prompt-ready' : 'Raw'}</strong>
                  </span>
                  <span className="font-mono">{selectedFile.name}</span>
                </div>
                <pre
                  ref={previewRef}
                  className="whitespace-pre-wrap font-mono text-[11px] text-cream/90 selection:bg-orange selection:text-forest overflow-y-auto max-h-[135px]"
                >
                  {formattedText}
                </pre>
              </div>
            </div>

            {/* Step 3: Interactive Draggable Chip & Copy Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 min-w-0 overflow-hidden">
              {/* HTML5 Draggable File Chip */}
              <div
                ref={chipRef}
                data-testid="drag-chip"
                tabIndex={0}
                draggable
                onDragStart={(e) => {
                  if (!isDemoDispatching) {
                    triggerTakeover('dragstart', 'drag-chip');
                  }
                  handleDragStart(e);
                }}
                onDragEnd={handleDragEnd}
                className="w-full sm:w-auto flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-orange text-forest font-display text-xs font-bold border-2 border-forest shadow-sm cursor-grab active:cursor-grabbing hover:bg-orange-deep transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                title="Drag this chip into the mock chat box on the right"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <GripVertical className="w-4 h-4 text-forest/70 shrink-0" />
                  <span className="block truncate">
                    Drag <span className="font-mono">{selectedFile.name}</span> chip
                  </span>
                </div>
                <span ref={chipHintRef} className="text-xs font-display px-2 py-0.5 bg-forest/10 rounded shrink-0">
                  Drag me →
                </span>
              </div>

              {/* Copy button: fixed width on sm to eliminate layout expansion */}
              <button
                ref={copyBtnRef}
                data-testid="copy-btn"
                onClick={handleCopy}
                className="relative w-full sm:w-[195px] shrink-0 px-4 py-2.5 rounded-xl bg-ink text-cream hover:bg-ink/90 font-display text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-orange" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to clipboard!' : 'Copy to clipboard'}
              </button>
            </div>
          </div>

          {/* Right Column: Fake Chat Box Receiver (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-cream-dim/60 border-2 border-line-ink p-6 shadow-sm flex flex-col min-h-[500px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-line-ink/40">
              <span className="font-display text-lg text-ink">Mock AI chat</span>
              <button
                ref={resetBtnRef}
                data-testid="reset-chat-btn"
                data-reset-count={resetClickCount}
                onClick={handleResetChat}
                className="relative text-ink/70 hover:text-ink text-xs font-display flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded px-2 py-1 cursor-pointer transition-transform"
                title="Reset messages"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Chat Area: Fixed height, overflow hidden, pinned to bottom */}
            <div
              data-testid="chat-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={handleDrop}
              className={`flex-1 overflow-hidden flex flex-col justify-end space-y-3 p-3 rounded-xl transition-all border-2 h-[300px] max-h-[300px] ${
                isDragging
                  ? 'border-dashed border-orange bg-orange/10 scale-[1.01]'
                  : 'border-line-ink/40 bg-cream'
              }`}
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col transition-all duration-[400ms] ease-out ${
                    isResettingChat && msg.id !== 'welcome'
                      ? 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
                      : 'opacity-100 translate-y-0 scale-100'
                  } ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-xl text-xs font-sans leading-relaxed break-words [overflow-wrap:anywhere] ${
                      msg.sender === 'user'
                        ? 'bg-forest text-cream font-mono text-[11px]'
                        : 'bg-cream-dim border border-line-ink text-ink font-display text-xs'
                    }`}
                  >
                    {msg.fileName && (
                      <div className="text-[10px] font-mono text-orange mb-1 font-bold break-words [overflow-wrap:anywhere]">
                        📄 {msg.fileName}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="mt-4 pt-2">
              <form onSubmit={handleSendMessage} className="relative">
                <div
                  ref={chatInputContainerRef}
                  data-testid="chat-input-container"
                  className={`relative h-12 rounded-xl border border-line-ink bg-cream px-2 py-1.5 flex items-center gap-2 overflow-hidden transition-all ${
                    isDemoInputFocus
                      ? 'ring-2 ring-orange ring-inset'
                      : 'focus-within:ring-2 focus-within:ring-orange focus-within:ring-inset'
                  }`}
                >
                  {/* Glowing orange drop-zone ring */}
                  <div
                    ref={dropRingRef}
                    className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-orange opacity-0 transition-opacity"
                  />

                  {/* Attachment/Text area with zero-shrink, min-w-0 */}
                  <div className="flex-1 min-w-0 h-full flex items-center gap-1.5 overflow-hidden">
                    {attachedFile && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange text-forest font-mono text-[10px] font-bold border border-forest/40 max-w-full min-w-0 shrink-0 overflow-hidden">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{attachedFile.name}</span>
                      </span>
                    )}

                    {pastedContent && !attachedFile && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-forest text-cream font-mono text-[10px] font-bold border border-forest/60 max-w-full min-w-0 shrink-0 overflow-hidden">
                        <FileText className="w-3 h-3 text-orange shrink-0" />
                        <span className="truncate">Pasted from {selectedFile.name}</span>
                        <span className="text-cream/70 text-[9px] shrink-0 font-normal">
                          ({pastedContent.trim().split('\n').filter(Boolean).length} lines)
                        </span>
                      </span>
                    )}

                    {isDemoInputFocus && (
                      <span aria-hidden="true" className="w-[1.5px] h-4 bg-ink animate-pulse shrink-0 ml-0.5" />
                    )}

                    <input
                      ref={chatInputElRef}
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onInput={(e) => {
                        if (e.isTrusted && !isDemoDispatching) {
                          triggerTakeover('input', 'chat-input');
                        }
                      }}
                      placeholder={attachedFile || pastedContent || isDemoInputFocus ? '' : 'Drop file here or type message...'}
                      className="flex-1 min-w-0 w-full h-full px-1 text-xs font-mono bg-transparent border-none text-ink focus:outline-none placeholder:text-ink/40 truncate"
                    />
                  </div>

                  <button
                    ref={sendBtnRef}
                    data-testid="send-btn"
                    type="submit"
                    aria-label="Send message"
                    className="relative flex-none w-8 h-8 rounded-lg bg-orange hover:bg-orange-deep text-forest transition-colors shadow-sm flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-forest cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <div className="text-xs font-display text-ink/70 text-center mt-2">
                Drop a file chip here
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
