"use client";

import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  "text-indigo-400", "text-violet-400", "text-blue-400",
  "text-cyan-400",   "text-teal-400",
];

const main = (result: string): StackFrame => ({
  id: "main", functionName: "main()",
  locals: [{ name: "result", value: result }], color: COLORS[0],
});

const fact = (n: number, returns?: string): StackFrame => ({
  id: `fact-${n}`, functionName: "factorial(n)",
  locals: [{ name: "n", value: String(n) }],
  returnValue: returns,
  color: COLORS[(5 - n) % COLORS.length],
});

const SCENARIO: ScenarioStep[] = [
  { event: "start", description: "The program begins. main() is the first function — its stack frame is created automatically.", frames: [main("?")] },
  { event: "push",  description: "main() calls factorial(4). A new stack frame is pushed on top, holding n=4 as a local variable.", frames: [main("?"), fact(4)] },
  { event: "push",  description: "factorial(4) calls factorial(3) recursively. Another frame is pushed — each call is independent.", frames: [main("?"), fact(4), fact(3)] },
  { event: "push",  description: "factorial(3) calls factorial(2). The stack keeps growing with each recursive call.", frames: [main("?"), fact(4), fact(3), fact(2)] },
  { event: "push",  description: "factorial(2) calls factorial(1). This is the base case — the deepest point in the recursion.", frames: [main("?"), fact(4), fact(3), fact(2), fact(1)] },
  { event: "pop",   description: "factorial(1) hits the base case (n=1) and returns 1. Its frame is popped — memory is instantly freed.", frames: [main("?"), fact(4), fact(3), fact(2, "→ 2×1 = 2")] },
  { event: "pop",   description: "factorial(2) receives the result, computes 2×1=2, and returns. Its frame is also popped.", frames: [main("?"), fact(4), fact(3, "→ 3×2 = 6")] },
  { event: "pop",   description: "factorial(3) returns 3×2=6. The stack is unwinding — each pop is free and instantaneous.", frames: [main("?"), fact(4, "→ 4×6 = 24")] },
  { event: "pop",   description: "factorial(4) returns 4×6=24. Only main() remains on the stack.", frames: [main("24")] },
  { event: "end",   description: "main() stores the result (24) and returns. The stack frame is popped and the program exits cleanly.", frames: [] },
];

// ─── Code Examples ────────────────────────────────────────────────────────────

type Lang = "c" | "python" | "go";

const LANG_LABELS: Record<Lang, string> = { c: "C", python: "Python", go: "Go" };

const CODE: Record<Lang, string[]> = {
  c: [
    "int factorial(int n) {",
    "  if (n <= 1) return 1;",
    "  return n * factorial(n - 1);",
    "}",
    "",
    "int main() {",
    "  int result = factorial(4);",
    "  return 0;",
    "}",
  ],
  python: [
    "def factorial(n):",
    "    if n <= 1:",
    "        return 1",
    "    return n * factorial(n - 1)",
    "",
    "result = factorial(4)",
  ],
  go: [
    "func factorial(n int) int {",
    "    if n <= 1 {",
    "        return 1",
    "    }",
    "    return n * factorial(n-1)",
    "}",
    "",
    "func main() {",
    "    result := factorial(4)",
    "    _ = result",
    "}",
  ],
};

// 1-indexed line to highlight for each scenario step (0–9)
const STEP_LINES: Record<Lang, number[]> = {
  c:      [7, 7, 3, 3, 3, 2, 3, 3, 3, 7],
  python: [6, 6, 4, 4, 4, 3, 4, 4, 4, 6],
  go:     [9, 9, 5, 5, 5, 3, 5, 5, 5, 9],
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
      if (KW[lang].has(word))          type = "keyword";
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
  step: 0, isPlaying: false, speed: 1800,
  next:       () => set((s) => ({ step: Math.min(s.step + 1, SCENARIO.length - 1) })),
  prev:       () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  setPlaying: (isPlaying) => {
    if (isPlaying && get().step >= SCENARIO.length - 1) set({ step: 0, isPlaying: true });
    else set({ isPlaying });
  },
  setSpeed: (speed) => set({ speed }),
  reset:    () => set({ step: 0, isPlaying: false }),
}));

