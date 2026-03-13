"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number; // 0-indexed
  explanation: string;
  topic: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    q: "Ammonites belong to which animal group?",
    options: ["Gastropods (snails)", "Cephalopods", "Bivalves", "Echinoderms"],
    answer: 1,
    explanation: "Ammonites are cephalopod mollusks — the same group as squids, octopuses, and nautiluses. Their closest living relative is the nautilus.",
    topic: "Classification",
  },
  {
    id: 2,
    q: "What is the Whorl Expansion Ratio (WER)?",
    options: [
      "The ratio of shell width to shell height",
      "The number of coils per species",
      "How much larger each new whorl is compared to the previous one",
      "The angle of the spiral relative to horizontal",
    ],
    answer: 2,
    explanation: "WER measures how much each new coil expands relative to the previous one. WER = 2 means each coil is twice the size of the one before. Low WER → evolute (open); high WER → involute (tightly coiled).",
    topic: "Shell Geometry",
  },
  {
    id: 3,
    q: "What is the phragmocone?",
    options: [
      "The soft body of the ammonite",
      "The tube running through the chambers",
      "The gas-filled chambered portion of the shell",
      "The opening where the animal extends out",
    ],
    answer: 2,
    explanation: "The phragmocone is the chambered section behind the living chamber. Each chamber was sealed by a septum wall and connected by the siphuncle. Gas in the phragmocone provided buoyancy.",
    topic: "Anatomy",
  },
  {
    id: 4,
    q: "How did ammonites control their depth in the water column?",
    options: [
      "By swimming continuously like fish",
      "By pumping gas into or out of their phragmocone chambers",
      "By adjusting the position of their tentacles",
      "They couldn't — ammonites were bottom-dwellers",
    ],
    answer: 1,
    explanation: "The siphuncle (a tube through the chambers) allowed ammonites to add or remove gas from their phragmocone, adjusting buoyancy — just like a submarine's ballast tanks. This let them hover at any depth without effort.",
    topic: "Ecology",
  },
  {
    id: 5,
    q: "What makes ammonite sutures useful to scientists?",
    options: [
      "They reveal the animal's diet",
      "They indicate age of the individual animal",
      "More complex sutures correlate with deeper-water lifestyles",
      "They show the direction of water flow in the shell",
    ],
    answer: 2,
    explanation: "Complex, folded suture lines created stronger septa (chamber walls). Species with highly complex ammonitic sutures could withstand higher pressure, indicating they lived at greater depths. Suture complexity also evolved over geological time.",
    topic: "Anatomy / Ecology",
  },
  {
    id: 6,
    q: "When did ammonites first appear, and when did they go extinct?",
    options: [
      "Cambrian (541 Ma) to Permian (252 Ma)",
      "Devonian (~400 Ma) to the end of the Cretaceous (66 Ma)",
      "Jurassic (201 Ma) to the Paleogene (56 Ma)",
      "Ordovician (485 Ma) to the end-Triassic (201 Ma)",
    ],
    answer: 1,
    explanation: "Ammonoids first appeared in the Early Devonian (~400 Ma) and survived until the Chicxulub asteroid impact at the end of the Cretaceous (66 Ma) — a span of 334 million years. They survived three mass extinctions before the final one.",
    topic: "Evolution",
  },
  {
    id: 7,
    q: "What is a macroconch vs a microconch?",
    options: [
      "Different species of ammonite living in different depths",
      "Juvenile vs adult of the same species",
      "The larger female vs smaller male of the same species",
      "Normal vs heteromorph forms of the same genus",
    ],
    answer: 2,
    explanation: "Macroconchs and microconchs are interpreted as females and males of the same species respectively. Females (macroconchs) were larger — up to 3× — possibly for egg-carrying capacity. Males (microconchs) often showed modified apertures for mating displays.",
    topic: "Ecology / Sexual Dimorphism",
  },
  {
    id: 8,
    q: "What is ammolite?",
    options: [
      "A type of rock that contains ammonite fossils",
      "The name for fossilized ammonite shell converted to calcite",
      "Original iridescent aragonite shell from Canadian ammonites used as a gemstone",
      "A sedimentary layer enriched in ammonite fossils",
    ],
    answer: 2,
    explanation: "Ammolite is iridescent, gemstone-quality ammonite shell where the original aragonite survived intact in Alberta's Bearpaw Formation. Unlike other fossils, the original layered crystal structure creates spectacular thin-film colour (reds, greens, blues). It is one of the few organic gemstones.",
    topic: "Fossils / Preservation",
  },
  {
    id: 9,
    q: "Why did nautiluses survive the K-Pg extinction when ammonites did not?",
    options: [
      "Nautiluses had harder shells that resisted the asteroid impact",
      "Nautiluses were deeper-water animals and likely laid resistant eggs",
      "Nautiluses evolved flight and survived on land temporarily",
      "Nautiluses didn't survive — they're actually much younger animals",
    ],
    answer: 1,
    explanation: "The leading hypothesis is that nautiluses were deep-water animals whose eggs (laid on the seafloor) survived the surface-layer collapse caused by the asteroid impact. Ammonites likely spawned plankton-sized larvae near the surface, which was devastated. Nautiluses may also have been better scavengers.",
    topic: "Extinction",
  },
  {
    id: 10,
    q: "What causes pyrite preservation in ammonites?",
    options: [
      "High-oxygen environments on the seafloor",
      "Bacteria producing hydrogen sulfide in anoxic muds, which reacts with iron to form FeS₂",
      "The animal's own iron-rich blood mineralising after death",
      "Volcanic activity introducing iron into the sediment",
    ],
    answer: 1,
    explanation: "In oxygen-poor (anoxic) seafloor muds, bacteria decompose organic matter and produce H₂S. This reacts with dissolved iron in the pore water to form iron sulfide (FeS₂, pyrite), which replaces the shell, creating the golden metallic 'fool's gold' ammonites found at Whitby and Holzmaden.",
    topic: "Fossils / Preservation",
  },
  {
    id: 11,
    q: "What is a heteromorph ammonite?",
    options: [
      "An ammonite with an unusually large size",
      "An ammonite that partially or fully abandoned the regular coiled planispiral shell",
      "An ammonite with no sutures — a primitive form",
      "A juvenile ammonite before its final coil",
    ],
    answer: 1,
    explanation: "Heteromorphs ('different shaped') are ammonites that broke from the typical coiled planispiral plan — including straight rods (baculites), hooks (scaphites/ancylocones), screws (turrilites), and impossible-looking 3D knots (Nipponites). They were especially diverse in the Cretaceous.",
    topic: "Evolution / Shell Forms",
  },
  {
    id: 12,
    q: "What is the largest known ammonite species?",
    options: [
      "Titanites giganteus — up to 53 cm",
      "Parapuzosia seppenradensis — up to 1.8 metres",
      "Baculites grandis — up to 2 metres (but straight)",
      "Sphenodiscus lobatus — up to 1.2 metres",
    ],
    answer: 1,
    explanation: "Parapuzosia seppenradensis holds the record for the largest coiled ammonite, with a complete specimen found near Seppenrade, Germany measuring 1.8 metres in diameter. The animal inside is estimated to have weighed over 200 kg. Baculites can be longer but is a straight rod, not coiled.",
    topic: "Ecology / Size",
  },
];

