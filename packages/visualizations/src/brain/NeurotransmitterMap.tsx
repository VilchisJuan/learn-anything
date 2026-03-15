"use client";

import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Pathway {
  id: string;
  name: string;
  color: string;
  colorDim: string;
  regions: string[];
  function: string;
  deficiency: string;
  excess: string;
  disorders: string[];
  paths: string[]; // SVG path d strings on the brain silhouette (viewBox 0 0 320 260)
  dots: { cx: number; cy: number; label: string }[];
}

const PATHWAYS: Pathway[] = [
  {
    id: "dopamine",
    name: "Dopamine",
    color: "#f59e0b",
    colorDim: "#f59e0b22",
    regions: ["Ventral Tegmental Area (VTA)", "Nucleus Accumbens", "Substantia Nigra", "Striatum", "Prefrontal Cortex"],
    function: "Reward, motivation, movement coordination, and pleasure. The 'want' neurotransmitter — drives goal-directed behavior.",
    deficiency: "Loss of motivation (anhedonia), slowed movement, tremors, difficulty initiating actions.",
    excess: "Psychosis, hallucinations, compulsive reward-seeking, mania.",
    disorders: ["Parkinson's disease", "Schizophrenia", "Addiction", "ADHD", "Bipolar disorder"],
    paths: [
      "M 155 195 Q 175 185 195 170 Q 210 158 215 145", // VTA → Nucleus Accumbens
      "M 155 195 Q 160 175 165 160 Q 170 148 178 140 Q 190 130 200 120", // Substantia Nigra → Striatum
      "M 155 195 Q 145 175 138 155 Q 132 138 130 120 Q 128 108 132 95", // VTA → PFC
    ],
    dots: [
      { cx: 155, cy: 195, label: "VTA / SN" },
      { cx: 215, cy: 145, label: "Nucleus Accumbens" },
      { cx: 190, cy: 118, label: "Striatum" },
      { cx: 130, cy: 92, label: "Prefrontal Cortex" },
    ],
  },
  {
    id: "serotonin",
    name: "Serotonin",
    color: "#a78bfa",
    colorDim: "#a78bfa22",
    regions: ["Raphe Nuclei", "Cortex (widespread)", "Limbic System", "Hippocampus", "Amygdala"],
    function: "Mood regulation, emotional stability, sleep, appetite, and social behavior. The 'wellbeing' neurotransmitter.",
    deficiency: "Depression, anxiety, insomnia, obsessive thoughts, increased aggression.",
    excess: "Serotonin syndrome (agitation, confusion, rapid heart rate, hyperthermia) — rare but dangerous.",
    disorders: ["Major Depression", "OCD", "Anxiety disorders", "PTSD", "Eating disorders"],
    paths: [
      "M 165 200 Q 158 185 150 168 Q 140 150 132 130 Q 122 108 118 88", // Raphe → Cortex
      "M 165 200 Q 172 185 178 170 Q 188 155 200 145 Q 212 135 218 125", // Raphe → Limbic
      "M 165 200 Q 162 183 160 165 Q 158 148 160 132 Q 162 118 168 108", // Raphe → Hippocampus
    ],
    dots: [
      { cx: 165, cy: 200, label: "Raphe Nuclei" },
      { cx: 116, cy: 86, label: "Cortex" },
      { cx: 220, cy: 123, label: "Amygdala" },
      { cx: 168, cy: 106, label: "Hippocampus" },
    ],
  },
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    color: "#60a5fa",
    colorDim: "#60a5fa22",
    regions: ["Locus Coeruleus", "Cortex", "Hippocampus", "Amygdala", "Cerebellum"],
    function: "Alertness, attention, arousal, and the fight-or-flight stress response. Modulates memory consolidation.",
    deficiency: "Brain fog, fatigue, low attention, poor working memory, depression.",
    excess: "Anxiety, hypervigilance, panic attacks, hypertension.",
    disorders: ["ADHD", "PTSD", "Depression", "Anxiety disorders", "Panic disorder"],
    paths: [
      "M 185 205 Q 170 190 155 172 Q 140 155 130 135 Q 120 115 115 92", // LC → Cortex
      "M 185 205 Q 178 188 172 170 Q 167 152 164 134 Q 162 118 164 105", // LC → Hippocampus
      "M 185 205 Q 192 190 198 175 Q 205 160 210 148 Q 215 135 218 125", // LC → Amygdala
      "M 185 205 Q 190 220 196 230 Q 205 240 215 245", // LC → Cerebellum
    ],
    dots: [
      { cx: 185, cy: 205, label: "Locus Coeruleus" },
      { cx: 113, cy: 90, label: "Cortex" },
      { cx: 164, cy: 104, label: "Hippocampus" },
      { cx: 218, cy: 124, label: "Amygdala" },
      { cx: 217, cy: 246, label: "Cerebellum" },
    ],
  },
  {
    id: "acetylcholine",
    name: "Acetylcholine",
    color: "#34d399",
    colorDim: "#34d39922",
    regions: ["Basal Forebrain", "Hippocampus", "Cortex", "Neuromuscular Junction"],
    function: "Attention, learning, memory formation, and arousal. Critical for REM sleep and muscle activation.",
    deficiency: "Memory impairment, attention deficits, muscle weakness, cognitive decline.",
    excess: "Muscle spasms, excessive secretions, bradycardia (nerve agent mechanism).",
    disorders: ["Alzheimer's disease", "Myasthenia gravis", "Lewy body dementia"],
    paths: [
      "M 148 185 Q 142 170 136 154 Q 130 136 126 116 Q 122 98 120 82", // BF → Cortex
      "M 148 185 Q 152 170 156 154 Q 160 138 162 122 Q 164 110 166 100", // BF → Hippocampus
      "M 148 185 Q 155 178 162 170 Q 172 160 180 152 Q 190 144 198 138", // BF → association cortex
    ],
    dots: [
      { cx: 148, cy: 185, label: "Basal Forebrain" },
      { cx: 118, cy: 80, label: "Cortex" },
      { cx: 166, cy: 98, label: "Hippocampus" },
      { cx: 200, cy: 136, label: "Association Cortex" },
    ],
  },
  {
    id: "gaba",
    name: "GABA",
    color: "#f87171",
    colorDim: "#f8717122",
    regions: ["Cortex (widespread)", "Cerebellum", "Basal Ganglia", "Hippocampus", "Thalamus"],
    function: "Primary inhibitory neurotransmitter. Reduces neural excitability, promotes calm and relaxation, prevents seizures.",
    deficiency: "Anxiety, seizures, insomnia, muscle tension, sensory overload.",
    excess: "Sedation, impaired coordination, memory suppression (benzodiazepine/alcohol effect).",
    disorders: ["Epilepsy", "Anxiety disorders", "Insomnia", "Huntington's disease"],
    paths: [
      "M 130 135 Q 125 118 120 100 Q 116 84 115 70", // Cortex
      "M 170 145 Q 175 130 180 115 Q 185 100 190 88", // Parietal cortex
      "M 195 165 Q 205 155 215 148 Q 225 140 232 132", // Basal Ganglia
      "M 168 160 Q 166 148 164 136 Q 162 124 162 112", // Hippocampus/Thalamus
      "M 200 215 Q 210 225 220 232 Q 228 238 235 242", // Cerebellum
    ],
    dots: [
      { cx: 113, cy: 68, label: "Cortex" },
      { cx: 190, cy: 86, label: "Cortex" },
      { cx: 234, cy: 130, label: "Basal Ganglia" },
      { cx: 162, cy: 110, label: "Thalamus" },
      { cx: 237, cy: 243, label: "Cerebellum" },
    ],
  },
  {
    id: "glutamate",
    name: "Glutamate",
    color: "#fde047",
    colorDim: "#fde04722",
    regions: ["Cortex (widespread)", "Hippocampus", "Thalamus", "Cerebellum", "Spinal Cord"],
    function: "Primary excitatory neurotransmitter. Essential for learning (LTP), memory, and virtually all brain activity.",
    deficiency: "Cognitive impairment, poor learning, reduced cortical activity.",
    excess: "Excitotoxicity — neurons fire excessively and die. Causes cell death after stroke, trauma.",
    disorders: ["Stroke (excitotoxic damage)", "ALS", "Alzheimer's disease", "Schizophrenia"],
    paths: [
      "M 140 108 Q 130 95 122 82 Q 114 70 112 60", // Cortex spread
      "M 168 110 Q 172 95 176 82 Q 180 70 184 60", // More cortex
      "M 200 120 Q 210 110 218 100 Q 226 90 230 80", // Parietal
      "M 162 115 Q 160 130 158 145 Q 156 158 154 170", // Hippocampus down
      "M 175 140 Q 185 150 195 158 Q 206 166 215 172", // Thalamus spread
    ],
    dots: [
      { cx: 110, cy: 58, label: "Cortex" },
      { cx: 184, cy: 58, label: "Cortex" },
      { cx: 230, cy: 78, label: "Parietal Cortex" },
      { cx: 153, cy: 172, label: "Hippocampus" },
      { cx: 217, cy: 173, label: "Thalamus" },
    ],
  },
];

