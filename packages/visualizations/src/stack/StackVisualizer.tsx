"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StackFrame {
  id: string;
  functionName: string;
  locals: { name: string; value: string }[];
  returnValue?: string;
  color: string;
}

interface ScenarioStep {
  description: string;
  event: "start" | "push" | "pop" | "update" | "end";
  frames: StackFrame[];
}

// ─── Scenario: factorial(4) ───────────────────────────────────────────────────

const COLORS = [
  "border-indigo-500/60 bg-indigo-500/10",
  "border-violet-500/60 bg-violet-500/10",
  "border-blue-500/60 bg-blue-500/10",
  "border-cyan-500/60 bg-cyan-500/10",
  "border-teal-500/60 bg-teal-500/10",
];

const LABEL_COLORS = [
  "text-indigo-400",
  "text-violet-400",
  "text-blue-400",
  "text-cyan-400",
  "text-teal-400",
];

const main = (result: string): StackFrame => ({
  id: "main",
  functionName: "main()",
  locals: [{ name: "result", value: result }],
  color: COLORS[0],
});

const fact = (n: number, returns?: string): StackFrame => ({
  id: `fact-${n}`,
  functionName: "factorial(n)",
  locals: [{ name: "n", value: String(n) }],
  returnValue: returns,
  color: COLORS[(5 - n) % COLORS.length],
});

const SCENARIO: ScenarioStep[] = [
  {
    event: "start",
    description: "The program begins. main() is the first function — its stack frame is created automatically.",
    frames: [main("?")],
  },
  {
    event: "push",
    description: "main() calls factorial(4). A new stack frame is pushed on top, holding n=4 as a local variable.",
    frames: [main("?"), fact(4)],
  },
  {
    event: "push",
    description: "factorial(4) calls factorial(3) recursively. Another frame is pushed — each call is independent.",
    frames: [main("?"), fact(4), fact(3)],
  },
  {
    event: "push",
    description: "factorial(3) calls factorial(2). The stack keeps growing with each recursive call.",
    frames: [main("?"), fact(4), fact(3), fact(2)],
  },
  {
    event: "push",
    description: "factorial(2) calls factorial(1). This is the base case — the deepest point in the recursion.",
    frames: [main("?"), fact(4), fact(3), fact(2), fact(1)],
  },
  {
    event: "pop",
    description: "factorial(1) hits the base case (n=1) and returns 1. Its frame is popped — memory is instantly freed.",
    frames: [main("?"), fact(4), fact(3), fact(2, "→ 2×1 = 2")],
  },
  {
    event: "pop",
    description: "factorial(2) receives the result, computes 2×1=2, and returns. Its frame is also popped.",
    frames: [main("?"), fact(4), fact(3, "→ 3×2 = 6")],
  },
  {
    event: "pop",
    description: "factorial(3) returns 3×2=6. The stack is unwinding — each pop is free and instantaneous.",
    frames: [main("?"), fact(4, "→ 4×6 = 24")],
  },
  {
    event: "pop",
    description: "factorial(4) returns 4×6=24. Only main() remains on the stack.",
    frames: [main("24")],
  },
  {
    event: "end",
    description: "main() stores the result (24) and returns. The stack frame is popped and the program exits cleanly.",
    frames: [],
  },
];

// ─── Zustand Store ────────────────────────────────────────────────────────────
// Exported so the future AI chatbot can control the simulation programmatically.

interface StackStore {
  step: number;
  isPlaying: boolean;
  speed: number;
  next: () => void;
  prev: () => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
  reset: () => void;
}

export const useStackStore = create<StackStore>((set, get) => ({
  step: 0,
  isPlaying: false,
  speed: 1800,
  next: () => set((s) => ({ step: Math.min(s.step + 1, SCENARIO.length - 1) })),
  prev: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  setPlaying: (isPlaying) => {
    if (isPlaying && get().step >= SCENARIO.length - 1) {
      set({ step: 0, isPlaying: true });
    } else {
      set({ isPlaying });
    }
  },
  setSpeed: (speed) => set({ speed }),
  reset: () => set({ step: 0, isPlaying: false }),
}));

// ─── Component ────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 6; // warn when approaching stack limit

