"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TestCase {
  input: string;
  shouldMatch: boolean;
  description: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  instructions: string;
  testCases: TestCase[];
  hint: string;
  solution: string;
  flags?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "Match All Digits",
    description: "Write a regex that matches one or more consecutive digits.",
    instructions: "Your regex should match '123', '0', '42' but not 'abc' or '' (empty).",
    testCases: [
      { input: "123", shouldMatch: true, description: "three digits" },
      { input: "0", shouldMatch: true, description: "single digit" },
      { input: "42", shouldMatch: true, description: "two digits" },
      { input: "abc", shouldMatch: false, description: "no digits" },
      { input: "12abc", shouldMatch: true, description: "starts with digits" },
    ],
    hint: "Use \\d to match a digit and + for one or more.",
    solution: "\\d+",
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "Validate an Email Address",
    description: "Write a regex that matches simple email addresses.",
    instructions: "Match strings like user@example.com or name.last@domain.org but not plain text.",
    testCases: [
      { input: "user@example.com", shouldMatch: true, description: "simple email" },
      { input: "name.last@domain.org", shouldMatch: true, description: "dotted name" },
      { input: "test@sub.example.co", shouldMatch: true, description: "subdomain" },
      { input: "notanemail", shouldMatch: false, description: "no @ symbol" },
      { input: "@example.com", shouldMatch: false, description: "missing local part" },
      { input: "user@", shouldMatch: false, description: "missing domain" },
    ],
    hint: "Split into local part, @, domain, dot, TLD. Use [\\w.+-]+ for local part.",
    solution: "[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}",
    difficulty: "intermediate",
  },
  {
    id: 3,
    title: "Match Whole Words Only",
    description: "Match the word 'cat' as a whole word — not inside 'caterpillar' or 'concatenate'.",
    instructions: "Use word boundary anchors so 'cat' in 'the cat sat' matches but not in 'catfish'.",
    testCases: [
      { input: "the cat sat", shouldMatch: true, description: "whole word" },
      { input: "cat", shouldMatch: true, description: "standalone" },
      { input: "catfish", shouldMatch: false, description: "prefix of another word" },
      { input: "concatenate", shouldMatch: false, description: "embedded" },
      { input: "a cat nap", shouldMatch: true, description: "surrounded by spaces" },
    ],
    hint: "Wrap with \\b on each side.",
    solution: "\\bcat\\b",
    difficulty: "beginner",
  },
  {
    id: 4,
    title: "Extract HTML Tag Names",
    description: "Match the tag name inside an opening HTML tag.",
    instructions: "From '<div>' or '<p class=\"x\">' extract 'div' or 'p'. Do not match the full tag.",
    testCases: [
      { input: "<div>", shouldMatch: true, description: "simple tag" },
      { input: "<p class=\"x\">", shouldMatch: true, description: "tag with attribute" },
      { input: "<br/>", shouldMatch: true, description: "self-closing" },
      { input: "not a tag", shouldMatch: false, description: "plain text" },
      { input: "</div>", shouldMatch: false, description: "closing tag should not match" },
    ],
    hint: "Use < followed by a non-/ character, then \\w+ for the tag name.",
    solution: "<(?!/)([\\w]+)",
    difficulty: "intermediate",
  },
  {
    id: 5,
    title: "Match Repeated Words",
    description: "Find cases where the same word appears twice in a row (like 'the the').",
    instructions: "Match doubled words separated by a single space, case-insensitively.",
    testCases: [
      { input: "the the", shouldMatch: true, description: "repeated 'the'" },
      { input: "hello hello", shouldMatch: true, description: "repeated greeting" },
      { input: "the cat", shouldMatch: false, description: "different words" },
      { input: "a a", shouldMatch: true, description: "repeated single letter" },
      { input: "abc", shouldMatch: false, description: "no repetition" },
    ],
    hint: "Capture a word with (\\w+), then match \\s, then use a backreference \\1.",
    solution: "\\b(\\w+)\\s\\1\\b",
    flags: "i",
    difficulty: "intermediate",
  },
  {
    id: 6,
    title: "Match a Date (YYYY-MM-DD)",
    description: "Write a regex that matches ISO dates in the format YYYY-MM-DD.",
    instructions: "Match '2024-03-15' but not '24-3-15' or 'not-a-date'.",
    testCases: [
      { input: "2024-03-15", shouldMatch: true, description: "valid date" },
      { input: "1999-12-31", shouldMatch: true, description: "year 1999" },
      { input: "24-3-15", shouldMatch: false, description: "short year" },
      { input: "2024-3-5", shouldMatch: false, description: "no zero padding" },
      { input: "not-a-date", shouldMatch: false, description: "plain text" },
    ],
    hint: "Use \\d{4} for 4-digit year, \\d{2} for month and day, with - separators.",
    solution: "\\d{4}-\\d{2}-\\d{2}",
    difficulty: "beginner",
  },
  {
    id: 7,
    title: "Password Strength Check",
    description: "Match passwords with at least 8 characters including uppercase, lowercase, and a digit.",
    instructions: "Use lookaheads to assert each requirement without consuming characters.",
    testCases: [
      { input: "Hello123", shouldMatch: true, description: "has upper, lower, digit, 8 chars" },
      { input: "Str0ngPW", shouldMatch: true, description: "strong password" },
      { input: "alllower1", shouldMatch: false, description: "no uppercase" },
      { input: "ALLUPPER1", shouldMatch: false, description: "no lowercase" },
      { input: "NoDigits", shouldMatch: false, description: "no digit" },
      { input: "Sh0rt", shouldMatch: false, description: "too short" },
    ],
    hint: "Use (?=.*[A-Z]) (?=.*[a-z]) (?=.*\\d) lookaheads before .{8,}",
    solution: "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$",
    difficulty: "advanced",
  },
];