const TOPIC_COLORS: Record<string, string> = {
  "Classification": "#fbbf24",
  "Shell Geometry": "#a78bfa",
  "Anatomy": "#f97316",
  "Ecology": "#34d399",
  "Anatomy / Ecology": "#0891b2",
  "Evolution": "#f87171",
  "Ecology / Sexual Dimorphism": "#e879f9",
  "Fossils / Preservation": "#94a3b8",
  "Extinction": "#fb7185",
  "Evolution / Shell Forms": "#7dd3fc",
  "Ecology / Size": "#86efac",
};

type AnswerState = { selected: number; correct: boolean } | null;

export function AmmoniteQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(AnswerState)[]>(Array(QUESTIONS.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[current];
  const ans = answers[current];
  const score = answers.filter((a) => a?.correct).length;

  function handleAnswer(idx: number) {
    if (ans) return; // already answered
    const correct = idx === q.answer;
    const next = [...answers];
    next[current] = { selected: idx, correct };
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

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const grade = pct >= 90 ? "Expert" : pct >= 70 ? "Proficient" : pct >= 50 ? "Developing" : "Beginner";
    const gradeColor = pct >= 90 ? "#fbbf24" : pct >= 70 ? "#34d399" : pct >= 50 ? "#f97316" : "#f87171";
    return (
      <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Ammonite Knowledge Check — Results</h3>
        </div>
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-1" style={{ color: gradeColor }}>{score}/{QUESTIONS.length}</div>
            <div className="text-sm text-muted-foreground">{pct}% correct</div>
            <div className="text-lg font-semibold mt-2" style={{ color: gradeColor }}>{grade}</div>
          </div>

          {/* Per-question review */}
          <div className="w-full max-w-lg flex flex-col gap-2">
            <p className="text-xs text-muted-foreground mb-1">Question review</p>
            {QUESTIONS.map((question, i) => {
              const a = answers[i];
              return (
                <div key={question.id} className={`flex items-start gap-2 rounded-md border p-2 text-[10px] ${a?.correct ? "border-green-800/50 bg-green-950/20" : "border-red-800/50 bg-red-950/20"}`}>
                  <span className={`shrink-0 mt-0.5 ${a?.correct ? "text-green-400" : "text-red-400"}`}>{a?.correct ? "✓" : "✗"}</span>
                  <div className="flex-1">
                    <span className="text-foreground/80">{question.q}</span>
                    {!a?.correct && (
                      <div className="mt-0.5 text-green-400/80">Correct: {question.options[question.answer]}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="px-5 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm font-semibold hover:bg-amber-400/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topicColor = TOPIC_COLORS[q.topic] ?? "#94a3b8";

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <h3 className="text-sm font-semibold text-foreground">Ammonite Knowledge Check</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{current + 1} / {QUESTIONS.length}</span>
          <div className="w-24 h-1.5 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-300"
              style={{ width: `${((current + (ans ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Topic badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded border" style={{ color: topicColor, borderColor: topicColor + "40", backgroundColor: topicColor + "10" }}>
            {q.topic}
          </span>
          {ans && (
            <span className={`text-[10px] font-semibold ${ans.correct ? "text-green-400" : "text-red-400"}`}>
              {ans.correct ? "Correct!" : "Incorrect"}
            </span>
          )}
        </div>

        {/* Question */}
        <p className="text-sm font-medium text-foreground leading-relaxed">{q.q}</p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            let className = "text-left px-4 py-3 rounded-lg border text-xs transition-all duration-150 ";
            if (!ans) {
              className += "border-border hover:border-amber-400/50 hover:bg-amber-400/5 text-foreground/80";
            } else if (i === q.answer) {
              className += "border-green-500/60 bg-green-950/30 text-green-300";
            } else if (i === ans.selected && !ans.correct) {
              className += "border-red-500/60 bg-red-950/30 text-red-300";
            } else {
              className += "border-border text-muted-foreground opacity-50";
            }
            return (
              <button key={i} className={className} onClick={() => handleAnswer(i)} disabled={!!ans}>
                <span className="font-mono text-[10px] mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && ans && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-lg border p-4 text-xs leading-5 overflow-hidden ${ans.correct ? "border-green-800/50 bg-green-950/20 text-green-200/80" : "border-amber-800/40 bg-amber-950/20 text-amber-200/80"}`}
            >
              <strong className={`block mb-1 ${ans.correct ? "text-green-400" : "text-amber-400"}`}>
                {ans.correct ? "Correct — " : "The correct answer is: "}
                {!ans.correct && <span className="font-normal">{q.options[q.answer]}. </span>}
              </strong>
              {q.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        {ans && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold hover:bg-amber-400/20 transition-colors"
            >
              {current + 1 < QUESTIONS.length ? "Next Question →" : "See Results"}
            </button>
          </motion.div>
        )}

        {/* Score tracker */}
        <div className="flex gap-1 flex-wrap">
          {QUESTIONS.map((_, i) => {
            const a = answers[i];
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  !a ? (i === current ? "bg-amber-400" : "bg-[#333]")
                  : a.correct ? "bg-green-500"
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
