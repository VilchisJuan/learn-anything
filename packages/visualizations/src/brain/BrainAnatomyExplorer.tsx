"use client";

import { useState } from "react";

// ─── Region Data ───────────────────────────────────────────────────────────────

interface BrainRegion {
  id: string;
  label: string;
  color: string;
  activeColor: string;
  functions: string[];
  didYouKnow: string;
}

const REGIONS: BrainRegion[] = [
  {
    id: "frontal",
    label: "Frontal Lobe",
    color: "#7c3aed40",
    activeColor: "#7c3aed",
    functions: [
      "Executive decision-making and planning",
      "Personality and social behavior",
      "Motor planning and voluntary movement",
      "Working memory and attention",
      "Speech production (Broca's area)",
    ],
    didYouKnow:
      "The frontal lobe is the last brain region to fully mature — it isn't complete until around age 25. This explains why teenagers are prone to impulsive decisions.",
  },
  {
    id: "parietal",
    label: "Parietal Lobe",
    color: "#0891b240",
    activeColor: "#0891b2",
    functions: [
      "Integrates sensory information from the body",
      "Spatial awareness and navigation",
      "Reading and arithmetic processing",
      "Perceiving pain, temperature, and touch",
    ],
    didYouKnow:
      'Damage to the right parietal lobe can cause "hemispatial neglect" — the patient completely ignores the left side of their visual world, even their own left arm.',
  },
  {
    id: "temporal",
    label: "Temporal Lobe",
    color: "#d9770640",
    activeColor: "#d97706",
    functions: [
      "Auditory processing and sound recognition",
      "Language comprehension (Wernicke's area)",
      "Memory consolidation via the hippocampus",
      "Face and object recognition",
    ],
    didYouKnow:
      "Stimulating the temporal lobe during surgery can trigger vivid flashback memories, as if replaying a video — discovered by neurosurgeon Wilder Penfield in the 1950s.",
  },
  {
    id: "occipital",
    label: "Occipital Lobe",
    color: "#15803d40",
    activeColor: "#15803d",
    functions: [
      "Primary visual cortex — receives raw visual input",
      "Processing color, shape, and motion",
      "Object recognition and visual interpretation",
      "Visual-spatial processing",
    ],
    didYouKnow:
      "The occipital lobe represents your visual field in an inverted, split map: left visual field → right lobe and vice versa. The top of the image maps to the bottom of the lobe.",
  },
  {
    id: "cerebellum",
    label: "Cerebellum",
    color: "#b4534940",
    activeColor: "#b45349",
    functions: [
      "Balance and postural control",
      "Coordination of voluntary movements",
      "Fine motor control and precision",
      "Motor learning (e.g. learning to ride a bike)",
    ],
    didYouKnow:
      "Despite occupying only 10% of brain volume, the cerebellum contains roughly 50% of all neurons in the entire brain — an astonishing density packed into its tightly folded cortex.",
  },
  {
    id: "brainstem",
    label: "Brainstem",
    color: "#64748b40",
    activeColor: "#64748b",
    functions: [
      "Controls breathing and heart rate",
      "Regulates consciousness and arousal (reticular formation)",
      "Controls reflexes: swallowing, coughing, vomiting",
      "Relays signals between brain and spinal cord",
    ],
    didYouKnow:
      "The brainstem is evolutionarily the oldest brain structure — sometimes called the 'reptilian brain'. It operates entirely without conscious input. You cannot choose to stop your heartbeat.",
  },
  {
    id: "corpus-callosum",
    label: "Corpus Callosum",
    color: "#a78bfa40",
    activeColor: "#a78bfa",
    functions: [
      "The main highway connecting left and right hemispheres",
      "Synchronizes activity between the two sides",
      "Enables unified perception despite split processing",
      "Contains ~250 million nerve fibers",
    ],
    didYouKnow:
      "Severing the corpus callosum (used to treat severe epilepsy) creates 'split-brain' patients — their two hemispheres literally don't know what the other is doing, producing bizarre behavior under testing.",
  },
  {
    id: "limbic",
    label: "Limbic System / Hippocampus",
    color: "#f472b640",
    activeColor: "#f472b6",
    functions: [
      "Memory formation and consolidation (hippocampus)",
      "Emotional responses and regulation (amygdala)",
      "Motivation and reward processing",
      "Linking emotions to memories",
    ],
    didYouKnow:
      'Patient H.M. (Henry Molaison) had his hippocampus surgically removed in 1953 to treat epilepsy. He could no longer form any new long-term memories — every morning was, for him, still 1953.',
  },
];