// Brain silhouette path (side view, viewBox 0 0 320 260)
const BRAIN_OUTLINE =
  "M 80 220 Q 60 200 55 175 Q 50 150 58 128 Q 66 106 80 90 Q 95 72 115 60 Q 140 46 165 42 Q 195 38 220 48 Q 248 60 262 82 Q 278 106 278 132 Q 278 158 268 178 Q 258 196 240 208 Q 222 220 200 226 Q 178 232 155 232 Q 128 232 108 226 Z";

const BRAIN_GYRI = [
  "M 115 60 Q 120 52 130 50 Q 140 48 148 54 Q 155 60 152 70",
  "M 152 70 Q 158 62 168 58 Q 178 55 186 60 Q 192 66 190 76",
  "M 190 76 Q 196 66 208 64 Q 220 62 228 70 Q 234 78 230 88",
  "M 230 88 Q 240 80 252 82 Q 262 86 264 96 Q 265 106 258 112",
  "M 88 92 Q 96 82 108 80 Q 118 78 124 86 Q 128 94 124 104",
  "M 124 104 Q 130 92 142 90 Q 152 88 158 96 Q 162 104 158 114",
  "M 158 114 Q 164 100 176 98 Q 188 96 194 106 Q 198 116 194 126",
  "M 194 126 Q 202 114 214 112 Q 226 110 232 120 Q 236 130 230 140",
  "M 80 140 Q 84 128 96 126 Q 108 124 114 134 Q 118 144 114 154",
  "M 114 154 Q 120 140 132 138 Q 144 136 150 148 Q 154 158 150 170",
];

