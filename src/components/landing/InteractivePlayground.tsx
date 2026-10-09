import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, FileText, Send, GripVertical, RotateCcw, Play, Pause } from 'lucide-react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Pill } from '../ui/Pill';
import { formatFileForCopy } from '../../domain/copyFormats';
import { CopyMode } from '../../domain/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(MotionPathPlugin);
}

// Module-level flag to mark demo-generated interactions so takeover listeners ignore them
// and copy handler skips navigator.clipboard.writeText.
let isDemoDispatching = false;

export function dispatchDemoClick(el: HTMLElement | null) {
  if (!el) return;
  isDemoDispatching = true;
  const activeBefore = document.activeElement;
  try {
    // Dispatch pointerdown and mousedown with defaultPrevented so browsers do not transfer focus
    const pEvt = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    pEvt.preventDefault();
    el.dispatchEvent(pEvt);
    const mEvt = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    mEvt.preventDefault();
    el.dispatchEvent(mEvt);

    el.click();

    // Ensure focus does not move to the element clicked by demo
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

export function truncatePromptLines(text: string, maxLines = 4): string {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return text;
  return lines.slice(0, maxLines).join('\n') + '\n…';
}

export type DemoAct = 1 | 2 | 3;

export type DemoPhase =
  | 'idle'
  // Act 1: CLAUDE.md (Drag and drop)
  | 'act1-move-to-chip'
  | 'act1-grab'
  | 'act1-drag'
  | 'act1-drop'
  | 'act1-move-to-send'
  | 'act1-send'
  | 'act1-sent'
  | 'act1-move-to-reset'
  | 'act1-reset'
  | 'select-agents'
  // Act 2: AGENTS.md (Copy and paste)
  | 'act2-move-to-copy'
  | 'act2-copy'
  | 'act2-move-to-input'
  | 'act2-paste'
  | 'act2-move-to-send'
  | 'act2-send'
  | 'act2-sent'
  | 'act2-move-to-reset'
  | 'act2-reset'
  | 'select-cursorrules'
  // Act 3: .cursorrules (Drag and drop)
  | 'act3-move-to-chip'
  | 'act3-grab'
  | 'act3-drag'
  | 'act3-drop'
  | 'act3-move-to-send'
  | 'act3-send'
  | 'act3-sent'
  | 'act3-move-to-reset'
  | 'act3-reset'
  | 'select-claude'
  | 'rest';

export interface TakeoverLogEntry {
  type: string;
  target: string;
  time: number;
}

declare global {
  interface Window {
    __demo?: {
      act: DemoAct;
      phase: DemoPhase;
      userPaused: boolean;
      interactionPaused: boolean;
      takeoverReason: string | null;
      cursorRect: { left: number; top: number; width: number; height: number } | null;
      loopCount: number;
      takeoverLog: TakeoverLogEntry[];
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

  // Demo state: userPaused (the button) and interactionPaused (takeover)
  const [userPaused, setUserPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [demoAct, setDemoAct] = useState<DemoAct>(1);
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');
  const [reducedMotion, setReducedMotion] = useState(false);

  // DOM Refs
  const containerRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ghostChipRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const chipHintRef = useRef<HTMLSpanElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const copyRippleRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);
  const chatInputContainerRef = useRef<HTMLDivElement>(null);
  const chatInputElRef = useRef<HTMLInputElement>(null);
  const dropRingRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const sendRippleRef = useRef<HTMLSpanElement>(null);
  const resetBtnRef = useRef<HTMLButtonElement>(null);
  const resetRippleRef = useRef<HTMLSpanElement>(null);
  const fileCardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Control & Lifecycle Refs
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const loopCountRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(false);
  const takeoverReasonRef = useRef<string | null>(null);
  const takeoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const takeoverLogRef = useRef<TakeoverLogEntry[]>([]);
  const interactionPausedRef = useRef<boolean>(false);
  const userPausedRef = useRef<boolean>(false);
  interactionPausedRef.current = interactionPaused;
  userPausedRef.current = userPaused;

  const isDebug = typeof window !== 'undefined' && window.location.search.includes('demodebug');

  const formattedText = formatFileForCopy(
    selectedFile.name,
    selectedFile.content,
    mode
  );

  // Reduced motion detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Real copy handler: if demo-invoked, skips writing to clipboard but runs UI state
  const handleCopy = async () => {
    if (!isDemoDispatching) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(formattedText);
        }
      } catch {
        // clipboard access error fallback
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
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

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() && !attachedFile && !pastedContent) return;

    let userText = chatInput;
    let fileName: string | undefined = undefined;

    if (attachedFile) {
      userText = truncatePromptLines(formatFileForCopy(attachedFile.name, attachedFile.content, 'prompt'), 4);
      fileName = attachedFile.name;
    } else if (pastedContent) {
      userText = truncatePromptLines(pastedContent, 4);
      fileName = selectedFile.name;
    }

    setChatMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: 'user', text: userText, fileName },
      {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: fileName
          ? `Got context from ${fileName}! Ready to execute using these guidelines.`
          : `Understood: "${chatInput}". Prompt context is active.`,
      },
    ]);
    setChatInput('');
    setAttachedFile(null);
    setPastedContent(null);
    setIsDemoInputFocus(false);
  };

  // Reset chat handler with 0.45s smooth fade & slide out transition
  const handleResetChat = () => {
    setResetClickCount((c) => c + 1);
    setIsResettingChat(true);
    setTimeout(() => {
      setChatMessages([WELCOME_MESSAGE]);
      setChatInput('');
      setAttachedFile(null);
      setPastedContent(null);
      setIsDemoInputFocus(false);
      setIsResettingChat(false);
    }, 450);
  };

  // Synchronous ref for debug hook
  const demoActRef = useRef<DemoAct>(1);
  const demoPhaseRef = useRef<DemoPhase>('idle');

  // Debug Hook Updater
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
      phase: demoPhaseRef.current,
      userPaused: userPausedRef.current,
      interactionPaused: interactionPausedRef.current,
      takeoverReason: takeoverReasonRef.current,
      cursorRect,
      loopCount: loopCountRef.current,
      takeoverLog: [...takeoverLogRef.current],
    };
  }, []);

  const setPhaseAndAct = useCallback((act: DemoAct, phase: DemoPhase) => {
    demoActRef.current = act;
    demoPhaseRef.current = phase;
    setDemoAct(act);
    setDemoPhase(phase);
    updateDebugHook();
  }, [updateDebugHook]);

  useEffect(() => {
    updateDebugHook();
  }, [updateDebugHook, demoAct, demoPhase, userPaused, interactionPaused]);

  // Master Timeline Builder: Three Acts in One Continuous Seamless Loop
  const buildMasterTimeline = useCallback(
    (preserveProgress = false) => {
      if (!containerRef.current || !cursorRef.current) return;
      if (userPausedRef.current || interactionPausedRef.current || !isVisibleRef.current || reducedMotion) {
        return;
      }

      let prevProgress = 0;
      if (masterTimelineRef.current) {
        if (preserveProgress) {
          prevProgress = masterTimelineRef.current.progress();
        }
        masterTimelineRef.current.kill();
        masterTimelineRef.current = null;
      }

      const container = containerRef.current;
      const cursor = cursorRef.current;
      const ghost = ghostChipRef.current;
      const chip = chipRef.current;
      const copyBtn = copyBtnRef.current;
      const chatInputContainer = chatInputContainerRef.current;
      const sendBtn = sendBtnRef.current;
      const resetBtn = resetBtnRef.current;
      const cardClaude = fileCardRefs.current[0];
      const cardAgents = fileCardRefs.current[1];
      const cardCursorrules = fileCardRefs.current[2];

      const cRect = container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) {
        requestAnimationFrame(() => buildMasterTimeline(preserveProgress));
        return;
      }

      const getCenter = (el: HTMLElement | null, offsetXRatio = 0.5, offsetYRatio = 0.5) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left - cRect.left + r.width * offsetXRatio,
          y: r.top - cRect.top + r.height * offsetYRatio,
        };
      };

      // HOME Position: CLAUDE.md card center-right area
      const homePos = getCenter(cardClaude, 0.65, 0.5);
      const chipPos = getCenter(chip, 0.35, 0.5);
      const copyBtnPos = getCenter(copyBtn, 0.5, 0.5);
      const inputPos = getCenter(chatInputContainer, 0.35, 0.5);
      const sendPos = getCenter(sendBtn, 0.5, 0.5);
      const resetPos = getCenter(resetBtn, 0.5, 0.5);
      const agentsCardPos = getCenter(cardAgents, 0.5, 0.5);
      const cursorrulesCardPos = getCenter(cardCursorrules, 0.5, 0.5);

      const isMobile = window.innerWidth <= 768;
      const sp = isMobile ? 1.05 : 1.0;

      // Master continuous timeline
      const tl = gsap.timeline({
        repeat: -1,
        onRepeat: () => {
          loopCountRef.current += 1;
        },
      });
      masterTimelineRef.current = tl;

      // Initial cursor starts at HOME: fade in smoothly without flying
      if (!preserveProgress) {
        gsap.set(cursor, { x: homePos.x, y: homePos.y, opacity: 0, scale: 1, rotation: 0 });
        gsap.to(cursor, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      } else {
        gsap.set(cursor, { opacity: 1, scale: 1 });
      }
      if (ghost) gsap.set(ghost, { opacity: 0, scale: 0.95, rotation: 0 });

      // =====================================================================
      // ACT 1: CLAUDE.md (via Drag and Drop)
      // =====================================================================
      // 0. Home rest
      tl.call(() => {
        setPhaseAndAct(1, 'idle');
      });
      tl.to({}, { duration: 0.8 * sp });

      // 1. Move from HOME to drag chip
      tl.call(() => setPhaseAndAct(1, 'act1-move-to-chip'));
      const mid1X = (homePos.x + chipPos.x) / 2 + (isMobile ? 10 : 25);
      const mid1Y = (homePos.y + chipPos.y) / 2 - (isMobile ? 20 : 35);
      tl.to(cursor, {
        motionPath: {
          path: [{ x: mid1X, y: mid1Y }, { x: chipPos.x, y: chipPos.y }],
          curviness: 1.2,
        },
        duration: 1.15 * sp,
        ease: 'power3.inOut',
      });

      // Lift chip on arrival
      if (chip) {
        tl.to(chip, { y: -3, duration: 0.15, ease: 'power2.out' }, '-=0.15');
        if (chipHintRef.current) {
          tl.to(chipHintRef.current, { x: 4, duration: 0.15, yoyo: true, repeat: 1 }, '-=0.15');
        }
      }

      // 2. Grab chip
      tl.call(() => setPhaseAndAct(1, 'act1-grab'));
      tl.to(cursor, { scale: 0.9, duration: 0.12 * sp, ease: 'power2.in' });
      if (chip) tl.to(chip, { opacity: 0.5, duration: 0.12 * sp }, '<');
      if (ghost) tl.to(ghost, { opacity: 1, scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.12 * sp });

      // 3. Drag arc to chat input
      tl.call(() => setPhaseAndAct(1, 'act1-drag'));
      const midDrag1X = (chipPos.x + inputPos.x) / 2;
      const midDrag1Y = Math.min(chipPos.y, inputPos.y) - (isMobile ? 35 : 65);
      tl.to(cursor, {
        motionPath: {
          path: [{ x: midDrag1X, y: midDrag1Y }, { x: inputPos.x, y: inputPos.y }],
          curviness: 1.25,
        },
        duration: 1.35 * sp,
        ease: 'power2.inOut',
      });
      if (ghost) {
        tl.to(ghost, { rotation: isMobile ? 3 : 5, duration: 0.65 * sp, ease: 'power1.out' }, '<');
        tl.to(ghost, { rotation: 0, duration: 0.7 * sp, ease: 'power1.in' }, '>-0.65');
      }
      if (dropRingRef.current) {
        tl.to(dropRingRef.current, { opacity: 1, duration: 0.25 }, '-=0.35');
      }

      // 4. Drop chip into input
      tl.call(() => setPhaseAndAct(1, 'act1-drop'));
      if (ghost) tl.to(ghost, { opacity: 0, scale: 0.8, y: '+=8', duration: 0.22 * sp, ease: 'power2.in' });
      if (chip) tl.to(chip, { opacity: 1, y: 0, duration: 0.22 * sp }, '<');
      if (dropRingRef.current) tl.to(dropRingRef.current, { opacity: 0, duration: 0.22 * sp }, '<');
      tl.to(cursor, { scale: 1, duration: 0.15 * sp, ease: 'back.out' }, '<');
      tl.call(() => setAttachedFile(SAMPLE_FILES[0]));
      tl.to({}, { duration: 0.18 * sp });

      // 5. Move to Send
      tl.call(() => setPhaseAndAct(1, 'act1-move-to-send'));
      tl.to(cursor, {
        x: sendPos.x,
        y: sendPos.y,
        duration: 0.65 * sp,
        ease: 'power3.out',
      });

      // 6. Click Send
      tl.call(() => setPhaseAndAct(1, 'act1-send'));
      tl.to(cursor, { scale: 0.88, duration: 0.12 * sp, ease: 'power2.in' });
      if (sendBtn) tl.to(sendBtn, { scale: 0.92, duration: 0.12 * sp }, '<');
      if (sendRippleRef.current) {
        tl.fromTo(
          sendRippleRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1.4, opacity: 0, duration: 0.25 * sp, ease: 'power2.out' },
          '<'
        );
      }
      tl.call(() => dispatchDemoClick(sendBtn));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (sendBtn) tl.to(sendBtn, { scale: 1, duration: 0.12 * sp }, '<');

      // 7. Sent message hold (~1.4s)
      tl.call(() => setPhaseAndAct(1, 'act1-sent'));
      tl.to({}, { duration: 1.4 * sp });

      // 8. Move to Reset button
      tl.call(() => setPhaseAndAct(1, 'act1-move-to-reset'));
      tl.to(cursor, {
        x: resetPos.x,
        y: resetPos.y,
        duration: 0.75 * sp,
        ease: 'power3.inOut',
      });

      // 9. Click Reset button (chat clears with 0.45s slide out)
      tl.call(() => setPhaseAndAct(1, 'act1-reset'));
      tl.to(cursor, { scale: 0.88, duration: 0.12 * sp, ease: 'power2.in' });
      if (resetBtn) tl.to(resetBtn, { scale: 0.92, duration: 0.12 * sp }, '<');
      if (resetRippleRef.current) {
        tl.fromTo(
          resetRippleRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1.4, opacity: 0, duration: 0.25 * sp, ease: 'power2.out' },
          '<'
        );
      }
      tl.call(() => dispatchDemoClick(resetBtn));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (resetBtn) tl.to(resetBtn, { scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.55 * sp }); // wait for 0.45s slide out to complete

      // 10. Move to AGENTS.md card & click it
      tl.call(() => setPhaseAndAct(1, 'select-agents'));
      tl.to(cursor, {
        x: agentsCardPos.x,
        y: agentsCardPos.y,
        duration: 1.05 * sp,
        ease: 'power3.inOut',
      });
      tl.to(cursor, { scale: 0.9, duration: 0.12 * sp });
      if (cardAgents) tl.to(cardAgents, { scale: 0.96, duration: 0.12 * sp }, '<');
      tl.call(() => dispatchDemoClick(cardAgents));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (cardAgents) tl.to(cardAgents, { scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.35 * sp });

      // =====================================================================
      // ACT 2: AGENTS.md (via Copy to Clipboard & Paste)
      // =====================================================================
      // 1. Move to Copy button
      tl.call(() => {
        setPhaseAndAct(2, 'act2-move-to-copy');
      });
      tl.to(cursor, {
        x: copyBtnPos.x,
        y: copyBtnPos.y,
        duration: 1.15 * sp,
        ease: 'power3.inOut',
      });

      // 2. Click Copy button
      tl.call(() => setPhaseAndAct(2, 'act2-copy'));
      tl.to(cursor, { scale: 0.88, duration: 0.12 * sp, ease: 'power2.in' });
      if (copyBtn) tl.to(copyBtn, { scale: 0.94, duration: 0.12 * sp }, '<');
      if (copyRippleRef.current) {
        tl.fromTo(
          copyRippleRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1.4, opacity: 0, duration: 0.25 * sp, ease: 'power2.out' },
          '<'
        );
      }
      tl.call(() => dispatchDemoClick(copyBtn));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (copyBtn) tl.to(copyBtn, { scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.45 * sp });

      // 3. Move to chat input
      tl.call(() => setPhaseAndAct(2, 'act2-move-to-input'));
      tl.to(cursor, {
        x: inputPos.x,
        y: inputPos.y,
        duration: 1.15 * sp,
        ease: 'power3.inOut',
      });

      // 4. Click input & paste
      tl.call(() => {
        setPhaseAndAct(2, 'act2-paste');
        setIsDemoInputFocus(true);
      });
      tl.to(cursor, { scale: 0.9, duration: 0.12 * sp });
      tl.call(() => {
        const snippet = formatFileForCopy('AGENTS.md', SAMPLE_FILES[1].content, 'prompt');
        setPastedContent(snippet);
      });
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      tl.to({}, { duration: 0.35 * sp });

      // 5. Move to Send
      tl.call(() => {
        setIsDemoInputFocus(false);
        setPhaseAndAct(2, 'act2-move-to-send');
      });
      tl.to(cursor, {
        x: sendPos.x,
        y: sendPos.y,
        duration: 0.65 * sp,
        ease: 'power3.out',
      });

      // 6. Click Send
      tl.call(() => setPhaseAndAct(2, 'act2-send'));
      tl.to(cursor, { scale: 0.88, duration: 0.12 * sp, ease: 'power2.in' });
      if (sendBtn) tl.to(sendBtn, { scale: 0.92, duration: 0.12 * sp }, '<');
      if (sendRippleRef.current) {
        tl.fromTo(
          sendRippleRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1.4, opacity: 0, duration: 0.25 * sp, ease: 'power2.out' },
          '<'
        );
      }
      tl.call(() => dispatchDemoClick(sendBtn));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (sendBtn) tl.to(sendBtn, { scale: 1, duration: 0.12 * sp }, '<');

      // 7. Sent message hold (~1.4s)
      tl.call(() => setPhaseAndAct(2, 'act2-sent'));
      tl.to({}, { duration: 1.4 * sp });

      // 8. Move to Reset button
      tl.call(() => setPhaseAndAct(2, 'act2-move-to-reset'));
      tl.to(cursor, {
        x: resetPos.x,
        y: resetPos.y,
        duration: 0.75 * sp,
        ease: 'power3.inOut',
      });

      // 9. Click Reset button (chat clears)
      tl.call(() => setPhaseAndAct(2, 'act2-reset'));
      tl.to(cursor, { scale: 0.88, duration: 0.12 * sp, ease: 'power2.in' });
      if (resetBtn) tl.to(resetBtn, { scale: 0.92, duration: 0.12 * sp }, '<');
      if (resetRippleRef.current) {
        tl.fromTo(
          resetRippleRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1.4, opacity: 0, duration: 0.25 * sp, ease: 'power2.out' },
          '<'
        );
      }
      tl.call(() => dispatchDemoClick(resetBtn));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (resetBtn) tl.to(resetBtn, { scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.55 * sp });

      // 10. Move to .cursorrules card & click it
      tl.call(() => setPhaseAndAct(2, 'select-cursorrules'));
      tl.to(cursor, {
        x: cursorrulesCardPos.x,
        y: cursorrulesCardPos.y,
        duration: 1.05 * sp,
        ease: 'power3.inOut',
      });
      tl.to(cursor, { scale: 0.9, duration: 0.12 * sp });
      if (cardCursorrules) tl.to(cardCursorrules, { scale: 0.96, duration: 0.12 * sp }, '<');
      tl.call(() => dispatchDemoClick(cardCursorrules));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (cardCursorrules) tl.to(cardCursorrules, { scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.35 * sp });

      // =====================================================================
      // ACT 3: .cursorrules (via Drag and Drop)
      // =====================================================================
      // 1. Move to drag chip
      tl.call(() => {
        setPhaseAndAct(3, 'act3-move-to-chip');
      });
      const mid3X = (cursorrulesCardPos.x + chipPos.x) / 2 + (isMobile ? 10 : 25);
      const mid3Y = (cursorrulesCardPos.y + chipPos.y) / 2 - (isMobile ? 20 : 35);
      tl.to(cursor, {
        motionPath: {
          path: [{ x: mid3X, y: mid3Y }, { x: chipPos.x, y: chipPos.y }],
          curviness: 1.2,
        },
        duration: 1.15 * sp,
        ease: 'power3.inOut',
      });

      // Lift chip on arrival
      if (chip) {
        tl.to(chip, { y: -3, duration: 0.15, ease: 'power2.out' }, '-=0.15');
        if (chipHintRef.current) {
          tl.to(chipHintRef.current, { x: 4, duration: 0.15, yoyo: true, repeat: 1 }, '-=0.15');
        }
      }

      // 2. Grab chip
      tl.call(() => setPhaseAndAct(3, 'act3-grab'));
      tl.to(cursor, { scale: 0.9, duration: 0.12 * sp, ease: 'power2.in' });
      if (chip) tl.to(chip, { opacity: 0.5, duration: 0.12 * sp }, '<');
      if (ghost) tl.to(ghost, { opacity: 1, scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.12 * sp });

      // 3. Drag arc to chat input
      tl.call(() => setPhaseAndAct(3, 'act3-drag'));
      const midDrag3X = (chipPos.x + inputPos.x) / 2;
      const midDrag3Y = Math.min(chipPos.y, inputPos.y) - (isMobile ? 35 : 65);
      tl.to(cursor, {
        motionPath: {
          path: [{ x: midDrag3X, y: midDrag3Y }, { x: inputPos.x, y: inputPos.y }],
          curviness: 1.25,
        },
        duration: 1.35 * sp,
        ease: 'power2.inOut',
      });
      if (ghost) {
        tl.to(ghost, { rotation: isMobile ? 3 : 5, duration: 0.65 * sp, ease: 'power1.out' }, '<');
        tl.to(ghost, { rotation: 0, duration: 0.7 * sp, ease: 'power1.in' }, '>-0.65');
      }
      if (dropRingRef.current) {
        tl.to(dropRingRef.current, { opacity: 1, duration: 0.25 }, '-=0.35');
      }

      // 4. Drop chip into input
      tl.call(() => setPhaseAndAct(3, 'act3-drop'));
      if (ghost) tl.to(ghost, { opacity: 0, scale: 0.8, y: '+=8', duration: 0.22 * sp, ease: 'power2.in' });
      if (chip) tl.to(chip, { opacity: 1, y: 0, duration: 0.22 * sp }, '<');
      if (dropRingRef.current) tl.to(dropRingRef.current, { opacity: 0, duration: 0.22 * sp }, '<');
      tl.to(cursor, { scale: 1, duration: 0.15 * sp, ease: 'back.out' }, '<');
      tl.call(() => setAttachedFile(SAMPLE_FILES[2]));
      tl.to({}, { duration: 0.18 * sp });

      // 5. Move to Send
      tl.call(() => setPhaseAndAct(3, 'act3-move-to-send'));
      tl.to(cursor, {
        x: sendPos.x,
        y: sendPos.y,
        duration: 0.65 * sp,
        ease: 'power3.out',
      });

      // 6. Click Send
      tl.call(() => setPhaseAndAct(3, 'act3-send'));
      tl.to(cursor, { scale: 0.88, duration: 0.12 * sp, ease: 'power2.in' });
      if (sendBtn) tl.to(sendBtn, { scale: 0.92, duration: 0.12 * sp }, '<');
      if (sendRippleRef.current) {
        tl.fromTo(
          sendRippleRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1.4, opacity: 0, duration: 0.25 * sp, ease: 'power2.out' },
          '<'
        );
      }
      tl.call(() => dispatchDemoClick(sendBtn));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (sendBtn) tl.to(sendBtn, { scale: 1, duration: 0.12 * sp }, '<');

      // 7. Sent message hold (~1.4s)
      tl.call(() => setPhaseAndAct(3, 'act3-sent'));
      tl.to({}, { duration: 1.4 * sp });

      // 8. Move to Reset button
      tl.call(() => setPhaseAndAct(3, 'act3-move-to-reset'));
      tl.to(cursor, {
        x: resetPos.x,
        y: resetPos.y,
        duration: 0.75 * sp,
        ease: 'power3.inOut',
      });

      // 9. Click Reset button (chat clears)
      tl.call(() => setPhaseAndAct(3, 'act3-reset'));
      tl.to(cursor, { scale: 0.88, duration: 0.12 * sp, ease: 'power2.in' });
      if (resetBtn) tl.to(resetBtn, { scale: 0.92, duration: 0.12 * sp }, '<');
      if (resetRippleRef.current) {
        tl.fromTo(
          resetRippleRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1.4, opacity: 0, duration: 0.25 * sp, ease: 'power2.out' },
          '<'
        );
      }
      tl.call(() => dispatchDemoClick(resetBtn));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (resetBtn) tl.to(resetBtn, { scale: 1, duration: 0.12 * sp }, '<');
      tl.to({}, { duration: 0.55 * sp });

      // 10. CLOSING: Move from Reset button to CLAUDE.md card (= HOME) and click it
      tl.call(() => setPhaseAndAct(3, 'select-claude'));
      tl.to(cursor, {
        x: homePos.x,
        y: homePos.y,
        duration: 1.15 * sp,
        ease: 'power3.inOut',
      });
      tl.to(cursor, { scale: 0.9, duration: 0.12 * sp });
      if (cardClaude) tl.to(cardClaude, { scale: 0.96, duration: 0.12 * sp }, '<');
      tl.call(() => dispatchDemoClick(cardClaude));
      tl.to(cursor, { scale: 1, duration: 0.12 * sp });
      if (cardClaude) tl.to(cardClaude, { scale: 1, duration: 0.12 * sp }, '<');

      // 11. Rest at HOME for ~0.8s
      tl.call(() => setPhaseAndAct(3, 'rest'));
      tl.to({}, { duration: 0.85 * sp });

      // If preserving progress ratio across layout rebuild:
      if (preserveProgress && prevProgress > 0) {
        tl.progress(prevProgress);
      }
    },
    [reducedMotion]
  );

  // Stop timeline and fade cursor out cleanly
  const stopTimelineAndFadeCursor = useCallback(() => {
    if (masterTimelineRef.current) {
      masterTimelineRef.current.kill();
      masterTimelineRef.current = null;
    }
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
    }
    if (ghostChipRef.current) {
      gsap.set(ghostChipRef.current, { opacity: 0, scale: 0.95 });
    }
    if (chipRef.current) {
      gsap.set(chipRef.current, { y: 0, opacity: 1 });
    }
    if (dropRingRef.current) {
      gsap.set(dropRingRef.current, { opacity: 0 });
    }
    if (copyRippleRef.current) {
      gsap.set(copyRippleRef.current, { opacity: 0 });
    }
    if (sendRippleRef.current) {
      gsap.set(sendRippleRef.current, { opacity: 0 });
    }
    if (resetRippleRef.current) {
      gsap.set(resetRippleRef.current, { opacity: 0 });
    }
    setCopied(false);
    setIsDemoInputFocus(false);
  }, []);

  // Real intent takeover handler
  const triggerTakeover = useCallback(
    (reason: string, targetName = 'unknown') => {
      takeoverReasonRef.current = reason;
      interactionPausedRef.current = true;
      setInteractionPaused(true);
      takeoverLogRef.current = [
        ...takeoverLogRef.current.slice(-9),
        { type: reason, target: targetName, time: performance.now() },
      ];
      if (isDebug) console.log(`[demodebug] Takeover triggered: ${reason} on ${targetName}`);

      // Kill timeline, fade fake cursor out, drop ghost chip
      stopTimelineAndFadeCursor();
      setIsDemoInputFocus(false);

      // Restore clean state: chat reset to greeting, whatever file user selected stays
      setChatMessages([WELCOME_MESSAGE]);
      setChatInput('');
      setAttachedFile(null);
      setPastedContent(null);
      demoPhaseRef.current = 'idle';
      setDemoPhase('idle');

      // Auto-resume after 6s of no further real intent events
      if (takeoverTimerRef.current) {
        clearTimeout(takeoverTimerRef.current);
      }
      takeoverTimerRef.current = setTimeout(() => {
        if (userPausedRef.current || !isVisibleRef.current || reducedMotion) return;
        if (isDebug) console.log('[demodebug] Auto-resuming after 6s idle');
        interactionPausedRef.current = false;
        setInteractionPaused(false);
        takeoverReasonRef.current = null;
        setIsDemoInputFocus(false);

        // Reset to clean initial state: CLAUDE.md selected, prompt mode
        setSelectedFile(SAMPLE_FILES[0]);
        setMode('prompt');
        setChatMessages([WELCOME_MESSAGE]);
        setChatInput('');
        setAttachedFile(null);
        setPastedContent(null);

        // Fade cursor in AT HOME position and start Act 1
        buildMasterTimeline(false);
      }, 6000);

      updateDebugHook();
    },
    [isDebug, stopTimelineAndFadeCursor, buildMasterTimeline, updateDebugHook, reducedMotion]
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
        buildMasterTimeline(false);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !document.hidden) {
            isVisibleRef.current = true;
            if (!userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
              if (!masterTimelineRef.current) {
                buildMasterTimeline(false);
              } else {
                masterTimelineRef.current.resume();
              }
            }
          } else {
            isVisibleRef.current = false;
            // Offscreen pause: pause in place, no restart or teleport
            if (masterTimelineRef.current) {
              masterTimelineRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden: pause the same timeline in place
        if (masterTimelineRef.current) {
          masterTimelineRef.current.pause();
        }
      } else {
        // Tab visible: resume in place if visible and not paused
        if (isVisibleRef.current && !userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
          if (masterTimelineRef.current) {
            masterTimelineRef.current.resume();
          } else {
            buildMasterTimeline(false);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
      if (takeoverTimerRef.current) {
        clearTimeout(takeoverTimerRef.current);
      }
    };
  }, [buildMasterTimeline, reducedMotion]);

  // Handle Resize and Font Load (rebuilds preserving progress ratio)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isVisibleRef.current && !userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
          buildMasterTimeline(true); // Preserve progress!
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    let lastWidth = 0;
    let lastHeight = 0;
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (Math.abs(width - lastWidth) > 3 || Math.abs(height - lastHeight) > 3) {
            lastWidth = width;
            lastHeight = height;
            handleResize();
          }
        }
      });
      resizeObserver.observe(container);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (isVisibleRef.current && !userPausedRef.current && !interactionPausedRef.current && !reducedMotion) {
          buildMasterTimeline(true);
        }
      });
    }

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [buildMasterTimeline, reducedMotion]);

  // Toggle Pause Button
  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userPaused) {
      // Resume from user pause: resumes at HOME in Act 1
      setUserPaused(false);
      userPausedRef.current = false;
      interactionPausedRef.current = false;
      setInteractionPaused(false);
      if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);

      setSelectedFile(SAMPLE_FILES[0]);
      setMode('prompt');
      setChatMessages([WELCOME_MESSAGE]);
      setChatInput('');
      setAttachedFile(null);
      setPastedContent(null);

      setTimeout(() => {
        if (isVisibleRef.current && !reducedMotion) {
          buildMasterTimeline(false);
        }
      }, 30);
    } else {
      // User pauses: clean state, cursor fades out
      setUserPaused(true);
      userPausedRef.current = true;
      if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);
      stopTimelineAndFadeCursor();
      demoPhaseRef.current = 'idle';
      setDemoPhase('idle');
      updateDebugHook();
    }
  };

  return (
    <section
      id="playground"
      ref={containerRef}
      data-demo-act={String(demoAct)}
      data-demo-phase={demoPhase}
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
          {/* Soft Orange Halo: Blurred ring, ~1.6x arrow size, opacity ~0.35 */}
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

          {/* Desktop Arrow Cursor with stronger shadow */}
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

          {/* Ghost Drag Chip */}
          <div
            ref={ghostChipRef}
            data-testid="ghost-chip"
            className="absolute left-4 top-2 pointer-events-none rounded-xl bg-orange text-forest border-2 border-forest px-3 py-1.5 shadow-md flex items-center gap-1.5 text-xs font-mono font-bold select-none opacity-0 scale-95 origin-top-left whitespace-nowrap"
          >
            <GripVertical className="w-3.5 h-3.5 text-forest/70" />
            <span>{selectedFile.name}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6">
        {/* Header with Circular Pause/Play Button (reflects ONLY userPaused) */}
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
              className="w-10 h-10 rounded-full border-2 border-line-ink/60 bg-cream hover:bg-cream-dim text-ink flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 shrink-0 shadow-sm cursor-pointer"
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

              {/* Copy button */}
              <button
                ref={copyBtnRef}
                data-testid="copy-btn"
                onClick={handleCopy}
                className="relative w-full sm:w-[176px] shrink-0 px-4 py-2.5 rounded-xl bg-ink text-cream hover:bg-ink/90 font-display text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange cursor-pointer"
              >
                <span
                  ref={copyRippleRef}
                  className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-orange opacity-0 scale-90"
                />
                {copied ? <Check className="w-4 h-4 text-orange" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy to clipboard'}
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
                <span
                  ref={resetRippleRef}
                  className="pointer-events-none absolute inset-0 rounded ring-2 ring-orange opacity-0 scale-90"
                />
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Drop Zone & Chat History */}
            <div
              data-testid="chat-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={handleDrop}
              className={`flex-1 overflow-y-auto overflow-x-hidden space-y-3 p-3 rounded-xl transition-all border-2 h-[300px] max-h-[300px] ${
                isDragging
                  ? 'border-dashed border-orange bg-orange/10 scale-[1.01]'
                  : 'border-line-ink/40 bg-cream'
              }`}
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col transition-all duration-[450ms] ease-out ${
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
                    <span
                      ref={sendRippleRef}
                      className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-orange opacity-0 scale-90"
                    />
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
