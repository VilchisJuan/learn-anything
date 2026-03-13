"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  section: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  // Vocabulary
  {
    id: 1, section: "Vocabulary",
    q: "What is the meaning of 食べる (たべる)?",
    options: ["to drink", "to eat", "to read", "to write"],
    answer: 1,
    explanation: "食べる (たべる) means 'to eat'. Remember: 食 means food/eat (ショク、たべる).",
  },
  {
    id: 2, section: "Vocabulary",
    q: "Which word means 'school'?",
    options: ["がっこう", "でんしゃ", "びょういん", "ゆうびんきょく"],
    answer: 0,
    explanation: "がっこう (学校) means school. でんしゃ = train, びょういん = hospital, ゆうびんきょく = post office.",
  },
  {
    id: 3, section: "Vocabulary",
    q: "What does 大きい mean?",
    options: ["small", "fast", "big", "new"],
    answer: 2,
    explanation: "大きい (おおきい) means 'big/large'. Its antonym is 小さい (ちいさい, small).",
  },
  {
    id: 4, section: "Vocabulary",
    q: "Which word means 'to understand'?",
    options: ["はなす", "わかる", "かえる", "おきる"],
    answer: 1,
    explanation: "わかる (分かる) means 'to understand'. はなす = to speak, かえる = to return, おきる = to wake up.",
  },
  {
    id: 5, section: "Vocabulary",
    q: "What does 右 (みぎ) mean?",
    options: ["left", "right", "up", "down"],
    answer: 1,
    explanation: "右 (みぎ) means 'right'. Left is 左 (ひだり).",
  },
  // Grammar / Particles
  {
    id: 6, section: "Grammar",
    q: "Choose the correct particle: わたし___がくせいです。",
    options: ["を", "が", "は", "に"],
    answer: 2,
    explanation: "は (wa) is used as the topic marker. 'As for me, I am a student.' は marks the topic of discussion.",
  },
  {
    id: 7, section: "Grammar",
    q: "Choose the correct particle: えき___いきます。",
    options: ["を", "に", "は", "で"],
    answer: 1,
    explanation: "に (ni) marks destination with movement verbs like いく. 'I go to the station.'",
  },
  {
    id: 8, section: "Grammar",
    q: "Which sentence is correct? (I read a newspaper)",
    options: ["しんぶんをよみます。", "しんぶんはよみます。", "しんぶんによみます。", "しんぶんでよみます。"],
    answer: 0,
    explanation: "を (wo) marks the direct object. しんぶん (newspaper) is what is being read, so を is correct.",
  },
  {
    id: 9, section: "Grammar",
    q: "How do you say 'I also am a student'?",
    options: ["わたしはがくせいです。", "わたしがくせいもです。", "わたしもがくせいです。", "わたしをがくせいです。"],
    answer: 2,
    explanation: "も replaces は when meaning 'also/too'. わたしもがくせいです = 'I am also a student'.",
  },
  {
    id: 10, section: "Grammar",
    q: "Choose the correct particle: こうえん___あそびます。(I play in the park)",
    options: ["に", "を", "は", "で"],
    answer: 3,
    explanation: "で (de) marks the location where an action takes place. 'I play in the park.'",
  },
  // Verb conjugation
  {
    id: 11, section: "Conjugation",
    q: "What is the polite past form of 食べる?",
    options: ["食べます", "食べました", "食べません", "食べなかった"],
    answer: 1,
    explanation: "Polite past = ～ました. 食べ + ました = 食べました 'I/someone ate'.",
  },
  {
    id: 12, section: "Conjugation",
    q: "What is the negative form of 飲む (to drink)?",
    options: ["飲まない", "飲めない", "飲もない", "飲みない"],
    answer: 0,
    explanation: "For u-verbs: む → ま + ない = 飲まない. The vowel changes to あ-row before ない.",
  },
  {
    id: 13, section: "Conjugation",
    q: "What is the て-form of 行く?",
    options: ["行いて", "行って", "行きて", "行かて"],
    answer: 1,
    explanation: "行く is an exception: く → って (not いて). So 行く → 行って.",
  },
  {
    id: 14, section: "Conjugation",
    q: "Which is correct? 'I am going to school tomorrow.' (formal)",
    options: ["あした、がっこうにいきます。", "あした、がっこうがいきます。", "あした、がっこうをいきます。", "あした、がっこうはいきます。"],
    answer: 0,
    explanation: "に marks destination with いく/くる. あした = tomorrow, がっこうにいきます = I will go to school.",
  },
  // Reading / Kanji
  {
    id: 15, section: "Kanji",
    q: "How do you read 水曜日?",
    options: ["かようび", "すいようび", "もくようび", "きんようび"],
    answer: 1,
    explanation: "水曜日 = すいようび (Wednesday). 水 = すい (water), 曜日 = ようび (day of the week).",
  },
  {
    id: 16, section: "Kanji",
    q: "What does 東京 mean?",
    options: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"],
    answer: 2,
    explanation: "東京 = とうきょう = Tokyo. 東 (east) + 京 (capital) = Eastern Capital.",
  },
  {
    id: 17, section: "Kanji",
    q: "How do you read 何時?",
    options: ["なんぷん", "なんじ", "いつ", "なんにち"],
    answer: 1,
    explanation: "何時 = なんじ = 'what time'. 何 = なん (what/how many) + 時 = じ (o'clock).",
  },
  {
    id: 18, section: "Kanji",
    q: "What is 三百 in numerals?",
    options: ["30", "300", "3000", "13"],
    answer: 1,
    explanation: "三 = 3, 百 = 100. 三百 = 3 × 100 = 300.",
  },
  // Expressions
  {
    id: 19, section: "Expressions",
    q: "What does すみません mean?",
    options: ["Good morning", "Thank you", "Excuse me / I'm sorry", "Goodbye"],
    answer: 2,
    explanation: "すみません is used to say 'excuse me' (getting attention), 'sorry', or as a polite form of thank you.",
  },
  {
    id: 20, section: "Expressions",
    q: "Which phrase means 'How much is it?'",
    options: ["いくらですか？", "なんですか？", "どこですか？", "だれですか？"],
    answer: 0,
    explanation: "いくらですか？ = 'How much is it?' いくら = how much (price). なんですか = what is it, どこ = where, だれ = who.",
  },
];

