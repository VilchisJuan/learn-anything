"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface KanaEntry {
  kana: string;
  romaji: string;
  type: "hiragana" | "katakana";
}

const HIRAGANA: KanaEntry[] = [
  { kana: "あ", romaji: "a", type: "hiragana" }, { kana: "い", romaji: "i", type: "hiragana" },
  { kana: "う", romaji: "u", type: "hiragana" }, { kana: "え", romaji: "e", type: "hiragana" },
  { kana: "お", romaji: "o", type: "hiragana" }, { kana: "か", romaji: "ka", type: "hiragana" },
  { kana: "き", romaji: "ki", type: "hiragana" }, { kana: "く", romaji: "ku", type: "hiragana" },
  { kana: "け", romaji: "ke", type: "hiragana" }, { kana: "こ", romaji: "ko", type: "hiragana" },
  { kana: "さ", romaji: "sa", type: "hiragana" }, { kana: "し", romaji: "shi", type: "hiragana" },
  { kana: "す", romaji: "su", type: "hiragana" }, { kana: "せ", romaji: "se", type: "hiragana" },
  { kana: "そ", romaji: "so", type: "hiragana" }, { kana: "た", romaji: "ta", type: "hiragana" },
  { kana: "ち", romaji: "chi", type: "hiragana" }, { kana: "つ", romaji: "tsu", type: "hiragana" },
  { kana: "て", romaji: "te", type: "hiragana" }, { kana: "と", romaji: "to", type: "hiragana" },
  { kana: "な", romaji: "na", type: "hiragana" }, { kana: "に", romaji: "ni", type: "hiragana" },
  { kana: "ぬ", romaji: "nu", type: "hiragana" }, { kana: "ね", romaji: "ne", type: "hiragana" },
  { kana: "の", romaji: "no", type: "hiragana" }, { kana: "は", romaji: "ha", type: "hiragana" },
  { kana: "ひ", romaji: "hi", type: "hiragana" }, { kana: "ふ", romaji: "fu", type: "hiragana" },
  { kana: "へ", romaji: "he", type: "hiragana" }, { kana: "ほ", romaji: "ho", type: "hiragana" },
  { kana: "ま", romaji: "ma", type: "hiragana" }, { kana: "み", romaji: "mi", type: "hiragana" },
  { kana: "む", romaji: "mu", type: "hiragana" }, { kana: "め", romaji: "me", type: "hiragana" },
  { kana: "も", romaji: "mo", type: "hiragana" }, { kana: "や", romaji: "ya", type: "hiragana" },
  { kana: "ゆ", romaji: "yu", type: "hiragana" }, { kana: "よ", romaji: "yo", type: "hiragana" },
  { kana: "ら", romaji: "ra", type: "hiragana" }, { kana: "り", romaji: "ri", type: "hiragana" },
  { kana: "る", romaji: "ru", type: "hiragana" }, { kana: "れ", romaji: "re", type: "hiragana" },
  { kana: "ろ", romaji: "ro", type: "hiragana" }, { kana: "わ", romaji: "wa", type: "hiragana" },
  { kana: "を", romaji: "wo", type: "hiragana" }, { kana: "ん", romaji: "n", type: "hiragana" },
];

const KATAKANA: KanaEntry[] = [
  { kana: "ア", romaji: "a", type: "katakana" }, { kana: "イ", romaji: "i", type: "katakana" },
  { kana: "ウ", romaji: "u", type: "katakana" }, { kana: "エ", romaji: "e", type: "katakana" },
  { kana: "オ", romaji: "o", type: "katakana" }, { kana: "カ", romaji: "ka", type: "katakana" },
  { kana: "キ", romaji: "ki", type: "katakana" }, { kana: "ク", romaji: "ku", type: "katakana" },
  { kana: "ケ", romaji: "ke", type: "katakana" }, { kana: "コ", romaji: "ko", type: "katakana" },
  { kana: "サ", romaji: "sa", type: "katakana" }, { kana: "シ", romaji: "shi", type: "katakana" },
  { kana: "ス", romaji: "su", type: "katakana" }, { kana: "セ", romaji: "se", type: "katakana" },
  { kana: "ソ", romaji: "so", type: "katakana" }, { kana: "タ", romaji: "ta", type: "katakana" },
  { kana: "チ", romaji: "chi", type: "katakana" }, { kana: "ツ", romaji: "tsu", type: "katakana" },
  { kana: "テ", romaji: "te", type: "katakana" }, { kana: "ト", romaji: "to", type: "katakana" },
  { kana: "ナ", romaji: "na", type: "katakana" }, { kana: "ニ", romaji: "ni", type: "katakana" },
  { kana: "ヌ", romaji: "nu", type: "katakana" }, { kana: "ネ", romaji: "ne", type: "katakana" },
  { kana: "ノ", romaji: "no", type: "katakana" }, { kana: "ハ", romaji: "ha", type: "katakana" },
  { kana: "ヒ", romaji: "hi", type: "katakana" }, { kana: "フ", romaji: "fu", type: "katakana" },
  { kana: "ヘ", romaji: "he", type: "katakana" }, { kana: "ホ", romaji: "ho", type: "katakana" },
  { kana: "マ", romaji: "ma", type: "katakana" }, { kana: "ミ", romaji: "mi", type: "katakana" },
  { kana: "ム", romaji: "mu", type: "katakana" }, { kana: "メ", romaji: "me", type: "katakana" },
  { kana: "モ", romaji: "mo", type: "katakana" }, { kana: "ヤ", romaji: "ya", type: "katakana" },
  { kana: "ユ", romaji: "yu", type: "katakana" }, { kana: "ヨ", romaji: "yo", type: "katakana" },
  { kana: "ラ", romaji: "ra", type: "katakana" }, { kana: "リ", romaji: "ri", type: "katakana" },
  { kana: "ル", romaji: "ru", type: "katakana" }, { kana: "レ", romaji: "re", type: "katakana" },
  { kana: "ロ", romaji: "ro", type: "katakana" }, { kana: "ワ", romaji: "wa", type: "katakana" },
  { kana: "ン", romaji: "n", type: "katakana" },
];