// ─── Component ────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 6;

export function StackVisualizer() {
  const { step, isPlaying, speed, next, prev, setPlaying, setSpeed, reset } = useStackStore();
  const [lang, setLang] = useState<Lang>("c");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = SCENARIO[step];
  const frames  = current.frames;
  const atEnd   = step === SCENARIO.length - 1;
  const atStart = step === 0;
  const danger  = frames.length >= MAX_VISIBLE - 1;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const { step, next, setPlaying } = useStackStore.getState();
        if (step >= SCENARIO.length - 1) setPlaying(false); else next();
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Call Stack Simulator</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Factorial(4) — step through recursion</p>
        </div>
        {danger && (
          <span className="text-xs text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded-full">
            Stack growing deep
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row min-h-[320px] md:min-h-[420px]">
        {/* Stack visual */}
        <div className="flex-1 flex flex-col justify-end px-4 md:px-6 py-6 relative">
          <div className="absolute right-2 top-6 bottom-6 w-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`absolute bottom-0 left-0 right-0 rounded-full transition-colors duration-300 ${danger ? "bg-amber-500" : "bg-indigo-500"}`}
              animate={{ height: `${(frames.length / MAX_VISIBLE) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>

          {frames.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Stack is empty — program exited
            </motion.div>
          )}

          <div className="flex flex-col-reverse gap-1.5 max-w-sm w-full mx-auto">
            <AnimatePresence mode="popLayout">
              {frames.map((frame, i) => {
                const isTop      = i === frames.length - 1;
                const labelColor = LABEL_COLORS[i % LABEL_COLORS.length];
                return (
                  <motion.div
                    key={frame.id}
                    layout
                    initial={{ opacity: 0, y: -24, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0,   scale: 1    }}
                    exit={{    opacity: 0, y: -24,  scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className={`relative rounded-lg border px-4 py-3 ${frame.color}`}
                  >
                    {isTop && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-5 left-3 flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
                        <ChevronDown size={10} /> SP (stack pointer)
                      </motion.div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-sm font-mono font-semibold ${labelColor}`}>{frame.functionName}</span>
                      <div className="flex items-center gap-3">
                        {frame.locals.map((l) => (
                          <span key={l.name} className="text-xs font-mono text-muted-foreground">
                            <span className="text-foreground/60">{l.name}</span>
                            <span className="text-foreground/40 mx-0.5">=</span>
                            <span className="text-foreground">{l.value}</span>
                          </span>
                        ))}
                        {frame.returnValue && (
                          <span className="text-xs font-mono text-emerald-400">{frame.returnValue}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {frames.length > 0 && (
            <div className="max-w-sm w-full mx-auto mt-1.5">
              <div className="border-t-2 border-border/60 pt-1.5 text-[10px] text-muted-foreground text-center tracking-wider uppercase">
                Stack base (low memory address)
              </div>
            </div>
          )}
        </div>

        {/* Right panel — language tabs + code + description */}
        <div className="w-full md:w-80 md:shrink-0 border-t md:border-t-0 md:border-l border-border bg-[#0a0a0a] flex flex-col">

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
          <div className="border-b border-border md:overflow-y-auto md:max-h-56">
            <CodePanel lang={lang} step={step} />
          </div>

          {/* Description + event + depth chart */}
          <div className="p-5 flex flex-col gap-4 md:flex-1 md:overflow-y-auto">
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

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Event</p>
              <AnimatePresence mode="wait">
                <motion.span
                  key={current.event}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                    current.event === "push" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                    : current.event === "pop" ? "text-rose-400 border-rose-400/30 bg-rose-400/10"
                    : "text-muted-foreground border-border bg-muted"
                  }`}
                >
                  {current.event}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="md:mt-auto">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Stack depth</p>
              <div className="flex items-end gap-0.5 h-8">
                {SCENARIO.map((s, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-300 ${i <= step ? "bg-indigo-500" : "bg-muted"}`}
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
          <input type="range" min={600} max={3000} step={200} value={3600 - speed} onChange={(e) => setSpeed(3600 - Number(e.target.value))} className="flex-1 accent-indigo-500 h-1" />
        </div>
      </div>
    </div>
  );
}
