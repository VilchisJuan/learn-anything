"use client";

import { useState } from "react";

interface Token {
  pattern: string;
  name: string;
  description: string;
  example: string;
  matches: string;
  category: string;
}

const TOKENS: Token[] = [
  // Metacharacters
  { category: "Metacharacters", pattern: ".", name: "Any character", description: "Matches any single character except newline", example: "c.t", matches: "cat, cut, c3t" },
  { category: "Metacharacters", pattern: "\\d", name: "Digit", description: "Matches any digit [0-9]", example: "\\d+", matches: "42, 0, 100" },
  { category: "Metacharacters", pattern: "\\D", name: "Non-digit", description: "Matches any non-digit character", example: "\\D+", matches: "hello, abc, !" },
  { category: "Metacharacters", pattern: "\\w", name: "Word character", description: "Matches [a-zA-Z0-9_]", example: "\\w+", matches: "hello, foo_bar, ABC" },
  { category: "Metacharacters", pattern: "\\W", name: "Non-word", description: "Matches any non-word character", example: "\\W+", matches: "!, @#, spaces" },
  { category: "Metacharacters", pattern: "\\s", name: "Whitespace", description: "Matches space, tab, newline, etc.", example: "hello\\sworld", matches: '"hello world"' },
  { category: "Metacharacters", pattern: "\\S", name: "Non-whitespace", description: "Matches any non-whitespace character", example: "\\S+", matches: "any_word, 123" },
  // Character classes
  { category: "Character Classes", pattern: "[abc]", name: "Character set", description: "Matches any character in the set", example: "[aeiou]", matches: "a, e, i, o, u" },
  { category: "Character Classes", pattern: "[^abc]", name: "Negated set", description: "Matches any character NOT in the set", example: "[^aeiou]", matches: "consonants, digits" },
  { category: "Character Classes", pattern: "[a-z]", name: "Range", description: "Matches any character in range", example: "[a-z]+", matches: "lowercase letters" },
  { category: "Character Classes", pattern: "[A-Z]", name: "Uppercase range", description: "Matches uppercase letters", example: "[A-Z]\\w*", matches: "Words, Names" },
  { category: "Character Classes", pattern: "[0-9]", name: "Digit range", description: "Equivalent to \\d", example: "[0-9]{3}", matches: "123, 456, 007" },
  // Quantifiers
  { category: "Quantifiers", pattern: "*", name: "Zero or more", description: "Matches 0 or more of the preceding element (greedy)", example: "ab*", matches: "a, ab, abb, abbb" },
  { category: "Quantifiers", pattern: "+", name: "One or more", description: "Matches 1 or more of the preceding element (greedy)", example: "ab+", matches: "ab, abb, abbb" },
  { category: "Quantifiers", pattern: "?", name: "Zero or one", description: "Makes the preceding element optional", example: "colou?r", matches: "color, colour" },
  { category: "Quantifiers", pattern: "{n}", name: "Exactly n", description: "Matches exactly n occurrences", example: "\\d{4}", matches: "1234, 2024" },
  { category: "Quantifiers", pattern: "{n,m}", name: "Between n and m", description: "Matches between n and m occurrences (greedy)", example: "\\d{2,4}", matches: "12, 123, 1234" },
  { category: "Quantifiers", pattern: "*?", name: "Lazy zero or more", description: "Matches as few characters as possible", example: "<.*?>", matches: "each <tag> separately" },
  { category: "Quantifiers", pattern: "+?", name: "Lazy one or more", description: "Matches as few characters as possible (≥1)", example: "\\d+?", matches: "first digit only" },
  // Anchors
  { category: "Anchors", pattern: "^", name: "Start of string", description: "Asserts position at start of string/line", example: "^Hello", matches: '"Hello world" (start only)' },
  { category: "Anchors", pattern: "$", name: "End of string", description: "Asserts position at end of string/line", example: "world$", matches: '"hello world" (end only)' },
  { category: "Anchors", pattern: "\\b", name: "Word boundary", description: "Position between word and non-word character", example: "\\bcat\\b", matches: '"cat" but not "concatenate"' },
  { category: "Anchors", pattern: "\\B", name: "Non-word boundary", description: "Position not at a word boundary", example: "\\Bcat\\B", matches: '"concatenate" middle' },
  // Groups
  { category: "Groups", pattern: "(abc)", name: "Capturing group", description: "Groups and captures matched text", example: "(\\d+)-(\\d+)", matches: "captures each number separately" },
  { category: "Groups", pattern: "(?:abc)", name: "Non-capturing group", description: "Groups without capturing", example: "(?:ab)+", matches: "ab, abab, ababab" },
  { category: "Groups", pattern: "(?<name>)", name: "Named group", description: "Capturing group with a name", example: "(?<year>\\d{4})", matches: "captures year by name" },
  { category: "Groups", pattern: "\\1", name: "Backreference", description: "Refers to the first captured group", example: "(.)\\1", matches: "aa, bb, 11 (repeated chars)" },
  { category: "Groups", pattern: "a|b", name: "Alternation", description: "Matches either a or b", example: "cat|dog", matches: "cat, dog" },
  // Lookaheads
  { category: "Lookaheads & Lookbehinds", pattern: "(?=abc)", name: "Positive lookahead", description: "Matches if followed by abc (not consumed)", example: "\\d+(?= dollars)", matches: '"42" in "42 dollars"' },
  { category: "Lookaheads & Lookbehinds", pattern: "(?!abc)", name: "Negative lookahead", description: "Matches if NOT followed by abc", example: "\\d+(?! dollars)", matches: '"42" in "42 euros"' },
  { category: "Lookaheads & Lookbehinds", pattern: "(?<=abc)", name: "Positive lookbehind", description: "Matches if preceded by abc (not consumed)", example: "(?<=\\$)\\d+", matches: '"42" in "$42"' },
  { category: "Lookaheads & Lookbehinds", pattern: "(?<!abc)", name: "Negative lookbehind", description: "Matches if NOT preceded by abc", example: "(?<!\\$)\\d+", matches: '"42" in "42 USD" only' },
];

