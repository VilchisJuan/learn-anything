"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Exercise {
  id: number;
  parts: [string, string]; // [before blank, after blank]
  correct: string;
  options: string[];
  translation: string;
  explanation: string;
  topic: string;
}

const EXERCISES: Exercise[] = [
  {
    id: 1,
    parts: ["わたし", "がくせいです。"],
    correct: "は",
    options: ["は", "が", "を", "に"],
    translation: "I am a student.",
    explanation: "は (wa) is the topic marker. It marks わたし (I) as the topic of the sentence.",
    topic: "Topic marker は",
  },
  {
    id: 2,
    parts: ["ほん", "よみます。"],
    correct: "を",
    options: ["は", "が", "を", "で"],
    translation: "I read a book.",
    explanation: "を (wo) is the direct object marker. It marks ほん (book) as what is being read.",
    topic: "Object marker を",
  },
  {
    id: 3,
    parts: ["がっこう", "いきます。"],
    correct: "に",
    options: ["は", "に", "で", "と"],
    translation: "I go to school.",
    explanation: "に (ni) marks the destination of movement verbs like いく (to go).",
    topic: "Destination に",
  },
  {
    id: 4,
    parts: ["こうえん", "あそびます。"],
    correct: "で",
    options: ["に", "で", "は", "も"],
    translation: "I play in the park.",
    explanation: "で (de) marks the location where an action takes place.",
    topic: "Location of action で",
  },
  {
    id: 5,
    parts: ["ともだち", "はなします。"],
    correct: "と",
    options: ["は", "に", "と", "の"],
    translation: "I talk with my friend.",
    explanation: "と (to) means 'with' when used with people or 'and' when connecting nouns.",
    topic: "Together with と",
  },
  {
    id: 6,
    parts: ["これはわたし", "ほんです。"],
    correct: "の",
    options: ["は", "が", "の", "に"],
    translation: "This is my book.",
    explanation: "の (no) is the possessive particle — similar to 's in English.",
    topic: "Possessive の",
  },
  {
    id: 7,
    parts: ["わたし", "がくせいです。（も）"],
    correct: "も",
    options: ["は", "が", "も", "と"],
    translation: "I am also a student.",
    explanation: "も (mo) means 'also' or 'too'. It replaces は or が when adding information.",
    topic: "Also も",
  },
  {
    id: 8,
    parts: ["ねこ", "すきです。"],
    correct: "が",
    options: ["は", "が", "を", "で"],
    translation: "I like cats. (lit: cats are liked)",
    explanation: "が (ga) marks the subject in sentences with emotions/preferences like すき (like).",
    topic: "Subject marker が",
  },
  {
    id: 9,
    parts: ["とうきょう", "いきます。"],
    correct: "へ",
    options: ["に", "へ", "で", "を"],
    translation: "I go towards Tokyo.",
    explanation: "へ (e/he) marks direction of movement, similar to に but emphasizing direction over destination.",
    topic: "Direction へ",
  },
  {
    id: 10,
    parts: ["これはほんです", "？"],
    correct: "か",
    options: ["は", "か", "も", "ね"],
    translation: "Is this a book?",
    explanation: "か (ka) at the end of a sentence turns it into a yes/no question.",
    topic: "Question marker か",
  },
  {
    id: 11,
    parts: ["でんしゃ", "きます。"],
    correct: "で",
    options: ["に", "で", "を", "と"],
    translation: "I come by train.",
    explanation: "で (de) also marks the means or method of doing something.",
    topic: "Means で",
  },
  {
    id: 12,
    parts: ["しちじ", "おきます。"],
    correct: "に",
    options: ["は", "に", "で", "も"],
    translation: "I wake up at 7 o'clock.",
    explanation: "に (ni) marks specific points in time.",
    topic: "Time point に",
  },
];

const PARTICLE_COLORS: Record<string, string> = {
  "は": "#f59e0b", "が": "#3b82f6", "を": "#ec4899",
  "に": "#10b981", "で": "#8b5cf6", "と": "#f97316",
  "の": "#14b8a6", "も": "#fb7185", "へ": "#a78bfa", "か": "#fbbf24",
  "ね": "#94a3b8",
};

