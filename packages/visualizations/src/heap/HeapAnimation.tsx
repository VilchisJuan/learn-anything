"use client";

import { useEffect, useRef, useState } from "react";
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
  concept: string;
  event: "alloc" | "free" | "fail" | "info";
  blocks: AnimBlock[];
}

// ─── Scenario ─────────────────────────────────────────────────────────────────

const SCENARIO: AnimStep[] = [
  {
    event: "info", concept: "Dynamic Allocation · Heap Start",
    description: "The heap starts completely empty. Every cell is free and available for allocation.",
    blocks: [],
  },
  {
    event: "alloc", concept: "malloc() · Sequential Placement",
    description: "malloc(4) — allocate a 4-cell integer array. The allocator searches for the first free run of 4 cells and places it at the lowest available address.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
    ],
  },
  {
    event: "alloc", concept: "malloc() · Sequential Placement",
    description: "malloc(2) — a linked list node needs 2 cells. The allocator places it immediately after arr. Data persists beyond any function's scope — this is why the heap exists.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0, size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4, size: 2, freed: false, colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
    ],
  },
  {
    event: "alloc", concept: "malloc() · Large Allocation",
    description: "malloc(6) — a 6-cell text buffer allocated next. The heap can grow to fill all available RAM — unlike the stack's fixed 1–8 MB limit.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: false, colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: false, colorClass: "bg-blue-500/25 border-blue-500/60",    freeBgClass: "bg-blue-500/10 border-blue-500/20" },
    ],
  },
  {
    event: "alloc", concept: "malloc() · Multiple Live Allocations",
    description: "malloc(4) — a fourth block for a matrix row. Multiple heap allocations coexist independently — unlike the stack where only the top frame is active.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: false, colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: false, colorClass: "bg-blue-500/25 border-blue-500/60",    freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",    freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "free", concept: "free() · Memory Leak Prevention",
    description: "free(node) — node is no longer needed. Calling free() returns the 2 cells to the allocator. Forgetting this call would be a memory leak — those 2 cells would be lost forever.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: true,  colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: false, colorClass: "bg-blue-500/25 border-blue-500/60",    freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",    freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "free", concept: "free() · Fragmentation Begins",
    description: "free(buf) — buf is freed too. Now cells 4–11 are free but split across two non-adjacent holes. This is how external fragmentation forms.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "node", label: "node", startCell: 4,  size: 2, freed: true,  colorClass: "bg-violet-500/25 border-violet-500/60", freeBgClass: "bg-violet-500/10 border-violet-500/20" },
      { id: "buf",  label: "buf",  startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",    freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",    freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "alloc", concept: "Allocator · Reuses Freed Block",
    description: "malloc(2) — a small allocation fits perfectly into the first freed hole at cell 4. The allocator reuses freed space. GC languages do this automatically.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "ptr",  label: "ptr",  startCell: 4,  size: 2, freed: false, colorClass: "bg-teal-500/25 border-teal-500/60",     freeBgClass: "bg-teal-500/10 border-teal-500/20" },
      { id: "buf",  label: "hole", startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",    freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",    freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "fail", concept: "External Fragmentation · Allocation Fails",
    description: "malloc(10) — 10 contiguous cells needed. Total free = 6+8 = 14 cells, but no single contiguous run of 10 exists. ALLOCATION FAILS despite having enough total free memory.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "ptr",  label: "ptr",  startCell: 4,  size: 2, freed: false, colorClass: "bg-teal-500/25 border-teal-500/60",     freeBgClass: "bg-teal-500/10 border-teal-500/20" },
      { id: "buf",  label: "hole", startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",    freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",    freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
  {
    event: "info", concept: "External Fragmentation · GC Compaction",
    description: "This is external fragmentation. Modern GCs (Java, Go, .NET) use compaction to move live objects together, eliminating holes. Manual allocators use slab allocation and memory pools instead.",
    blocks: [
      { id: "arr",  label: "arr",  startCell: 0,  size: 4, freed: false, colorClass: "bg-indigo-500/25 border-indigo-500/60", freeBgClass: "bg-indigo-500/10 border-indigo-500/20" },
      { id: "ptr",  label: "ptr",  startCell: 4,  size: 2, freed: false, colorClass: "bg-teal-500/25 border-teal-500/60",     freeBgClass: "bg-teal-500/10 border-teal-500/20" },
      { id: "buf",  label: "hole", startCell: 6,  size: 6, freed: true,  colorClass: "bg-blue-500/25 border-blue-500/60",    freeBgClass: "bg-blue-500/10 border-blue-500/20" },
      { id: "row",  label: "row",  startCell: 12, size: 4, freed: false, colorClass: "bg-cyan-500/25 border-cyan-500/60",    freeBgClass: "bg-cyan-500/10 border-cyan-500/20" },
    ],
  },
];

const TOTAL_CELLS = 24;
const COLS = 8;

// ─── Code Examples ────────────────────────────────────────────────────────────

type Lang = "c" | "python" | "go";

const LANG_LABELS: Record<Lang, string> = { c: "C", python: "Python", go: "Go" };

const CODE: Record<Lang, string[]> = {
  c: [
    "#include <stdlib.h>",
    "",
    "int main() {",
    "  int  *arr  = malloc(4 * sizeof(int));",
    "  Node *node = malloc(sizeof(Node));",
    "  char *buf  = malloc(6 * sizeof(char));",
    "  int  *row  = malloc(4 * sizeof(int));",
    "",
    "  free(node);",
    "  free(buf);",
    "",
    "  int *ptr = malloc(2 * sizeof(int));",
    "  int *big = malloc(10); // NULL!",
    "",
    "  return 0;",
    "}",
  ],
  python: [
    "# Python uses garbage collection",
    "# No manual malloc/free needed",
    "",
    "arr  = [0] * 4       # heap alloc",
    "node = {'value': 0}  # heap alloc",
    "buf  = bytearray(6)  # heap alloc",
    "row  = [0] * 4       # heap alloc",
    "",
    "node = None  # GC eligible",
    "buf  = None  # GC eligible",
    "",
    "ptr = [0] * 2   # reuse freed mem",
    "big = [0] * 10  # always works!",
    "# GC prevents fragmentation",
  ],
  go: [
    "package main",
    "",
    "func main() {",
    "  arr  := make([]int32, 4) // alloc",
    "  node := &Node{}           // alloc",
    "  buf  := make([]byte, 6)  // alloc",
    "  row  := make([]int32, 4) // alloc",
    "",
    "  node = nil // GC collects",
    "  buf  = nil // GC collects",
    "",
    "  ptr := make([]int32, 2)  // alloc",
    "  big := make([]int32, 10) // ok!",
    "  // GC prevents fragmentation",
    "  _ = arr; _ = row; _ = ptr; _ = big",
    "}",
  ],
};

// 1-indexed line to highlight for each scenario step (0–9)
const STEP_LINES: Record<Lang, number[]> = {
  c:      [3,  4,  5,  6,  7,  9,  10, 12, 13, 15],
  python: [1,  4,  5,  6,  7,  9,  10, 12, 13, 14],
  go:     [3,  4,  5,  6,  7,  9,  10, 12, 13, 14],
};

// ─── Syntax Highlighting ──────────────────────────────────────────────────────

type TokType = "comment" | "string" | "keyword" | "type" | "builtin" | "number" | "fn" | "op" | "punct" | "preproc" | "plain";

const TK: Record<TokType, string> = {
  comment: "text-zinc-500 italic",
  string:  "text-amber-300",
  keyword: "text-rose-400",
  type:    "text-cyan-400",
  builtin: "text-yellow-300",
  number:  "text-emerald-400",
  fn:      "text-sky-300",
  op:      "text-slate-400",
  punct:   "text-slate-500",
  preproc: "text-fuchsia-400",
  plain:   "text-slate-200",
};

const KW: Record<Lang, Set<string>> = {
  c:      new Set(["if","else","return","while","for","do","break","continue","switch","case","default","sizeof","typedef","struct","union","enum","static","extern","const","volatile","inline","auto","NULL","true","false"]),
  python: new Set(["def","class","if","elif","else","while","for","in","not","and","or","return","import","from","as","with","try","except","finally","raise","pass","break","continue","del","global","nonlocal","lambda","yield","assert","is","None","True","False"]),
  go:     new Set(["func","return","if","else","for","range","var","const","type","struct","interface","package","import","nil","true","false","make","new","append","len","cap","delete","copy","defer","go","chan","select","case","default","break","continue","map","any"]),
};

const TYPES: Record<Lang, Set<string>> = {
  c:      new Set(["int","char","void","float","double","long","short","unsigned","signed","bool","size_t","uint8_t","uint32_t","int32_t","int64_t","FILE"]),
  python: new Set(["str","int","float","bool","list","dict","set","tuple","bytes","bytearray","object"]),
  go:     new Set(["int","int8","int16","int32","int64","uint","uint8","uint16","uint32","uint64","float32","float64","bool","string","byte","rune","error"]),
};

const BUILTINS: Record<Lang, Set<string>> = {
  c:      new Set(["malloc","free","realloc","calloc","printf","scanf","memset","memcpy","strlen","exit","abort"]),
  python: new Set(["print","len","range","type","isinstance","enumerate","zip","map","filter","sorted","min","max","sum","abs","round","open","input","repr"]),
  go:     new Set(["fmt","os","io","sync","strings","strconv","errors","log","math","sort"]),
};

interface Tok { type: TokType; text: string; }

function tokenize(line: string, lang: Lang): Tok[] {
  const toks: Tok[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    // C preprocessor
    if (lang === "c" && ch === "#") {
      let j = i + 1;
      while (j < line.length && /\w/.test(line[j])) j++;
      toks.push({ type: "preproc", text: line.slice(i, j) });
      i = j;
      while (i < line.length && line[i] === " ") { toks.push({ type: "plain", text: " " }); i++; }
      if (i < line.length) { toks.push({ type: "string", text: line.slice(i) }); break; }
      continue;
    }

    // Comment
    const cmt = lang === "python" ? "#" : "//";
    if (line.startsWith(cmt, i)) { toks.push({ type: "comment", text: line.slice(i) }); break; }

    // String literal
    if (ch === '"' || (ch === "'" && lang !== "c")) {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) { if (line[j] === "\\") j++; j++; }
      toks.push({ type: "string", text: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Number
    if (/\d/.test(ch) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d.xXa-fA-F_]/.test(line[j])) j++;
      toks.push({ type: "number", text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier → classify
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let k = j;
      while (k < line.length && line[k] === " ") k++;
      const isCall = line[k] === "(";
      let type: TokType = "plain";
      if (KW[lang].has(word))           type = "keyword";
      else if (TYPES[lang].has(word))   type = "type";
      else if (BUILTINS[lang].has(word)) type = "builtin";
      else if (isCall)                  type = "fn";
      toks.push({ type, text: word });
      i = j;
      continue;
    }

    // Operator
    if (/[=+\-*/<>!&|^%~:]/.test(ch)) {
      let j = i;
      while (j < line.length && /[=+\-*/<>!&|^%~:]/.test(line[j])) j++;
      toks.push({ type: "op", text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Punctuation
    if (/[{}()\[\];,.]/.test(ch)) { toks.push({ type: "punct", text: ch }); i++; continue; }

    // Space / other
    toks.push({ type: "plain", text: ch });
    i++;
  }

  return toks;
}

function HighlightedLine({ line, lang }: { line: string; lang: Lang }) {
  const toks = tokenize(line, lang);
  if (toks.length === 0) return <span>&nbsp;</span>;
  return (
    <>
      {toks.map((t, idx) => (
        <span key={idx} className={TK[t.type]}>{t.text}</span>
      ))}
    </>
  );
}

function CodePanel({ lang, step }: { lang: Lang; step: number }) {
  const lines  = CODE[lang];
  const active = STEP_LINES[lang][step];
  return (
    <div className="p-3">
      {lines.map((line, i) => {
        const num      = i + 1;
        const isActive = num === active;
        return (
          <div
            key={i}
            className={`flex items-start rounded-sm transition-colors duration-200 ${isActive ? "bg-indigo-500/20" : ""}`}
          >
            <span className={`w-6 text-right pr-2 shrink-0 select-none text-[10px] leading-5 font-mono ${isActive ? "text-indigo-400" : "text-zinc-600"}`}>
              {num}
            </span>
            <span className={`font-mono text-[11px] leading-5 whitespace-pre flex-1 ${isActive ? "border-l-2 border-indigo-400 pl-1.5" : "pl-2"}`}>
              <HighlightedLine line={line} lang={lang} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
  step: 0, isPlaying: false, speed: 2000,
  next:       () => set((s) => ({ step: Math.min(s.step + 1, SCENARIO.length - 1) })),
  prev:       () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  setPlaying: (isPlaying) => {
    if (isPlaying && get().step >= SCENARIO.length - 1) set({ step: 0, isPlaying: true });
    else set({ isPlaying });
  },
  setSpeed: (speed) => set({ speed }),
  reset:    () => set({ step: 0, isPlaying: false }),
}));

// ─── Build cell map ───────────────────────────────────────────────────────────

function buildCellMap(blocks: AnimBlock[]): (AnimBlock | null)[] {
  const map: (AnimBlock | null)[] = Array(TOTAL_CELLS).fill(null);
  for (const b of blocks) {
    for (let i = b.startCell; i < b.startCell + b.size; i++) map[i] = b;
  }
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EVENT_STYLE = {
  alloc: { label: "malloc()", className: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  free:  { label: "free()",   className: "text-rose-400 border-rose-400/30 bg-rose-400/10" },
  fail:  { label: "FAIL",     className: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  info:  { label: "info",     className: "text-muted-foreground border-border bg-muted" },
};

export function HeapAnimation() {
  const { step, isPlaying, speed, next, prev, setPlaying, setSpeed, reset } = useHeapAnimStore();
  const [lang, setLang] = useState<Lang>("c");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const current    = SCENARIO[step];
  const cellMap    = buildCellMap(current.blocks);
  const atEnd      = step === SCENARIO.length - 1;
  const atStart    = step === 0;
  const eventStyle = EVENT_STYLE[current.event];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const { step, next, setPlaying } = useHeapAnimStore.getState();
        if (step >= SCENARIO.length - 1) setPlaying(false); else next();
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

      <div className="flex flex-col lg:flex-row">
        {/* Memory grid */}
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {cellMap.map((block, i) => {
              const isFreeCell = block === null;
              const isFreed    = block?.freed;
              return (
                <motion.div
                  key={i}
                  layout
                  animate={{ backgroundColor: "transparent", scale: 1 }}
                  className={`h-10 rounded flex items-center justify-center border transition-all duration-300 ${
                    isFreeCell ? "bg-muted/30 border-border/20"
                    : isFreed  ? `${block!.freeBgClass} border-dashed`
                    : block!.colorClass
                  }`}
                >
                  {!isFreeCell && block!.startCell === i && !isFreed && (
                    <span className="text-[10px] font-mono text-foreground/70 truncate px-0.5">{block!.label}</span>
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

          {/* Banners */}
          <AnimatePresence>
            {current.event === "fail" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 text-xs text-amber-400 border border-amber-400/30 bg-amber-400/5 rounded-lg px-3 py-2"
              >
                <AlertTriangle size={13} />
                Allocation failed — fragmentation prevents contiguous placement
              </motion.div>
            )}
            {current.event === "info" && step === SCENARIO.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-muted-foreground border border-border bg-muted rounded-lg px-3 py-2"
              >
                <CheckCircle size={13} />
                End of animation — try the exercise below to experiment freely
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel — language tabs + code + description + dots */}
        <div className="w-full lg:w-80 lg:shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] flex flex-col">

          {/* Language tabs */}
          <div className="flex border-b border-border shrink-0">
            {(["c", "python", "go"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 text-[11px] font-mono font-medium transition-colors ${
                  lang === l
                    ? "text-foreground bg-[#111] border-b-2 border-indigo-400 -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Code with live line highlight */}
          <div className="border-b border-border md:overflow-y-auto md:max-h-64">
            <CodePanel lang={lang} step={step} />
          </div>

          {/* Description + concept + step dots */}
          <div className="p-5 flex flex-col gap-4 md:flex-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">What's happening</p>
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

            <AnimatePresence mode="wait">
              <motion.span
                key={current.concept}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center self-start px-2 py-0.5 rounded text-[10px] font-mono border text-indigo-300 border-indigo-400/20 bg-indigo-400/8"
              >
                {current.concept}
              </motion.span>
            </AnimatePresence>

            <div className="md:mt-auto flex flex-wrap gap-1">
              {SCENARIO.map((_, i) => (
                <button
                  key={i}
                  onClick={() => useHeapAnimStore.setState({ step: i })}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "bg-indigo-400 w-6" : i < step ? "bg-indigo-400/40 w-4" : "bg-muted w-4"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 border-t border-border flex flex-col gap-2 bg-[#0a0a0a]">
        {/* Row 1 — playback buttons + step counter */}
        <div className="flex items-center gap-3">
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
          <span className="ml-auto text-xs text-muted-foreground font-mono">{step + 1} / {SCENARIO.length}</span>
        </div>
        {/* Row 2 — speed slider full width */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground shrink-0">Speed</span>
          <input type="range" min={600} max={3500} step={200} value={4100 - speed} onChange={(e) => setSpeed(4100 - Number(e.target.value))} className="flex-1 accent-indigo-500 h-1" />
        </div>
      </div>
    </div>
  );
}