const CATEGORIES = [...new Set(TOKENS.map((t) => t.category))];

const CATEGORY_COLORS: Record<string, string> = {
  "Metacharacters": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "Character Classes": "text-green-400 border-green-400/30 bg-green-400/10",
  "Quantifiers": "text-amber-400 border-amber-400/30 bg-amber-400/10",
  "Anchors": "text-purple-400 border-purple-400/30 bg-purple-400/10",
  "Groups": "text-pink-400 border-pink-400/30 bg-pink-400/10",
  "Lookaheads & Lookbehinds": "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
};

export function RegexCheatSheet() {
  const [activeCategory, setActiveCategory] = useState<string>("Metacharacters");
  const [selected, setSelected] = useState<Token | null>(null);

  const filtered = TOKENS.filter((t) => t.category === activeCategory);

  return (
    <div className="my-6 border border-border rounded-xl overflow-hidden bg-zinc-950">
      <div className="px-4 py-3 bg-zinc-900 border-b border-border">
        <span className="text-xs font-mono text-zinc-400 tracking-wider">REGEX CHEAT SHEET</span>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSelected(null); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === cat
                ? CATEGORY_COLORS[cat]
                : "text-muted-foreground border-border hover:border-border/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex min-h-[280px]">
        {/* Token grid */}
        <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 content-start">
          {filtered.map((token) => (
            <button
              key={token.pattern}
              onClick={() => setSelected(selected?.pattern === token.pattern ? null : token)}
              className={`text-left p-3 rounded-lg border transition-all ${
                selected?.pattern === token.pattern
                  ? "border-primary/60 bg-primary/10"
                  : "border-border hover:border-border/80 hover:bg-zinc-900"
              }`}
            >
              <code className="text-sm font-mono text-primary block mb-1">{token.pattern}</code>
              <span className="text-xs text-muted-foreground">{token.name}</span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-64 border-l border-border p-4 space-y-3 shrink-0">
            <div>
              <code className="text-xl font-mono text-primary">{selected.pattern}</code>
              <p className="text-sm font-medium text-foreground mt-1">{selected.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{selected.description}</p>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Example</p>
              <code className="block text-sm font-mono bg-zinc-900 border border-border rounded px-2 py-1 text-primary">
                /{selected.example}/
              </code>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Matches</p>
              <p className="text-sm text-foreground/80">{selected.matches}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