// ─── SVG Brain Paths ───────────────────────────────────────────────────────────
// Side-view (lateral) simplified brain, viewBox 0 0 500 380

// Outer brain outline (silhouette) — not clickable, just the border
const BRAIN_OUTLINE =
  "M 90,280 C 55,260 30,220 28,175 C 26,120 50,75 90,52 C 130,28 175,20 220,18 C 280,16 340,28 385,65 C 420,95 440,135 438,178 C 436,220 415,255 390,272 C 375,282 360,288 345,290 C 320,295 310,288 295,284 C 278,280 265,275 248,278 C 232,281 222,292 205,295 C 185,298 160,290 140,284 Z";

// SVG region shapes — simplified polygons/paths for each brain area
const REGION_PATHS: Record<string, string> = {
  frontal:
    "M 90,52 C 130,28 175,20 220,18 C 240,17 260,20 278,28 C 270,80 255,125 240,155 C 210,150 180,145 155,148 C 130,130 100,100 90,52 Z",
  parietal:
    "M 278,28 C 320,38 360,55 390,85 C 410,108 425,138 428,168 C 400,172 370,172 340,168 C 310,162 290,155 278,148 C 265,128 268,75 278,28 Z",
  temporal:
    "M 90,280 C 55,260 30,220 28,175 C 26,140 38,108 55,85 C 75,100 90,128 100,155 C 110,180 115,215 110,240 C 105,262 98,272 90,280 Z",
  occipital:
    "M 390,272 C 415,255 435,222 438,190 C 420,185 395,182 375,182 C 360,182 345,184 340,188 C 342,215 355,248 370,268 Z",
  cerebellum:
    "M 345,290 C 360,288 375,282 390,272 C 370,268 355,248 340,188 C 330,195 318,205 310,220 C 305,240 310,268 323,282 Z",
  brainstem:
    "M 205,295 C 185,298 165,290 148,285 C 148,310 155,335 165,355 C 178,355 195,352 208,348 C 210,330 208,312 205,295 Z",
  "corpus-callosum":
    "M 155,148 C 180,145 210,150 240,155 C 260,158 278,148 278,148 C 268,160 255,170 240,175 C 215,178 185,175 165,170 C 157,165 155,155 155,148 Z",
  limbic:
    "M 165,170 C 185,175 215,178 240,175 C 245,185 242,198 235,208 C 218,220 195,222 178,218 C 165,210 160,195 162,182 Z",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BrainAnatomyExplorer() {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const activeRegion = REGIONS.find((r) => r.id === active);

  function toggle(id: string) {
    setActive((prev) => (prev === id ? null : id));
  }

  function getRegionFill(id: string) {
    const region = REGIONS.find((r) => r.id === id)!;
    if (active === id || hovered === id) {
      return region.activeColor + "90";
    }
    if (active !== null && active !== id) {
      return region.color.slice(0, 7) + "15";
    }
    return region.color;
  }

  function getRegionStroke(id: string) {
    const region = REGIONS.find((r) => r.id === id)!;
    if (active === id) return region.activeColor;
    if (hovered === id) return region.activeColor + "cc";
    return region.activeColor + "40";
  }

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Brain Anatomy Explorer
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click any region to explore its functions and key facts
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* SVG Diagram */}
        <div className="flex-1 flex items-center justify-center p-4 bg-[#0d0d0d]">
          <svg
            viewBox="0 0 500 380"
            className="max-w-full"
            style={{ maxHeight: 420 }}
          >
            {/* Brain outer silhouette background */}
            <path
              d={BRAIN_OUTLINE}
              fill="#1a1a2e"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Brain regions */}
            {REGIONS.map((region) => {
              const pathD = REGION_PATHS[region.id];
              if (!pathD) return null;
              return (
                <g key={region.id}>
                  <path
                    d={pathD}
                    fill={getRegionFill(region.id)}
                    stroke={getRegionStroke(region.id)}
                    strokeWidth={active === region.id ? "2" : "1"}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => toggle(region.id)}
                    onMouseEnter={() => setHovered(region.id)}
                    onMouseLeave={() => setHovered(null)}
                  />
                </g>
              );
            })}

            {/* Brain outer silhouette — drawn on top as border */}
            <path
              d={BRAIN_OUTLINE}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: "none" }}
            />

            {/* Sulci / cortex texture lines */}
            <g
              stroke="#ffffff08"
              strokeWidth="1.2"
              fill="none"
              style={{ pointerEvents: "none" }}
            >
              <path d="M 145,55 C 150,80 148,110 145,135" />
              <path d="M 185,30 C 190,55 188,85 185,115" />
              <path d="M 225,22 C 228,50 226,82 222,112" />
              <path d="M 265,25 C 268,55 270,88 268,118" />
              <path d="M 310,40 C 315,68 318,100 315,130" />
              <path d="M 355,62 C 360,88 363,118 360,148" />
              <path d="M 60,120 C 75,135 88,155 95,175" />
              <path d="M 45,160 C 60,170 75,185 82,205" />
            </g>

            {/* Region labels */}
            {[
              { id: "frontal", x: 170, y: 78, anchor: "middle" },
              { id: "parietal", x: 355, y: 105, anchor: "middle" },
              { id: "temporal", x: 55, y: 195, anchor: "middle" },
              { id: "occipital", x: 415, y: 230, anchor: "middle" },
              { id: "cerebellum", x: 358, y: 252, anchor: "middle" },
              { id: "brainstem", x: 178, y: 328, anchor: "middle" },
              {
                id: "corpus-callosum",
                x: 218,
                y: 160,
                anchor: "middle",
              },
              { id: "limbic", x: 205, y: 200, anchor: "middle" },
            ].map(({ id, x, y, anchor }) => {
              const region = REGIONS.find((r) => r.id === id)!;
              const isActive = active === id || hovered === id;
              const shortLabel =
                id === "corpus-callosum"
                  ? "Corp. Callosum"
                  : id === "limbic"
                    ? "Limbic / Hippo."
                    : region.label;
              return (
                <text
                  key={id}
                  x={x}
                  y={y}
                  fill={isActive ? region.activeColor : "#64748b"}
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                  textAnchor={anchor as "middle"}
                  fontWeight={isActive ? "bold" : "normal"}
                  className="cursor-pointer transition-colors duration-200"
                  style={{ pointerEvents: "none" }}
                >
                  {shortLabel}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Info Panel */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] p-5 min-h-[240px] flex flex-col">
          {activeRegion ? (
            <div className="flex flex-col gap-3 flex-1">
              {/* Title */}
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: activeRegion.activeColor }}
                />
                <span className="text-sm font-semibold text-foreground">
                  {activeRegion.label}
                </span>
              </div>

              {/* Functions */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Primary Functions
                </p>
                <ul className="space-y-1.5">
                  {activeRegion.functions.map((fn, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-xs text-foreground/80 leading-5"
                    >
                      <span
                        className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: activeRegion.activeColor }}
                      />
                      <span>{fn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Did you know */}
              <div className="mt-auto rounded-md border border-border bg-muted/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Did you know?
                </p>
                <p className="text-xs text-foreground/75 leading-5">
                  {activeRegion.didYouKnow}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-6">
              <div className="text-5xl opacity-20">🧠</div>
              <p className="text-xs text-muted-foreground">
                Click any region on the diagram to explore its functions and
                facts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Region chips */}
      <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2 bg-[#0a0a0a]">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => toggle(region.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-mono border transition-all duration-150 ${
              active === region.id
                ? "border-current text-current bg-current/10"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
            style={
              active === region.id
                ? {
                    color: region.activeColor,
                    borderColor: region.activeColor,
                  }
                : {}
            }
          >
            {region.label}
          </button>
        ))}
      </div>
    </div>
  );
}
