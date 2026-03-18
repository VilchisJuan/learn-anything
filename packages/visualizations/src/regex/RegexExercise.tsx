"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
  topic: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    q: "What does the pattern \\d match?",
    options: ["Any letter", "Any digit (0–9)", "Any whitespace", "Any word character"],
    answer: 1,
    explanation: "\\d is shorthand for [0-9] — it matches exactly one digit. Use \\d+ for one or more digits.",
    topic: "Character Classes",
  },
  {
    id: 2,
    q: "Which quantifier makes the preceding element optional (0 or 1 times)?",
    options: ["*", "+", "?", "{0}"],
    answer: 2,
    explanation: "? means 'zero or one' — it makes the element optional. For example, colou?r matches both 'color' and 'colour'.",
    topic: "Quantifiers",
  },
  {
    id: 3,
    q: "What is the difference between .* and .*? ?",
    options: [
      "No difference",
      ".* is greedy (matches as much as possible), .*? is lazy (matches as little as possible)",
      ".* is lazy, .*? is greedy",
      ".* matches letters, .*? matches any character",
    ],
    answer: 1,
    explanation: "Greedy quantifiers (.*) consume as much input as possible. Lazy quantifiers (.*?) consume as little as possible. This matters when matching between delimiters like tags.",
    topic: "Quantifiers",
  },
  {
    id: 4,
    q: "What does ^ mean inside a character class like [^abc]?",
    options: [
      "Start of string",
      "Matches the characters a, b, or c",
      "Negation — matches any character NOT in the set",
      "Escape the following character",
    ],
    answer: 2,
    explanation: "Inside [], ^ negates the set. [^abc] matches any character that is NOT a, b, or c. Outside [], ^ means start of string.",
    topic: "Character Classes",
  },
  {
    id: 5,
    q: "Which regex matches the word 'cat' only as a whole word (not inside 'concatenate')?",
    options: ["cat", "^cat$", "\\bcat\\b", "[c][a][t]"],
    answer: 2,
    explanation: "\\b is a word boundary assertion. \\bcat\\b matches 'cat' only when surrounded by non-word characters (spaces, punctuation, start/end of string).",
    topic: "Anchors",
  },
  {
    id: 6,
    q: "What does the pattern (\\w+)\\s\\1 match?",
    options: [
      "Any two words",
      "A word followed by a space",
      "A word followed by a space followed by the same word (repeated word)",
      "Two different words separated by whitespace",
    ],
    answer: 2,
    explanation: "\\1 is a backreference to the first capturing group. (\\w+)\\s\\1 matches sequences like 'hello hello' or 'the the' — a word, a space, then the exact same word again.",
    topic: "Groups",
  },
  {
    id: 7,
    q: "What does (?:abc) do differently from (abc)?",
    options: [
      "It only matches 'abc' at the start of a line",
      "It groups 'abc' but does NOT capture it (non-capturing group)",
      "It matches the opposite of 'abc'",
      "It is a named group called 'abc'",
    ],
    answer: 1,
    explanation: "(?:...) is a non-capturing group. It groups for quantifier purposes (like (?:ab)+) but the match is not stored and cannot be referenced with \\1.",
    topic: "Groups",
  },
  {
    id: 8,
    q: "Which regex would match '2024' in '2024-03-15' but NOT '24' in '24-03-15'?",
    options: ["\\d+", "\\d{4}", "^\\d+", "[0-9]{2,}"],
    answer: 1,
    explanation: "\\d{4} matches exactly 4 digits. It would match '2024' in the first string. While it could still match inside longer numbers, combined with anchors like \\b\\d{4}\\b it would be fully precise.",
    topic: "Quantifiers",
  },
  {
    id: 9,
    q: "What does the pattern \\d+(?= dollars) match in '42 dollars'?",
    options: [
      "'42 dollars' (the whole phrase)",
      "'42' only (positive lookahead — the word 'dollars' is not consumed)",
      "'dollars' only",
      "Nothing — lookaheads don't work with digits",
    ],
    answer: 1,
    explanation: "A positive lookahead (?=...) checks that the following text matches without consuming it. So \\d+(?= dollars) matches the number '42' only, while ensuring 'dollars' follows.",
    topic: "Lookaheads",
  },
  {
    id: 10,
    q: "With the multiline flag (m), what does ^ match?",
    options: [
      "Only the start of the entire string",
      "The start of each line (after every newline)",
      "Any whitespace at the start of words",
      "Nothing — ^ is ignored in multiline mode",
    ],
    answer: 1,
    explanation: "Without the m flag, ^ matches only the very start of the string. With m, it matches at the start of each line, making it easy to find patterns that begin a line.",
    topic: "Flags",
  },
  {
    id: 11,
    q: "Which regex correctly matches a valid hex color like #FF5733 or #abc?",
    options: ["#\\w+", "#[0-9a-fA-F]{3,6}", "#[0-9a-f]{3}|#[0-9a-f]{6}", "#[a-z0-9]+"],
    answer: 1,
    explanation: "#[0-9a-fA-F]{3,6} matches # followed by 3 to 6 hexadecimal characters. Combined with the i flag you could simplify to #[0-9a-f]{3,6}.",
    topic: "Character Classes",
  },
  {
    id: 12,
    q: "What is wrong with using .+ to match the content between HTML tags, like <b>hello</b>?",
    options: [
      "Nothing — it works perfectly",
      ".+ is greedy and will match from the first < to the last > consuming everything in between multiple tags",
      ".+ doesn't match letters",
      "HTML tags require the m flag",
    ],
    answer: 1,
    explanation: "Greedy .+ will match as much as possible. In '<b>hello</b><i>world</i>', <.+> matches the whole string from first < to last >. Use <.+?> (lazy) or better: <[^>]+> to match a single tag.",
    topic: "Quantifiers",
  },
];

