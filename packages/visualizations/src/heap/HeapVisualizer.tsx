"use client";

import { useState } from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, RotateCcw, AlertTriangle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeapBlock {
  id: string;
  label: string;
  startCell: number;
  size: number;
  freed: boolean;
  colorClass: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_CELLS = 32;
const COLS = 8;

const BLOCK_COLORS = [
  { bg: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500/50", light: "bg-indigo-500/20" },
  { bg: "bg-violet-500", text: "text-violet-400", border: "border-violet-500/50", light: "bg-violet-500/20" },
  { bg: "bg-blue-500",   text: "text-blue-400",   border: "border-blue-500/50",   light: "bg-blue-500/20" },
  { bg: "bg-cyan-500",   text: "text-cyan-400",   border: "border-cyan-500/50",   light: "bg-cyan-500/20" },
  { bg: "bg-teal-500",   text: "text-teal-400",   border: "border-teal-500/50",   light: "bg-teal-500/20" },
  { bg: "bg-emerald-500",text: "text-emerald-400",border: "border-emerald-500/50",light: "bg-emerald-500/20" },
  { bg: "bg-amber-500",  text: "text-amber-400",  border: "border-amber-500/50",  light: "bg-amber-500/20" },
];

const SIZES: { label: string; cells: number }[] = [
  { label: "Small (1 cell)", cells: 1 },
  { label: "Medium (2 cells)", cells: 2 },
  { label: "Large (4 cells)", cells: 4 },
  { label: "XL (8 cells)", cells: 8 },
];

// ─── Zustand Store ────────────────────────────────────────────────────────────
// Exported so the future AI chatbot can control allocations programmatically.

interface HeapStore {
  blocks: HeapBlock[];
  colorIndex: number;
  allocate: (label: string, cells: number) => "ok" | "oom" | "fragmented";
  free: (id: string) => void;
  reset: () => void;
}

function findFreeSlot(blocks: HeapBlock[], size: number): number | null {
  const occupied = new Set<number>();
  for (const b of blocks) {
    if (!b.freed) {
      for (let i = b.startCell; i < b.startCell + b.size; i++) occupied.add(i);
    }
  }
  for (let start = 0; start <= TOTAL_CELLS - size; start++) {
    let fits = true;
    for (let i = start; i < start + size; i++) {
      if (occupied.has(i)) { fits = false; break; }
    }
    if (fits) return start;
  }
  return null;
}

export const useHeapStore = create<HeapStore>((set, get) => ({
  blocks: [],
  colorIndex: 0,

  allocate: (label, cells) => {
    const { blocks, colorIndex } = get();
    const totalFree = TOTAL_CELLS - blocks.filter(b => !b.freed).reduce((s, b) => s + b.size, 0);
    if (cells > totalFree) return "oom";

    const slot = findFreeSlot(blocks, cells);
    if (slot === null) return "fragmented";

    const color = BLOCK_COLORS[colorIndex % BLOCK_COLORS.length];
    const newBlock: HeapBlock = {
      id: `block-${Date.now()}`,
      label,
      startCell: slot,
      size: cells,
      freed: false,
      colorClass: color.bg,
    };
    set({ blocks: [...blocks, newBlock], colorIndex: colorIndex + 1 });
    return "ok";
  },

  free: (id) => set((s) => ({
    blocks: s.blocks.map((b) => b.id === id ? { ...b, freed: true } : b),
  })),

  reset: () => set({ blocks: [], colorIndex: 0 }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCellMap(blocks: HeapBlock[]): (HeapBlock | null)[] {
  const map: (HeapBlock | null)[] = Array(TOTAL_CELLS).fill(null);
  for (const block of blocks) {
    if (!block.freed) {
      for (let i = block.startCell; i < block.startCell + block.size; i++) {
        map[i] = block;
      }
    }
  }
  return map;
}

function calcFragmentation(blocks: HeapBlock[]): number {
  const freed = blocks.filter((b) => b.freed);
  if (freed.length === 0) return 0;
  // Count "holes" between live blocks
  const occupied = new Set<number>();
  for (const b of blocks.filter(x => !x.freed)) {
    for (let i = b.startCell; i < b.startCell + b.size; i++) occupied.add(i);
  }
  const holes: boolean[] = [];
  let inHole = false;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const wasFreed = freed.some(b => i >= b.startCell && i < b.startCell + b.size);
    if (wasFreed && !occupied.has(i)) {
      if (!inHole) { holes.push(true); inHole = true; }
    } else {
      inHole = false;
    }
  }
  return holes.length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MemoryGrid({ cellMap, blocks, onFree }: {
  cellMap: (HeapBlock | null)[];
  blocks: HeapBlock[];
  onFree: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
    >
      {cellMap.map((block, i) => {
        const isHovered = block ? hovered === block.id : false;
        const colorIdx = block ? BLOCK_COLORS.findIndex(c => c.bg === block.colorClass) : -1;
        const color = colorIdx >= 0 ? BLOCK_COLORS[colorIdx] : null;

        return (
          <motion.div
            key={i}
            layout
            className={`relative h-9 rounded flex items-center justify-center text-[9px] font-mono border transition-all duration-150 cursor-default ${
              block
                ? `${color!.light} ${color!.border} ${isHovered ? "brightness-150 cursor-pointer" : ""}`
                : "bg-muted/40 border-border/30"
            }`}
            onClick={() => block && onFree(block.id)}
            onMouseEnter={() => block && setHovered(block.id)}
            onMouseLeave={() => setHovered(null)}
            title={block ? `${block.label} — click to free` : `Cell ${i} (free)`}
          >
            {block && block.startCell === i && (
              <span className={`${color!.text} truncate px-0.5 leading-none text-center`}>
                {block.label.slice(0, 3)}
              </span>
            )}
            {!block && (
              <span className="text-muted-foreground/30">{i}</span>
            )}
            {isHovered && block?.startCell === i && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-500/90 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                click to free
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HeapVisualizer() {
  const { blocks, allocate, free, reset } = useHeapStore();
  const [label, setLabel] = useState("myVar");
  const [sizeIdx, setSizeIdx] = useState(1);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const cellMap = buildCellMap(blocks);
  const liveBlocks = blocks.filter((b) => !b.freed);
  const usedCells = liveBlocks.reduce((s, b) => s + b.size, 0);
  const freeCells = TOTAL_CELLS - usedCells;
  const fragCount = calcFragmentation(blocks);
  const usedPct = Math.round((usedCells / TOTAL_CELLS) * 100);

  function handleAllocate() {
    const size = SIZES[sizeIdx].cells;
    const result = allocate(label || "block", size);
    if (result === "ok") {
      setLastResult(null);
    } else if (result === "oom") {
      setLastResult("Out of memory — not enough total free space.");
    } else {
      setLastResult("Fragmentation — enough free cells exist but not contiguous.");
    }
    setLabel("myVar");
  }

  function handleFree(id: string) {
    free(id);
    setLastResult(null);
  }

  function handleLeakDemo() {
    reset();
    setTimeout(() => allocate("data1", 4), 50);
    setTimeout(() => allocate("temp", 2), 100);
    setTimeout(() => allocate("data2", 4), 150);
    setTimeout(() => {
      // Free only the middle one — creating holes
      const { blocks } = useHeapStore.getState();
      const temp = blocks.find(b => b.label === "temp");
      if (temp) free(temp.id);
      allocate("bigObj", 4);
      // now try to allocate something that won't fit in the holes
    }, 200);
    setLastResult("Leaked data1 and data2. Freed 'temp' — now fragmented. Try allocating XL.");
  }

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Heap Memory Simulator</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {TOTAL_CELLS} cells · allocate, free, observe fragmentation
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        {/* Memory grid */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Memory map — click a block to free it
            </p>
          </div>
          <MemoryGrid cellMap={cellMap} blocks={blocks} onFree={handleFree} />

          {/* Stats bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Used: {usedCells}/{TOTAL_CELLS} cells ({usedPct}%)</span>
              <span>Free: {freeCells} cells</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-colors ${usedPct > 80 ? "bg-rose-500" : "bg-indigo-500"}`}
                animate={{ width: `${usedPct}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </div>
            {fragCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertTriangle size={11} />
                {fragCount} fragmented hole{fragCount > 1 ? "s" : ""} — contiguous allocations may fail
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:w-56 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-[#0d0d0d] p-5 flex flex-col gap-5">

          {/* Allocate controls */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Allocate
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Variable name"
                maxLength={8}
                className="w-full bg-muted border border-border rounded px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <select
                value={sizeIdx}
                onChange={(e) => setSizeIdx(Number(e.target.value))}
                className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                {SIZES.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={handleAllocate}
                disabled={freeCells === 0}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded py-1.5 transition-colors"
              >
                <Plus size={12} /> Allocate
              </button>
            </div>
          </div>

          {/* Error/status */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] text-amber-400 border border-amber-400/20 bg-amber-400/5 rounded p-2 leading-4"
              >
                {lastResult}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live blocks list */}
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Allocations ({liveBlocks.length})
            </p>
            <div className="space-y-1.5 overflow-y-auto max-h-36">
              <AnimatePresence>
                {liveBlocks.map((block) => {
                  const colorIdx = BLOCK_COLORS.findIndex(c => c.bg === block.colorClass);
                  const color = BLOCK_COLORS[colorIdx >= 0 ? colorIdx : 0];
                  return (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`flex items-center justify-between rounded px-2 py-1.5 border ${color.border} ${color.light}`}
                    >
                      <div>
                        <span className={`text-xs font-mono font-medium ${color.text}`}>{block.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">{block.size}c</span>
                      </div>
                      <button
                        onClick={() => handleFree(block.id)}
                        className="text-muted-foreground hover:text-rose-400 transition-colors p-0.5"
                        title="Free this block"
                      >
                        <Trash2 size={11} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {liveBlocks.length === 0 && (
                <p className="text-[11px] text-muted-foreground">No active allocations</p>
              )}
            </div>
          </div>

          {/* Fragmentation demo */}
          <button
            onClick={handleLeakDemo}
            className="w-full text-xs text-amber-400 border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10 rounded py-1.5 transition-colors"
          >
            Demo: fragmentation
          </button>
        </div>
      </div>
    </div>
  );
}