export function StackVisualizer() {
  const { step, isPlaying, speed, next, prev, setPlaying, setSpeed, reset } =
    useStackStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = SCENARIO[step];
  const frames = current.frames;
  const atEnd = step === SCENARIO.length - 1;
  const atStart = step === 0;
  const danger = frames.length >= MAX_VISIBLE - 1;

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const { step, next, setPlaying } = useStackStore.getState();
        if (step >= SCENARIO.length - 1) {
          setPlaying(false);
        } else {
          next();
        }
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Call Stack Simulator</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Factorial(4) — step through recursion</p>
        </div>
        <div className="flex items-center gap-1.5">
          {danger && (
            <span className="text-xs text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded-full">
              Stack growing deep
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-0 min-h-[420px]">
        {/* Stack visual */}
        <div className="flex-1 flex flex-col justify-end px-6 py-6 relative">

          {/* Stack gauge (right side) */}
          <div className="absolute right-2 top-6 bottom-6 w-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`absolute bottom-0 left-0 right-0 rounded-full transition-colors duration-300 ${
                danger ? "bg-amber-500" : "bg-indigo-500"
              }`}
              animate={{ height: `${(frames.length / MAX_VISIBLE) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>

          {/* Empty state */}
          {frames.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center text-muted-foreground text-sm"
            >
              Stack is empty — program exited
            </motion.div>
          )}

          {/* Stack pointer + frames */}
          <div className="flex flex-col-reverse gap-1.5 max-w-sm w-full mx-auto">
            <AnimatePresence mode="popLayout">
              {frames.map((frame, i) => {
                const isTop = i === frames.length - 1;
                const labelColor = LABEL_COLORS[i % LABEL_COLORS.length];

                return (
                  <motion.div
                    key={frame.id}
                    layout
                    initial={{ opacity: 0, y: -24, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className={`relative rounded-lg border px-4 py-3 ${frame.color}`}
                  >
                    {/* Stack pointer indicator on the top frame */}
                    {isTop && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-5 left-3 flex items-center gap-1 text-[10px] text-indigo-400 font-mono"
                      >
                        <ChevronDown size={10} />
                        SP (stack pointer)
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-sm font-mono font-semibold ${labelColor}`}>
                        {frame.functionName}
                      </span>
                      <div className="flex items-center gap-3">
                        {frame.locals.map((l) => (
                          <span key={l.name} className="text-xs font-mono text-muted-foreground">
                            <span className="text-foreground/60">{l.name}</span>
                            <span className="text-foreground/40 mx-0.5">=</span>
                            <span className="text-foreground">{l.value}</span>
                          </span>
                        ))}
                        {frame.returnValue && (
                          <span className="text-xs font-mono text-emerald-400">
                            {frame.returnValue}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Stack base label */}
          {frames.length > 0 && (
            <div className="max-w-sm w-full mx-auto mt-1.5">
              <div className="border-t-2 border-border/60 pt-1.5 text-[10px] text-muted-foreground text-center tracking-wider uppercase">
                Stack base (low memory address)
              </div>
            </div>
          )}
        </div>

        {/* Description panel */}
        <div className="w-56 shrink-0 border-l border-border bg-[#0d0d0d] p-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              What's happening
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-foreground/80 leading-5"
              >
                {current.description}
              </motion.p>
            </AnimatePresence>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Event
            </p>
            <AnimatePresence mode="wait">
              <motion.span
                key={current.event}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                  current.event === "push"
                    ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                    : current.event === "pop"
                    ? "text-rose-400 border-rose-400/30 bg-rose-400/10"
                    : "text-muted-foreground border-border bg-muted"
                }`}
              >
                {current.event}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="mt-auto">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Stack depth
            </p>
            <div className="flex items-end gap-0.5 h-8">
              {SCENARIO.map((s, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    i <= step ? "bg-indigo-500" : "bg-muted"
                  }`}
                  style={{ height: `${(s.frames.length / MAX_VISIBLE) * 100}%`, minHeight: 2 }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {frames.length} frame{frames.length !== 1 ? "s" : ""} active
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 border-t border-border flex items-center gap-3 bg-[#0d0d0d]">
        <button
          onClick={reset}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Reset"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={prev}
          disabled={atStart}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => setPlaying(!isPlaying)}
          className={`p-1.5 rounded transition-colors ${
            isPlaying
              ? "text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={next}
          disabled={atEnd}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipForward size={14} />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-[10px] text-muted-foreground">Speed</span>
          <input
            type="range"
            min={600}
            max={3000}
            step={200}
            value={3600 - speed}
            onChange={(e) => setSpeed(3600 - Number(e.target.value))}
            className="w-20 accent-indigo-500 h-1"
          />
        </div>

        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {step + 1} / {SCENARIO.length}
        </span>
      </div>
    </div>
  );
}