const TOPIC_COLORS: Record<string, string> = {
  "Character Classes": "bg-green-500/20 text-green-400",
  "Quantifiers": "bg-amber-500/20 text-amber-400",
  "Anchors": "bg-purple-500/20 text-purple-400",
  "Groups": "bg-pink-500/20 text-pink-400",
  "Lookaheads": "bg-cyan-500/20 text-cyan-400",
  "Flags": "bg-blue-500/20 text-blue-400",
};

export function RegexExercise() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[current];
  const chosen = answers[current];
  const isCorrect = chosen === q.answer;

  function handleAnswer(idx: number) {
    if (chosen !== null) return;
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    setShowExplanation(true);
  }

  function handleNext() {
    setShowExplanation(false);
    if (current + 1 >= QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setShowExplanation(false);
    setFinished(false);
  }

  const score = answers.filter((a, i) => a === QUESTIONS[i].answer).length;

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const grade = pct >= 90 ? "Expert" : pct >= 75 ? "Proficient" : pct >= 60 ? "Learning" : "Keep Practicing";
    const gradeColor = pct >= 90 ? "text-green-400" : pct >= 75 ? "text-blue-400" : pct >= 60 ? "text-amber-400" : "text-red-400";

    return (
      <div className="my-6 border border-border rounded-xl overflow-hidden bg-zinc-950 p-6">
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold mb-2 ${gradeColor}`}>{pct}%</div>
          <div className={`text-xl font-semibold ${gradeColor}`}>{grade}</div>
          <p className="text-muted-foreground text-sm mt-2">{score} / {QUESTIONS.length} correct</p>
        </div>

        <div className="grid gap-2 mb-6">
          {QUESTIONS.map((question, i) => {
            const correct = answers[i] === question.answer;
            return (
              <div key={question.id} className={`flex items-center gap-3 p-3 rounded-lg border ${correct ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                <span className={`text-lg ${correct ? "text-green-400" : "text-red-400"}`}>{correct ? "✓" : "✗"}</span>
                <span className="text-sm text-foreground/80 flex-1">{question.q}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${TOPIC_COLORS[question.topic] ?? "bg-zinc-800 text-zinc-400"}`}>{question.topic}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 border border-border rounded-xl overflow-hidden bg-zinc-950">
      {/* Progress */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-border flex items-center gap-3">
        <span className="text-xs font-mono text-zinc-400 tracking-wider">REGEX QUIZ</span>
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/60 rounded-full transition-all"
            style={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{current + 1} / {QUESTIONS.length}</span>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded ${TOPIC_COLORS[q.topic] ?? "bg-zinc-800 text-zinc-400"}`}>
                {q.topic}
              </span>
            </div>
            <p className="text-lg text-foreground mb-6 leading-relaxed">{q.q}</p>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let style = "border-border hover:border-primary/50 hover:bg-zinc-900";
                if (chosen !== null) {
                  if (i === q.answer) style = "border-green-500/60 bg-green-500/10";
                  else if (i === chosen && !isCorrect) style = "border-red-500/60 bg-red-500/10";
                  else style = "border-border opacity-50";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={chosen !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm font-mono ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg border ${isCorrect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}
              >
                <p className={`text-sm font-semibold mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {isCorrect ? "Correct!" : `Incorrect — the answer is: ${q.options[q.answer]}`}
                </p>
                <p className="text-sm text-foreground/80">{q.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {chosen !== null && (
          <button
            onClick={handleNext}
            className="mt-6 w-full py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 transition-colors font-medium"
          >
            {current + 1 >= QUESTIONS.length ? "See Results" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}