export function ParticleExercise() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(EXERCISES.length).fill(null));
  const [showExp, setShowExp] = useState(false);
  const [finished, setFinished] = useState(false);

  const ex = EXERCISES[current];
  const answered = answers[current];
  const score = answers.filter((a, i) => a === EXERCISES[i].correct).length;

  function handleAnswer(particle: string) {
    if (answered) return;
    const next = [...answers];
    next[current] = particle;
    setAnswers(next);
    setShowExp(true);
  }

  function handleNext() {
    setShowExp(false);
    if (current + 1 >= EXERCISES.length) setFinished(true);
    else setCurrent((c) => c + 1);
  }

  function handleRestart() {
    setCurrent(0);
    setAnswers(Array(EXERCISES.length).fill(null));
    setShowExp(false);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / EXERCISES.length) * 100);
    return (
      <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Particle Exercises — Results</h3>
        </div>
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground mb-1">{score}/{EXERCISES.length}</div>
            <div className="text-sm text-muted-foreground">{pct}% correct</div>
          </div>
          <div className="w-full max-w-lg flex flex-col gap-2">
            {EXERCISES.map((e, i) => {
              const a = answers[i];
              const correct = a === e.correct;
              return (
                <div key={e.id} className={`flex items-start gap-2 rounded border p-2 text-xs ${correct ? "border-green-800/50 bg-green-950/20" : "border-red-800/50 bg-red-950/20"}`}>
                  <span className={`shrink-0 ${correct ? "text-green-400" : "text-red-400"}`}>{correct ? "✓" : "✗"}</span>
                  <div>
                    <span className="text-foreground/80">{e.parts[0]}<span className={`font-bold mx-0.5 ${correct ? "text-green-400" : "text-red-400"}`}>[{a}]</span>{e.parts[1]}</span>
                    {!correct && <div className="text-green-400/80 mt-0.5">Correct: {e.correct}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={handleRestart} className="px-5 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-400/20 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topicColor = PARTICLE_COLORS[ex.correct] ?? "#94a3b8";
  const isCorrect = answered === ex.correct;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">Particle Exercises</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{current + 1} / {EXERCISES.length}</span>
          <div className="w-24 h-1.5 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${((current + (answered ? 1 : 0)) / EXERCISES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Topic badge */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded border"
            style={{ color: topicColor, borderColor: topicColor + "40", backgroundColor: topicColor + "10" }}
          >
            {ex.topic}
          </span>
          {answered && (
            <span className={`text-[10px] font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
              {isCorrect ? "Correct!" : `Wrong — answer is「${ex.correct}」`}
            </span>
          )}
        </div>

        {/* Sentence with blank */}
        <div className="text-2xl text-center py-4 font-medium tracking-wider">
          <span className="text-foreground">{ex.parts[0]}</span>
          <span
            className={`inline-block mx-2 px-3 py-0.5 rounded border-b-2 font-bold min-w-[2rem] text-center transition-colors ${
              !answered ? "border-border text-muted-foreground" :
              isCorrect ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
            }`}
          >
            {answered ?? "___"}
          </span>
          <span className="text-foreground">{ex.parts[1]}</span>
        </div>

        <p className="text-xs text-muted-foreground text-center italic">"{ex.translation}"</p>

        {/* Particle buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {ex.options.map((p) => {
            const pColor = PARTICLE_COLORS[p] ?? "#94a3b8";
            let cls = "w-12 h-12 rounded-xl border text-xl font-bold transition-all ";
            if (!answered) {
              cls += "border-border hover:bg-white/5";
            } else if (p === ex.correct) {
              cls += "border-green-500/60 bg-green-950/30 text-green-300";
            } else if (p === answered && !isCorrect) {
              cls += "border-red-500/60 bg-red-950/30 text-red-300";
            } else {
              cls += "border-border opacity-30";
            }
            return (
              <button
                key={p}
                className={cls}
                style={!answered ? { color: pColor } : undefined}
                onClick={() => handleAnswer(p)}
                disabled={!!answered}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExp && answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-lg border p-4 text-xs leading-5 overflow-hidden ${
                isCorrect ? "border-green-800/50 bg-green-950/20 text-green-200/80" : "border-amber-800/40 bg-amber-950/20 text-amber-200/80"
              }`}
            >
              <strong className={`block mb-1 text-sm ${isCorrect ? "text-green-400" : "text-amber-400"}`}>
                {isCorrect ? "Correct! " : `Correct answer: 「${ex.correct}」 `}
              </strong>
              {ex.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        {answered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-400/20 transition-colors"
            >
              {current + 1 < EXERCISES.length ? "Next Exercise →" : "See Results"}
            </button>
          </motion.div>
        )}

        <div className="flex gap-1 flex-wrap">
          {EXERCISES.map((e, i) => {
            const a = answers[i];
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  !a ? (i === current ? "bg-emerald-400" : "bg-[#333]")
                  : a === e.correct ? "bg-green-500"
                  : "bg-red-500"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