const ALL = [...HIRAGANA, ...KATAKANA];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getOptions(correct: KanaEntry, pool: KanaEntry[]): string[] {
  const others = shuffle(pool.filter((k) => k.romaji !== correct.romaji)).slice(0, 3);
  return shuffle([correct.romaji, ...others.map((k) => k.romaji)]);
}

type Mode = "hiragana" | "katakana" | "both";

export function KanaQuiz() {
  const [mode, setMode] = useState<Mode>("hiragana");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const pool = mode === "hiragana" ? HIRAGANA : mode === "katakana" ? KATAKANA : ALL;

  const [current, setCurrent] = useState<KanaEntry>(() => shuffle(pool)[0]);
  const [options, setOptions] = useState<string[]>(() => getOptions(shuffle(pool)[0], pool));

  const nextQuestion = useCallback((newPool: KanaEntry[]) => {
    const next = shuffle(newPool)[Math.floor(Math.random() * Math.min(newPool.length, 10))];
    setCurrent(next);
    setOptions(getOptions(next, newPool));
    setFeedback(null);
    setSelectedAnswer(null);
  }, []);

  const handleMode = (m: Mode) => {
    setMode(m);
    setScore(0);
    setStreak(0);
    setTotal(0);
    const newPool = m === "hiragana" ? HIRAGANA : m === "katakana" ? KATAKANA : ALL;
    nextQuestion(newPool);
  };

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    setSelectedAnswer(answer);
    setTotal((t) => t + 1);
    if (answer === current.romaji) {
      setFeedback("correct");
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setFeedback("wrong");
      setStreak(0);
    }
    setTimeout(() => nextQuestion(pool), 1200);
  };

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">Kana Quiz</h3>
        <div className="flex gap-1 ml-auto">
          {(["hiragana", "katakana", "both"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleMode(m)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors border capitalize ${
                mode === m
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 flex flex-col items-center gap-6">
        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">{score}/{total}</div>
            <div className="text-[10px] text-muted-foreground">correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
            <div className="text-[10px] text-muted-foreground">accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: streak >= 5 ? "#f59e0b" : streak >= 3 ? "#3b82f6" : "inherit" }}>
              {streak}
            </div>
            <div className="text-[10px] text-muted-foreground">streak</div>
          </div>
        </div>

        {/* Character card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.kana}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.15 }}
            className={`w-36 h-36 rounded-2xl border-2 flex flex-col items-center justify-center transition-colors ${
              feedback === "correct"
                ? "border-green-500/60 bg-green-950/30"
                : feedback === "wrong"
                ? "border-red-500/60 bg-red-950/30"
                : "border-border bg-[#111]"
            }`}
          >
            <div className={`text-7xl leading-none font-bold ${
              feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-foreground"
            }`}>
              {current.kana}
            </div>
            <div className={`text-[10px] mt-2 font-mono ${
              current.type === "hiragana" ? "text-blue-400/60" : "text-violet-400/60"
            }`}>
              {current.type}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {options.map((opt) => {
            let cls = "py-3 rounded-xl border text-sm font-mono font-semibold transition-all ";
            if (!feedback) {
              cls += "border-border hover:border-blue-400/50 hover:bg-blue-400/5 text-foreground";
            } else if (opt === current.romaji) {
              cls += "border-green-500/60 bg-green-950/30 text-green-300";
            } else if (opt === selectedAnswer && feedback === "wrong") {
              cls += "border-red-500/60 bg-red-950/30 text-red-300";
            } else {
              cls += "border-border text-muted-foreground opacity-40";
            }
            return (
              <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={!!feedback}>
                {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}
          >
            {feedback === "correct"
              ? streak >= 3 ? `${streak} in a row! 🔥` : "Correct!"
              : `Wrong — it's "${current.romaji}"`}
          </motion.div>
        )}
      </div>
    </div>
  );
}
