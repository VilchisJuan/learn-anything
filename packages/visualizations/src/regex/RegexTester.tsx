"use client";

import { useState, useMemo } from "react";

interface Match {
  start: number;
  end: number;
  value: string;
  index: number;
}

function buildHighlightedSegments(text: string, matches: Match[]) {
  const segments: { text: string; isMatch: boolean; matchIndex?: number }[] = [];
  let cursor = 0;

  for (const m of matches) {
    if (m.start > cursor) {
      segments.push({ text: text.slice(cursor, m.start), isMatch: false });
    }
    segments.push({ text: text.slice(m.start, m.end), isMatch: true, matchIndex: m.index });
    cursor = m.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isMatch: false });
  }
  return segments;
}

const MATCH_COLORS = [
  "bg-yellow-400/30 border-yellow-400/60",
  "bg-blue-400/30 border-blue-400/60",
  "bg-green-400/30 border-green-400/60",
  "bg-pink-400/30 border-pink-400/60",
];

export function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+ing\\b");
  const [testString, setTestString] = useState(
    "The running dog is chasing a flying bird while swimming in the lake."
  );
  const [flagG, setFlagG] = useState(true);
  const [flagI, setFlagI] = useState(false);
  const [flagM, setFlagM] = useState(false);

  const { matches, error, regex } = useMemo(() => {
    if (!pattern) return { matches: [], error: null, regex: null };
    const flags = [flagG ? "g" : "", flagI ? "i" : "", flagM ? "m" : ""].join("");
    try {
      const rx = new RegExp(pattern, flags);
      const found: Match[] = [];
      if (flagG) {
        let m: RegExpExecArray | null;
        let safety = 0;
        rx.lastIndex = 0;
        while ((m = rx.exec(testString)) !== null && safety++ < 500) {
          found.push({ start: m.index, end: m.index + m[0].length, value: m[0], index: found.length });
          if (m[0].length === 0) rx.lastIndex++;
        }
      } else {
        const m = rx.exec(testString);
        if (m) found.push({ start: m.index, end: m.index + m[0].length, value: m[0], index: 0 });
      }
      return { matches: found, error: null, regex: rx };
    } catch (e) {
      return { matches: [], error: (e as Error).message, regex: null };
    }
  }, [pattern, testString, flagG, flagI, flagM]);

  const segments = useMemo(
    () => buildHighlightedSegments(testString, matches),
    [testString, matches]
  );

  return (
    <div className="my-6 border border-border rounded-xl overflow-hidden bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-border flex items-center gap-2">
        <span className="text-xs font-mono text-zinc-400 tracking-wider">REGEX TESTER</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {matches.length > 0 ? (
            <span className="text-green-400">{matches.length} match{matches.length !== 1 ? "es" : ""}</span>
          ) : pattern && !error ? (
            <span className="text-zinc-500">no matches</span>
          ) : null}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Pattern input */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Pattern</label>
          <div className="flex items-center gap-0">
            <span className="px-3 py-2 bg-zinc-800 border border-r-0 border-border rounded-l-lg text-muted-foreground font-mono text-sm">/</span>
            <input
              className={`flex-1 bg-zinc-900 border border-x-0 border-border px-3 py-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 ${error ? "border-red-500/60" : ""}`}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="enter pattern…"
              spellCheck={false}
            />
            <span className="px-3 py-2 bg-zinc-800 border border-l-0 border-border rounded-r-lg text-muted-foreground font-mono text-sm">
              /{[flagG ? "g" : "", flagI ? "i" : "", flagM ? "m" : ""].join("")}
            </span>
          </div>
          {error && (
            <p className="mt-1 text-xs text-red-400 font-mono">{error}</p>
          )}
        </div>

        {/* Flags */}
        <div className="flex gap-4">
          {([
            { key: "g", label: "global", value: flagG, set: setFlagG },
            { key: "i", label: "ignore case", value: flagI, set: setFlagI },
            { key: "m", label: "multiline", value: flagM, set: setFlagM },
          ] as const).map(({ key, label, value, set }) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => set(e.target.checked)}
                className="accent-primary"
              />
              <code className="text-xs text-primary">{key}</code>
              <span className="text-xs text-muted-foreground">{label}</span>
            </label>
          ))}
        </div>

        {/* Test string */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Test String</label>
          <textarea
            className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            rows={3}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Highlighted result */}
        {!error && pattern && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Matches</label>
            <div className="bg-zinc-900 border border-border rounded-lg px-3 py-2 font-mono text-sm leading-7 break-all whitespace-pre-wrap">
              {segments.length === 0 ? (
                <span className="text-zinc-600">—</span>
              ) : (
                segments.map((seg, i) =>
                  seg.isMatch ? (
                    <mark
                      key={i}
                      className={`${MATCH_COLORS[(seg.matchIndex ?? 0) % MATCH_COLORS.length]} border rounded px-0.5 text-foreground not-italic`}
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i} className="text-foreground/70">{seg.text}</span>
                  )
                )
              )}
            </div>
          </div>
        )}

        {/* Match list */}
        {matches.length > 0 && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Match List</label>
            <div className="flex flex-wrap gap-2">
              {matches.map((m) => (
                <span
                  key={m.index}
                  className="inline-flex items-center gap-1 bg-zinc-800 border border-border rounded px-2 py-0.5 text-xs font-mono"
                >
                  <span className="text-zinc-500">#{m.index + 1}</span>
                  <span className="text-primary">{JSON.stringify(m.value)}</span>
                  <span className="text-zinc-600">[{m.start}–{m.end}]</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
