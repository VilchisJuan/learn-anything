"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnimBlock {
  id: string;
  label: string;
  startCell: number;
  size: number;
  freed: boolean;
  colorClass: string;
  freeBgClass: string;
}

interface AnimStep {
  description: string;
  code: string;
  event: "alloc" | "free" | "fail" | "info";
  blocks: AnimBlock[];
}

// ─── Scenario ────────────────────────────────────────────────────────────────
// A story: allocate → use → free → observe fragmentation → fail → understand

const SCENARIO: AnimStep[] = [
  {
    event: "info",
    description: "The heap starts completely empty. Every cell is free and available.",
    code: "// Heap initialized — 24 cells free",
    blocks: [],
  },
  {
    event: "alloc",
    description: "malloc(4) — we allocate a 4-cell integer array. The allocator places it at the lowest available address.",
    code: 'int* arr = malloc(4 * sizeof(int));',
    blocks: [
      { id: "arr", label: "arr", startCell: 0, size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
    ],
  },
  {
    event: "alloc",
    description: "malloc(2) — a linked list node gets 2 cells, placed immediately after the array.",
    code: 'Node* node = malloc(sizeof(Node));',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0, size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4, size: 2, freed: false, colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
    ],
  },
  {
    event: "alloc",
    description: "malloc(6) — a 6-cell text buffer is allocated next. Heap is filling up.",
    code: 'char* buf = malloc(6 * sizeof(char));',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: false, colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: false, colorClass: "bg-blue-500/25 border-blue-500/60",   freeBgClass: "bg-blue-500/10 border-blue-500/20" },
    ],
  },
  {
    event: "alloc",
    description: "malloc(4) — another 4-cell block for a matrix row.",
    code: 'int* row = malloc(4 * sizeof(int));',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: false, colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: false, colorClass: "bg-blue-500/25 border-blue-500/60",   freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",   freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "free",
    description: "free(node) — we're done with the node. It's freed, leaving a 2-cell hole between arr and buf.",
    code: 'free(node);   // ← 2-cell hole created',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: true,  colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: false, colorClass: "bg-blue-500/25 border-blue-500/60",   freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",   freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "free",
    description: "free(buf) — the buffer is freed too. Now there's a 8-cell gap (cells 4–11) in the middle of the heap.",
    code: 'free(buf);    // ← 8-cell gap now (4–11)',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: true,  colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",   freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",   freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "alloc",
    description: "malloc(2) — a small allocation reuses part of the freed gap. The allocator places it at cell 4, the first available slot.",
    code: 'int* ptr = malloc(2 * sizeof(int));',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "ptr",  label: "ptr",  startCell: 4,  size: 2, freed: false, colorClass: "bg-teal-500/25 border-teal-500/60",    freeBgClass: "bg-teal-500/10 border-teal-500/20" },
      { id: "buf",  label: "hole", startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",   freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",   freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "fail",
    description: "malloc(10) — we need 10 contiguous cells. Total free = 6+8 = 14 cells, but no single contiguous run of 10 exists. ALLOCATION FAILS.",
    code: 'int* big = malloc(10);\n// Returns NULL — fragmented!',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "ptr",  label: "ptr",  startCell: 4,  size: 2, freed: false, colorClass: "bg-teal-500/25 border-teal-500/60",    freeBgClass: "bg-teal-500/10 border-teal-500/20" },
      { id: "buf",  label: "hole", startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",   freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",   freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "info",
    description: "This is external fragmentation. Enough total memory is free but it's not contiguous. Modern allocators, GCs, and compacting runtimes work hard to prevent this.",
    code: '// Solution: compaction, memory pools,\n// or a garbage collector',
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "ptr",  label: "ptr",  startCell: 4,  size: 2, freed: false, colorClass: "bg-teal-500/25 border-teal-500/60",    freeBgClass: "bg-teal-500/10 border-teal-500/20" },
      { id: "buf",  label: "hole", startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",   freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",   freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
];

const TOTAL_CELLS = 24;
const COLS = 8;

// ─── Zustand Store ────────────────────────────────────────────────────────────

interface HeapAnimStore {
  step: number;
  isPlaying: boolean;
  speed: number;
  next: () => void;
  prev: () => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
  reset: () => void;
}