const BRAINSTEM = "M 148 228 Q 150 238 152 248 Q 153 255 155 258 Q 157 255 158 248 Q 160 238 162 228";
const CEREBELLUM = "M 235 210 Q 255 205 268 215 Q 278 226 275 240 Q 270 252 256 256 Q 242 260 228 254 Q 216 248 215 235 Q 215 222 225 215 Z";
const CEREBELLUM_LINES = [
  "M 228 220 Q 248 218 264 224",
  "M 224 230 Q 244 228 265 235",
  "M 222 240 Q 242 240 262 244",
];

export function NeurotransmitterMap() {
  const [selected, setSelected] = useState<string | null>("dopamine");

  const active = PATHWAYS.find((p) => p.id === selected) ?? null;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Neurotransmitter Pathways</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click a system to highlight its brain pathways and learn its role
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Brain SVG */}
        <div className="flex-1 bg-[#0d0d0d] flex flex-col items-center justify-center p-6">
          <svg viewBox="0 0 320 270" className="w-full max-w-sm" aria-label="Brain diagram">
            {/* Cerebellum */}
            <path d={CEREBELLUM} fill="#1a1a1a" stroke="#334155" strokeWidth="1.2" />
            {CEREBELLUM_LINES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#334155" strokeWidth="0.7" />
            ))}

            {/* Brainstem */}
            <path d={BRAINSTEM} fill="#1e293b" stroke="#334155" strokeWidth="1.2" />

            {/* Dim pathway fills when another is active */}
            {PATHWAYS.map((p) => {
              const isActive = selected === p.id;
              const isDimmed = selected !== null && !isActive;
              return (
                <g key={p.id}>
                  {p.paths.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={isActive ? 3 : 1.5}
                      strokeLinecap="round"
                      opacity={isDimmed ? 0.08 : isActive ? 1 : 0.35}
                      strokeDasharray={isActive ? "none" : "4 3"}
                    />
                  ))}
                  {p.dots.map((dot, i) => (
                    <g key={i}>
                      <circle
                        cx={dot.cx}
                        cy={dot.cy}
                        r={isActive ? 5 : 3}
                        fill={p.color}
                        opacity={isDimmed ? 0.06 : isActive ? 1 : 0.3}
                      />
                      {isActive && (
                        <circle
                          cx={dot.cx}
                          cy={dot.cy}
                          r={10}
                          fill={p.color}
                          opacity={0.15}
                        />
                      )}
                    </g>
                  ))}
                </g>
              );
            })}

            {/* Brain outline */}
            <path
              d={BRAIN_OUTLINE}
              fill="none"
              stroke={active ? active.color + "66" : "#334155"}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Gyri detail lines */}
            {BRAIN_GYRI.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#1e293b" strokeWidth="1" />
            ))}

            {/* Region labels when active */}
            {active &&
              active.dots.map((dot, i) => (
                <text
                  key={i}
                  x={dot.cx + (dot.cx > 160 ? 8 : -8)}
                  y={dot.cy - 8}
                  fill={active.color}
                  fontSize="7"
                  textAnchor={dot.cx > 160 ? "start" : "end"}
                  fontWeight="600"
                >
                  {dot.label}
                </text>
              ))}
          </svg>
        </div>

        {/* Right column: legend + details */}
        <div className="lg:w-72 flex flex-col border-t lg:border-t-0 lg:border-l border-border">
          {/* Legend buttons */}
          <div className="p-4 border-b border-border flex flex-col gap-1.5">
            {PATHWAYS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(selected === p.id ? null : p.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-all ${
                  selected === p.id
                    ? "bg-muted border border-border"
                    : "hover:bg-muted/50 border border-transparent"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: selected === p.id ? p.color : undefined }}
                >
                  {p.name}
                </span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {active ? (
            <div className="p-4 flex flex-col gap-3 text-xs flex-1 overflow-y-auto bg-[#0a0a0a]">
              <div>
                <span
                  className="text-base font-bold"
                  style={{ color: active.color }}
                >
                  {active.name}
                </span>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Key Regions</div>
                <div className="flex flex-wrap gap-1">
                  {active.regions.map((r) => (
                    <span
                      key={r}
                      className="px-1.5 py-0.5 rounded text-[10px]"
                      style={{ backgroundColor: active.colorDim, color: active.color }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Primary Function</div>
                <p className="text-foreground/80 leading-5">{active.function}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-border bg-muted/20 p-2">
                  <div className="text-[10px] text-amber-400/70 mb-1 font-semibold">Deficiency</div>
                  <p className="text-foreground/70 leading-4">{active.deficiency}</p>
                </div>
                <div className="rounded-md border border-border bg-muted/20 p-2">
                  <div className="text-[10px] text-red-400/70 mb-1 font-semibold">Excess</div>
                  <p className="text-foreground/70 leading-4">{active.excess}</p>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Related Disorders</div>
                <div className="flex flex-wrap gap-1">
                  {active.disorders.map((d) => (
                    <span
                      key={d}
                      className="px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[10px] text-foreground/70"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground text-xs bg-[#0a0a0a]">
              Select a neurotransmitter system to explore its pathways and functions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