const SECTION_COLORS: Record<string, string> = {
  Vocabulary: "#f59e0b",
  Grammar: "#3b82f6",
  Conjugation: "#10b981",
  Kanji: "#8b5cf6",
  Expressions: "#ec4899",
};

type AnswerState = { selected: number; correct: boolean } | null;

export function JlptQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(Array(QUESTIONS.length).fill(null));
  const [showExp, setShowExp] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[current];
  const ans = answers[current];
  const score = answers.filter((a) => a?.correct).length;

  function handleAnswer(idx: number) {
    if (ans) return;
    const correct = idx === q.answer;
    const next = [...answers];
    next[current] = { selected: idx, correct };
    setAnswers(next);
    setShowExp(true);
  }

  function handleNext() {
    setShowExp(false);
    if (current + 1 >= QUESTIONS.length) setFinished(true);
    else setCurrent((c) => c + 1);
  }

  function handleRestart() {
    setCurrent(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setShowExp(false);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const grade = pct >= 90 ? "Excellent — N5 Ready!" : pct >= 70 ? "Good — Keep Practicing" : pct >= 50 ? "Needs Work" : "Keep Studying!";
    const gradeColor = pct >= 90 ? "#22d3ee" : pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#f87171";
    const sectionScores = Object.keys(SECTION_COLORS).map((sec) => {
      const qs = QUESTIONS.filter((qq) => qq.section === sec);
      const correct = qs.filter((qq) => answers[qq.id - 1]?.correct).length;
      return { section: sec, correct, total: qs.length };
    });

    return (
      <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">JLPT N5 Practice Quiz — Results</h3>
        </div>
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-1" style={{ color: gradeColor }}>{score}/{QUESTIONS.length}</div>
            <div className="text-sm text-muted-foreground">{pct}% correct</div>
            <div className="text-base font-semibold mt-2" style={{ color: gradeColor }}>{grade}</div>
          </div>

          {/* Section breakdown */}
          <div className="w-full max-w-sm">
            <p className="text-xs text-muted-foreground mb-3">Section breakdown</p>
            <div className="flex flex-col gap-2">
              {sectionScores.map(({ section, correct, total }) => {
                const pct2 = Math.round((correct / total) * 100);
                const col = SECTION_COLORS[section] ?? "#94a3b8";
                return (
                  <div key={section} className="flex items-center gap-3">
                    <div className="w-20 text-[10px] text-right" style={{ color: col }}>{section}</div>
                    <div className="flex-1 h-2 rounded-full bg-[#222] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct2}%`, backgroundColor: col }} />
                    </div>
                    <div className="w-10 text-[10px] text-muted-foreground">{correct}/{total}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-5 py-2 rounded-lg bg-blue-400/10 border border-blue-400/30 text-blue-400 text-sm font-semibold hover:bg-blue-400/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sectionColor = SECTION_COLORS[q.section] ?? "#94a3b8";

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">JLPT N5 Practice Quiz</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{current + 1} / {QUESTIONS.length}</span>
          <div className="w-24 h-1.5 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-300"
              style={{ width: `${((current + (ans ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded border"
            style={{ color: sectionColor, borderColor: sectionColor + "40", backgroundColor: sectionColor + "10" }}
          >
            {q.section}
          </span>
          {ans && (
            <span className={`text-[10px] font-semibold ${ans.correct ? "text-green-400" : "text-red-400"}`}>
              {ans.correct ? "Correct!" : "Incorrect"}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-foreground leading-relaxed">{q.q}</p>

        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            let cls = "text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150 ";
            if (!ans) {
              cls += "border-border hover:border-blue-400/50 hover:bg-blue-400/5 text-foreground/80";
            } else if (i === q.answer) {
              cls += "border-green-500/60 bg-green-950/30 text-green-300";
            } else if (i === ans.selected && !ans.correct) {
              cls += "border-red-500/60 bg-red-950/30 text-red-300";
            } else {
              cls += "border-border text-muted-foreground opacity-40";
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={!!ans}>
                <span className="font-mono text-[10px] mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showExp && ans && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-lg border p-4 text-xs leading-5 overflow-hidden ${
                ans.correct ? "border-green-800/50 bg-green-950/20 text-green-200/80" : "border-amber-800/40 bg-amber-950/20 text-amber-200/80"
              }`}
            >
              <strong className={`block mb-1 ${ans.correct ? "text-green-400" : "text-amber-400"}`}>
                {ans.correct ? "Correct — " : `Answer: ${q.options[q.answer]}. `}
              </strong>
              {q.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        {ans && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-lg bg-blue-400/10 border border-blue-400/30 text-blue-400 text-xs font-semibold hover:bg-blue-400/20 transition-colors"
            >
              {current + 1 < QUESTIONS.length ? "Next Question →" : "See Results"}
            </button>
          </motion.div>
        )}

        <div className="flex gap-1 flex-wrap">
          {QUESTIONS.map((_, i) => {
            const a = answers[i];
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  !a ? (i === current ? "bg-blue-400" : "bg-[#333]")
                  : a.correct ? "bg-green-500" : "bg-red-500"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