export const useHeapAnimStore = create<HeapAnimStore>((set, get) => ({
  step: 0,
  isPlaying: false,
  speed: 2000,
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

// ─── Build cell map ───────────────────────────────────────────────────────────

function buildCellMap(blocks: AnimBlock[]): (AnimBlock | null)[] {
  const map: (AnimBlock | null)[] = Array(TOTAL_CELLS).fill(null);
  for (const b of blocks) {
    for (let i = b.startCell; i < b.startCell + b.size; i++) {
      map[i] = b;
    }
  }
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EVENT_STYLE = {
  alloc:  { label: "malloc()",  className: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  free:   { label: "free()",    className: "text-rose-400 border-rose-400/30 bg-rose-400/10" },
  fail:   { label: "FAIL",      className: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  info:   { label: "info",      className: "text-muted-foreground border-border bg-muted" },
};

export function HeapAnimation() {
  const { step, isPlaying, speed, next, prev, setPlaying, setSpeed, reset } = useHeapAnimStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const current = SCENARIO[step];
  const cellMap = buildCellMap(current.blocks);
  const atEnd = step === SCENARIO.length - 1;
  const atStart = step === 0;
  const eventStyle = EVENT_STYLE[current.event];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const { step, next, setPlaying } = useHeapAnimStore.getState();
        if (step >= SCENARIO.length - 1) {
          setPlaying(false);
        } else {
          next();
        }
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const usedCells = current.blocks.filter(b => !b.freed).reduce((s, b) => s + b.size, 0);
  const freeCells = TOTAL_CELLS - usedCells;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Heap Allocation Animation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">malloc → use → free → fragmentation</p>
        </div>
        <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${eventStyle.className}`}>
          {eventStyle.label}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[340px]">
        {/* Memory grid */}
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {cellMap.map((block, i) => {
              const isFreeCell = block === null;
              const isFreed = block?.freed;

              return (
                <motion.div
                  key={i}
                  layout
                  animate={{
                    backgroundColor: "transparent",
                    scale: 1,
                  }}
                  className={`h-10 rounded flex items-center justify-center border transition-all duration-300 ${
                    isFreeCell
                      ? "bg-muted/30 border-border/20"
                      : isFreed
                      ? `${block!.freeBgClass} border-dashed`
                      : block!.colorClass
                  }`}
                >
                  {!isFreeCell && block!.startCell === i && !isFreed && (
                    <span className="text-[10px] font-mono text-foreground/70 truncate px-0.5">
                      {block!.label}
                    </span>
                  )}
                  {!isFreeCell && isFreed && block!.startCell === i && (
                    <span className="text-[10px] font-mono text-muted-foreground/50">freed</span>
                  )}
                  {isFreeCell && (
                    <span className="text-[9px] text-muted-foreground/20">{i}</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Memory bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{usedCells} cells used</span>
              <span>{freeCells} cells free (of {TOTAL_CELLS})</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5">
              {current.blocks.map((b) => (
                <motion.div
                  key={b.id}
                  className={`h-full rounded-sm ${b.freed ? "bg-muted-foreground/20" : b.colorClass.split(" ")[0]}`}
                  animate={{ width: `${(b.size / TOTAL_CELLS) * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              ))}
            </div>
          </div>

          {/* Fail banner */}
          <AnimatePresence>
            {current.event === "fail" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 text-xs text-amber-400 border border-amber-400/30 bg-amber-400/5 rounded-lg px-3 py-2"
              >
                <AlertTriangle size={13} />
                Allocation failed — fragmentation prevents contiguous placement
              </motion.div>
            )}
            {current.event === "info" && step === SCENARIO.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-muted-foreground border border-border bg-muted rounded-lg px-3 py-2"
              >
                <CheckCircle size={13} />
                End of animation — try the exercise below to experiment freely
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Description panel */}
        <div className="lg:w-60 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-[#0d0d0d] p-5 flex flex-col gap-4">
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
              Code
            </p>
            <AnimatePresence mode="wait">
              <motion.pre
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] font-mono text-emerald-300/80 bg-muted rounded p-2.5 leading-5 whitespace-pre-wrap"
              >
                {current.code}
              </motion.pre>
            </AnimatePresence>
          </div>

          {/* Step dots */}
          <div className="mt-auto flex flex-wrap gap-1">
            {SCENARIO.map((s, i) => (
              <button
                key={i}
                onClick={() => useHeapAnimStore.setState({ step: i })}
                className={`w-4 h-1.5 rounded-full transition-all ${
                  i === step
                    ? "bg-indigo-400 w-6"
                    : i < step
                    ? "bg-indigo-400/40"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 border-t border-border flex items-center gap-3 bg-[#0d0d0d]">
        <button onClick={reset} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Reset">
          <RotateCcw size={14} />
        </button>
        <button onClick={prev} disabled={atStart} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => setPlaying(!isPlaying)}
          className={`p-1.5 rounded transition-colors ${isPlaying ? "text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={next} disabled={atEnd} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <SkipForward size={14} />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-[10px] text-muted-foreground">Speed</span>
          <input type="range" min={600} max={3500} step={200} value={4100 - speed} onChange={(e) => setSpeed(4100 - Number(e.target.value))} className="w-20 accent-indigo-500 h-1" />
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{step + 1} / {SCENARIO.length}</span>
      </div>
    </div>
  );
}