const DIFFICULTY_COLORS = {
  beginner: "text-green-400 bg-green-500/10 border-green-500/30",
  intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  advanced: "text-red-400 bg-red-500/10 border-red-500/30",
};

function runTest(pattern: string, flags: string, input: string): boolean {
  try {
    const rx = new RegExp(pattern, flags);
    return rx.test(input);
  } catch {
    return false;
  }
}

interface ChallengeCardProps {
  challenge: Challenge;
}

function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [userPattern, setUserPattern] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [regexError, setRegexError] = useState<string | null>(null);

  const flags = challenge.flags ?? "g";

  const results = userPattern
    ? challenge.testCases.map((tc) => {
        let matched = false;
        let error = false;
        try {
          new RegExp(userPattern, flags);
          matched = runTest(userPattern, flags, tc.input);
        } catch {
          error = true;
        }
        if (error) {
          return { ...tc, matched: false, pass: false, error: true };
        }
        return { ...tc, matched, pass: matched === tc.shouldMatch, error: false };
      })
    : null;

  const allPassed = results?.every((r) => r.pass) ?? false;
  const passCount = results?.filter((r) => r.pass).length ?? 0;

  function validate(val: string) {
    setUserPattern(val);
    if (!val) { setRegexError(null); return; }
    try { new RegExp(val, flags); setRegexError(null); } catch (e) { setRegexError((e as Error).message); }
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-zinc-950">
      <div className="px-4 py-3 bg-zinc-900 border-b border-border flex items-center gap-3">
        <span className="font-semibold text-foreground text-sm">{challenge.title}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
          {challenge.difficulty}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-foreground/80">{challenge.description}</p>
        <p className="text-xs text-muted-foreground italic">{challenge.instructions}</p>

        {/* Pattern input */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Your Pattern</label>
          <div className="flex items-center">
            <span className="px-2 py-2 bg-zinc-800 border border-r-0 border-border rounded-l-lg text-muted-foreground font-mono text-sm">/</span>
            <input
              className={`flex-1 bg-zinc-900 border border-x-0 border-border px-3 py-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 ${regexError ? "border-red-500/60" : ""}`}
              value={userPattern}
              onChange={(e) => validate(e.target.value)}
              placeholder="write your regex here…"
              spellCheck={false}
            />
            <span className="px-2 py-2 bg-zinc-800 border border-l-0 border-border rounded-r-lg text-muted-foreground font-mono text-sm">/{flags}</span>
          </div>
          {regexError && <p className="mt-1 text-xs text-red-400 font-mono">{regexError}</p>}
        </div>

        {/* Test cases */}
        {results && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Test Cases</span>
              {allPassed ? (
                <span className="text-xs text-green-400 font-semibold">All {challenge.testCases.length} passed!</span>
              ) : (
                <span className="text-xs text-muted-foreground">{passCount} / {challenge.testCases.length} passed</span>
              )}
            </div>
            {results.map((tc, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono ${
                  tc.pass ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <span className={tc.pass ? "text-green-400" : "text-red-400"}>{tc.pass ? "✓" : "✗"}</span>
                <span className="text-foreground/80 flex-1">{JSON.stringify(tc.input)}</span>
                <span className={`text-xs ${tc.shouldMatch ? "text-green-400/60" : "text-red-400/60"}`}>
                  should {tc.shouldMatch ? "match" : "not match"}
                </span>
              </div>
            ))}
          </div>
        )}

        {allPassed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg border border-green-500/40 bg-green-500/10 text-center"
          >
            <span className="text-green-400 font-semibold text-sm">Challenge complete!</span>
          </motion.div>
        )}

        {/* Hint & Solution */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowHint((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>
          <button
            onClick={() => setShowSolution((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            {showSolution ? "Hide Solution" : "Reveal Solution"}
          </button>
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <p className="text-xs text-amber-300">{challenge.hint}</p>
              </div>
            </motion.div>
          )}
          {showSolution && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg border border-zinc-600 bg-zinc-900">
                <p className="text-xs text-zinc-400 mb-1">One possible solution:</p>
                <code className="text-sm font-mono text-primary">/{challenge.solution}/{flags}</code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function RegexChallenges() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="my-6 space-y-3">
      <div className="flex flex-wrap gap-2 mb-4">
        {CHALLENGES.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              activeIdx === i
                ? "border-primary/60 bg-primary/20 text-primary"
                : "border-border text-muted-foreground hover:border-border/80"
            }`}
          >
            {i + 1}. {c.title}
          </button>
        ))}
      </div>
      <ChallengeCard challenge={CHALLENGES[activeIdx]} />
    </div>
  );
}
