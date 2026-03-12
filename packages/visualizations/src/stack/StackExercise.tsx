"use client";

import { useState } from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, RotateCcw, ChevronDown, AlertTriangle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExerciseFrame {
  id: string;
  functionName: string;
  params: { name: string; value: string }[];
  color: string;
  labelColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FRAMES = 8;

const FRAME_COLORS = [
  { bg: "border-indigo-500/60 bg-indigo-500/10", label: "text-indigo-400" },
  { bg: "border-violet-500/60 bg-violet-500/10", label: "text-violet-400" },
  { bg: "border-blue-500/60 bg-blue-500/10",     label: "text-blue-400" },
  { bg: "border-cyan-500/60 bg-cyan-500/10",     label: "text-cyan-400" },
  { bg: "border-teal-500/60 bg-teal-500/10",     label: "text-teal-400" },
  { bg: "border-emerald-500/60 bg-emerald-500/10", label: "text-emerald-400" },
  { bg: "border-amber-500/60 bg-amber-500/10",   label: "text-amber-400" },
  { bg: "border-rose-500/60 bg-rose-500/10",     label: "text-rose-400" },
];

// ─── Zustand Store ────────────────────────────────────────────────────────────
// Exported so the future AI chatbot can call push/pop programmatically.

interface StackExerciseStore {
  frames: ExerciseFrame[];
  lastEvent: "push" | "pop" | "overflow" | "empty" | null;
  push: (frame: Omit<ExerciseFrame, "id" | "color" | "labelColor">) => boolean;
  pop: () => boolean;
  reset: () => void;
}

export const useStackExerciseStore = create<StackExerciseStore>((set, get) => ({
  frames: [],
  lastEvent: null,

  push: (frame) => {
    const { frames } = get();
    if (frames.length >= MAX_FRAMES) {
      set({ lastEvent: "overflow" });
      return false;
    }
    const colorIdx = frames.length % FRAME_COLORS.length;
    const newFrame: ExerciseFrame = {
      ...frame,
      id: `frame-${Date.now()}-${Math.random()}`,
      color: FRAME_COLORS[colorIdx].bg,
      labelColor: FRAME_COLORS[colorIdx].label,
    };
    set({ frames: [...frames, newFrame], lastEvent: "push" });
    return true;
  },

  pop: () => {
    const { frames } = get();
    if (frames.length === 0) {
      set({ lastEvent: "empty" });
      return false;
    }
    set({ frames: frames.slice(0, -1), lastEvent: "pop" });
    return true;
  },

  reset: () => set({ frames: [], lastEvent: null }),
}));

// ─── Component ────────────────────────────────────────────────────────────────

export function StackExercise() {
  const { frames, lastEvent, push, pop, reset } = useStackExerciseStore();
  const [fnName, setFnName] = useState("myFunction");
  const [params, setParams] = useState([{ name: "x", value: "42" }]);

  const overflow = lastEvent === "overflow";
  const usagePct = (frames.length / MAX_FRAMES) * 100;

  function addParam() {
    setParams([...params, { name: "", value: "" }]);
  }

  function removeParam(i: number) {
    setParams(params.filter((_, idx) => idx !== i));
  }

  function updateParam(i: number, field: "name" | "value", val: string) {
    setParams(params.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }

  function handlePush() {
    push({
      functionName: fnName || "anonymous()",
      params: params.filter(p => p.name),
    });
  }

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stack Exercise</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Push your own function calls and watch the stack grow and shrink
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[380px]">
        {/* Stack visual */}
        <div className="flex-1 p-5 flex flex-col justify-end relative">
          {/* Stack gauge */}
          <div className="absolute right-2 top-5 bottom-16 w-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`absolute bottom-0 left-0 right-0 rounded-full ${usagePct > 75 ? "bg-rose-500" : usagePct > 50 ? "bg-amber-500" : "bg-indigo-500"}`}
              animate={{ height: `${usagePct}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>

          {/* Overflow warning */}
          <AnimatePresence>
            {overflow && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-4 right-6 flex items-center gap-2 text-xs text-rose-400 border border-rose-400/30 bg-rose-400/5 rounded-lg px-3 py-2 z-10"
              >
                <AlertTriangle size={13} />
                Stack overflow! Maximum depth ({MAX_FRAMES}) reached.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {frames.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center text-muted-foreground text-sm"
            >
              Stack is empty — push a function call
            </motion.div>
          )}

          {/* Frames */}
          <div className="flex flex-col-reverse gap-1.5 max-w-sm w-full mx-auto mb-2">
            <AnimatePresence mode="popLayout">
              {frames.map((frame, i) => {
                const isTop = i === frames.length - 1;
                return (
                  <motion.div
                    key={frame.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className={`relative rounded-lg border px-4 py-2.5 ${frame.color}`}
                  >
                    {isTop && (
                      <div className="absolute -top-5 left-3 flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
                        <ChevronDown size={10} />
                        SP
                      </div>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`text-sm font-mono font-semibold shrink-0 ${frame.labelColor}`}>
                        {frame.functionName}
                      </span>
                      {frame.params.map((p) => (
                        <span key={p.name} className="text-xs font-mono text-muted-foreground">
                          <span className="text-foreground/60">{p.name}</span>
                          <span className="text-foreground/40 mx-0.5">=</span>
                          <span className="text-foreground">{p.value}</span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {frames.length > 0 && (
            <div className="max-w-sm w-full mx-auto">
              <div className="border-t-2 border-border/60 pt-1.5 text-[10px] text-muted-foreground text-center tracking-wider uppercase">
                Stack base
              </div>
            </div>
          )}

          {/* Depth indicator */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {Array.from({ length: MAX_FRAMES }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${i < frames.length ? "bg-indigo-500 scale-110" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        {/* Controls panel */}
        <div className="lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-[#0d0d0d] p-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Function call to push
            </p>

            {/* Function name */}
            <div className="mb-3">
              <label className="text-[10px] text-muted-foreground mb-1 block">Function name</label>
              <input
                type="text"
                value={fnName}
                onChange={(e) => setFnName(e.target.value)}
                placeholder="myFunction"
                maxLength={20}
                className="w-full bg-muted border border-border rounded px-2.5 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Parameters */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-muted-foreground">Parameters</label>
                <button
                  onClick={addParam}
                  disabled={params.length >= 3}
                  className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 flex items-center gap-0.5"
                >
                  <Plus size={10} /> add
                </button>
              </div>
              <div className="space-y-1.5">
                {params.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updateParam(i, "name", e.target.value)}
                      placeholder="name"
                      maxLength={8}
                      className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary min-w-0"
                    />
                    <span className="text-muted-foreground text-xs">=</span>
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => updateParam(i, "value", e.target.value)}
                      placeholder="value"
                      maxLength={8}
                      className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary min-w-0"
                    />
                    <button
                      onClick={() => removeParam(i)}
                      className="text-muted-foreground hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Push / Pop buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePush}
              disabled={frames.length >= MAX_FRAMES}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded py-2 transition-colors"
            >
              <Plus size={12} /> Push
            </button>
            <button
              onClick={pop}
              disabled={frames.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 border border-border hover:bg-accent hover:text-foreground text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium rounded py-2 transition-colors"
            >
              <Minus size={12} /> Pop
            </button>
          </div>

          {/* Hint */}
          <div className="mt-auto text-[11px] text-muted-foreground leading-4 border border-border/50 rounded p-2.5 bg-muted/30">
            <p className="font-medium text-foreground/60 mb-1">Try it:</p>
            <p>Push <span className="font-mono text-indigo-400">main()</span>, then push <span className="font-mono text-indigo-400">compute(n=5)</span>, then pop to simulate a function returning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
