"use client";

import { useState } from "react";

// ─── Neuron Parts Data ─────────────────────────────────────────────────────────

interface NeuronPart {
  id: string;
  label: string;
  color: string;
  tagline: string;
  description: string;
  facts: string[];
}

const PARTS: NeuronPart[] = [
  {
    id: "dendrites",
    label: "Dendrites",
    color: "#60a5fa",
    tagline: "Receiving antennae of the neuron",
    description:
      "Dendrites are tree-like extensions that receive electrochemical signals from other neurons.",
    facts: [
      "A single neuron may have thousands of dendritic branches, each receiving input.",
      "Dendritic spines are tiny protrusions where synaptic connections form.",
      "Long-term potentiation (memory formation) involves strengthening dendritic synapses.",
    ],
  },
  {
    id: "soma",
    label: "Cell Body (Soma)",
    color: "#a78bfa",
    tagline: "Computational core of the neuron",
    description:
      "The soma integrates all incoming signals. If the sum exceeds the threshold, it fires.",
    facts: [
      "Contains the nucleus with DNA for protein synthesis.",
      "Integrates hundreds to thousands of simultaneous inputs.",
      "Also called the 'perikaryon'; size varies from 4–100+ micrometers.",
    ],
  },
  {
    id: "axon-hillock",
    label: "Axon Hillock",
    color: "#f472b6",
    tagline: "The decision point — fire or not?",
    description:
      "The axon hillock is where the soma meets the axon. Action potentials are initiated here if voltage exceeds –55 mV.",
    facts: [
      "Has the highest density of voltage-gated Na⁺ channels in the neuron.",
      "Acts as a threshold integrator — small inputs that don't sum to –55 mV are ignored.",
      "The site of signal initiation in most neurons.",
    ],
  },
  {
    id: "axon",
    label: "Axon",
    color: "#34d399",
    tagline: "The signal highway",
    description:
      "The axon conducts the action potential (electrical impulse) from the soma to the terminals.",
    facts: [
      "Can be as short as a fraction of a millimeter or as long as 1 meter (spinal cord motor neurons).",
      "In unmyelinated axons, signals travel at 0.5–2 m/s. In myelinated axons: up to 120 m/s.",
      "The axon is often called a 'nerve fiber'. A nerve is a bundle of many axons.",
    ],
  },
  {
    id: "myelin",
    label: "Myelin Sheath",
    color: "#fbbf24",
    tagline: "Biological insulation for speed",
    description:
      "Myelin is a fatty insulating layer wrapped around the axon by Schwann cells (PNS) or oligodendrocytes (CNS).",
    facts: [
      "Speeds up signal conduction by 50–100x compared to unmyelinated axons.",
      "Multiple sclerosis (MS) is caused by the immune system attacking the myelin sheath.",
      "Each Schwann cell wraps one segment; one oligodendrocyte can myelinate up to 50 axon segments.",
    ],
  },
  {
    id: "nodes",
    label: "Nodes of Ranvier",
    color: "#fb923c",
    tagline: "Gaps that enable saltatory conduction",
    description:
      "Nodes of Ranvier are unmyelinated gaps between myelin segments where the action potential regenerates.",
    facts: [
      "The action potential 'jumps' from node to node — called saltatory conduction (Latin: saltare = to jump).",
      "Each node is only ~1 μm wide, spaced ~1 mm apart.",
      "This jumping mechanism is why myelinated axons conduct so much faster.",
    ],
  },
  {
    id: "terminals",
    label: "Axon Terminals",
    color: "#f87171",
    tagline: "Neurotransmitter release sites",
    description:
      "Axon terminals (synaptic boutons) are the bulb-shaped endings that release neurotransmitters into the synapse.",
    facts: [
      "Contain hundreds of synaptic vesicles packed with neurotransmitter molecules.",
      "When an action potential arrives, voltage-gated Ca²⁺ channels open, triggering vesicle fusion.",
      "The presynaptic terminal and postsynaptic membrane are separated by the synaptic cleft (~20–40 nm).",
    ],
  },
];

// ─── SVG Layout Constants ──────────────────────────────────────────────────────
// Neuron runs left-to-right, viewBox 0 0 680 260

const SOMA_CX = 230;
const SOMA_CY = 130;
const SOMA_R = 38;

// Axon starts at right edge of soma, runs to x=580
const AXON_Y = SOMA_CY;
const AXON_START_X = SOMA_CX + SOMA_R + 2;
const AXON_END_X = 590;

// Myelin segments
const MYELIN_SEGS = [
  { x: 278, w: 48 },
  { x: 340, w: 48 },
  { x: 402, w: 48 },
  { x: 464, w: 48 },
];

// Node positions (gaps between myelin segs)
const NODE_XS = [329, 391, 453];

// Terminal boutons
const TERMINALS = [
  { cx: 610, cy: 95 },
  { cx: 618, cy: 125 },
  { cx: 610, cy: 155 },
  { cx: 600, cy: 175 },
];

// Dendrites (left side, extending from soma)
const DENDRITES = [
  { x1: SOMA_CX - 30, y1: SOMA_CY - 30, x2: 60, y2: 30 },
  { x1: SOMA_CX - 35, y1: SOMA_CY - 15, x2: 40, y2: 85 },
  { x1: SOMA_CX - 38, y1: SOMA_CY, x2: 30, y2: 130 },
  { x1: SOMA_CX - 35, y1: SOMA_CY + 15, x2: 40, y2: 175 },
  { x1: SOMA_CX - 30, y1: SOMA_CY + 30, x2: 60, y2: 220 },
];

// Sub-branches for each dendrite
const DENDRITE_BRANCHES = [
  { x1: 60, y1: 30, x2: 30, y2: 15 },
  { x1: 60, y1: 30, x2: 45, y2: 10 },
  { x1: 40, y1: 85, x2: 15, y2: 72 },
  { x1: 40, y1: 85, x2: 22, y2: 68 },
  { x1: 30, y1: 130, x2: 10, y2: 118 },
  { x1: 30, y1: 130, x2: 8, y2: 140 },
  { x1: 40, y1: 175, x2: 15, y2: 162 },
  { x1: 40, y1: 175, x2: 20, y2: 185 },
  { x1: 60, y1: 220, x2: 35, y2: 210 },
  { x1: 60, y1: 220, x2: 42, y2: 230 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function NeuronDiagram() {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const activePart = PARTS.find((p) => p.id === active);

  function toggle(id: string) {
    setActive((prev) => (prev === id ? null : id));
  }

  function partColor(id: string) {
    const part = PARTS.find((p) => p.id === id)!;
    if (active === id || hovered === id) return part.color;
    if (active !== null && active !== id) return part.color + "30";
    return part.color + "80";
  }

  function strokeWidth(id: string) {
    return active === id ? "2.5" : "1.5";
  }

  const dendColor = partColor("dendrites");
  const somaColor = partColor("soma");
  const hillockColor = partColor("axon-hillock");
  const axonColor = partColor("axon");
  const myelinColor = partColor("myelin");
  const nodesColor = partColor("nodes");
  const termColor = partColor("terminals");

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Neuron Anatomy Diagram
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click any part to learn about its structure and function
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* SVG */}
        <div className="flex-1 bg-[#0d0d0d] p-4 flex items-center justify-center">
          <svg
            viewBox="0 0 680 260"
            className="max-w-full"
            style={{ maxHeight: 360 }}
          >
            {/* ── Dendrites ─────────────────────────────────── */}
            <g
              className="cursor-pointer"
              onClick={() => toggle("dendrites")}
              onMouseEnter={() => setHovered("dendrites")}
              onMouseLeave={() => setHovered(null)}
            >
              {DENDRITES.map((d, i) => (
                <line
                  key={i}
                  x1={d.x1}
                  y1={d.y1}
                  x2={d.x2}
                  y2={d.y2}
                  stroke={dendColor}
                  strokeWidth={strokeWidth("dendrites")}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
              ))}
              {DENDRITE_BRANCHES.map((b, i) => (
                <line
                  key={i}
                  x1={b.x1}
                  y1={b.y1}
                  x2={b.x2}
                  y2={b.y2}
                  stroke={dendColor}
                  strokeWidth="1"
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
              ))}
              {/* dendritic spine dots */}
              {[
                [30, 15],
                [45, 10],
                [15, 72],
                [22, 68],
                [10, 118],
                [8, 140],
                [15, 162],
                [20, 185],
                [35, 210],
                [42, 230],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2.5"
                  fill={dendColor}
                  className="transition-all duration-200"
                />
              ))}
            </g>

            {/* ── Axon (background, full length) ────────────── */}
            <line
              x1={AXON_START_X}
              y1={AXON_Y}
              x2={AXON_END_X - 8}
              y2={AXON_Y}
              stroke={axonColor}
              strokeWidth={strokeWidth("axon")}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-200"
              onClick={() => toggle("axon")}
              onMouseEnter={() => setHovered("axon")}
              onMouseLeave={() => setHovered(null)}
            />

            {/* ── Myelin Sheath segments ─────────────────────── */}
            {MYELIN_SEGS.map((seg, i) => (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => toggle("myelin")}
                onMouseEnter={() => setHovered("myelin")}
                onMouseLeave={() => setHovered(null)}
              >
                <rect
                  x={seg.x}
                  y={AXON_Y - 10}
                  width={seg.w}
                  height={20}
                  rx="10"
                  fill={myelinColor + (active === "myelin" ? "" : "55")}
                  stroke={myelinColor}
                  strokeWidth={active === "myelin" ? "1.5" : "1"}
                  className="transition-all duration-200"
                />
              </g>
            ))}

            {/* ── Nodes of Ranvier ───────────────────────────── */}
            {NODE_XS.map((nx, i) => (
              <circle
                key={i}
                cx={nx}
                cy={AXON_Y}
                r="4"
                fill="#0d0d0d"
                stroke={nodesColor}
                strokeWidth={strokeWidth("nodes")}
                className="cursor-pointer transition-all duration-200"
                onClick={() => toggle("nodes")}
                onMouseEnter={() => setHovered("nodes")}
                onMouseLeave={() => setHovered(null)}
              />
            ))}

            {/* ── Axon Hillock ────────────────────────────────── */}
            <ellipse
              cx={SOMA_CX + SOMA_R + 12}
              cy={AXON_Y}
              rx={18}
              ry={12}
              fill={hillockColor + "55"}
              stroke={hillockColor}
              strokeWidth={strokeWidth("axon-hillock")}
              className="cursor-pointer transition-all duration-200"
              onClick={() => toggle("axon-hillock")}
              onMouseEnter={() => setHovered("axon-hillock")}
              onMouseLeave={() => setHovered(null)}
            />

            {/* ── Soma / Cell Body ────────────────────────────── */}
            <circle
              cx={SOMA_CX}
              cy={SOMA_CY}
              r={SOMA_R}
              fill={somaColor + "40"}
              stroke={somaColor}
              strokeWidth={strokeWidth("soma")}
              className="cursor-pointer transition-all duration-200"
              onClick={() => toggle("soma")}
              onMouseEnter={() => setHovered("soma")}
              onMouseLeave={() => setHovered(null)}
            />
            {/* Nucleus */}
            <circle
              cx={SOMA_CX - 4}
              cy={SOMA_CY}
              r={14}
              fill={somaColor + "30"}
              stroke={somaColor + "80"}
              strokeWidth="1"
              style={{ pointerEvents: "none" }}
            />
            <text
              x={SOMA_CX - 4}
              y={SOMA_CY + 4}
              fill={somaColor}
              fontSize="7"
              textAnchor="middle"
              style={{ pointerEvents: "none" }}
            >
              nucleus
            </text>

            {/* ── Axon Terminals ──────────────────────────────── */}
            {/* connecting lines */}
            {TERMINALS.map((t, i) => (
              <line
                key={i}
                x1={AXON_END_X - 8}
                y1={AXON_Y}
                x2={t.cx - 10}
                y2={t.cy}
                stroke={termColor}
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-200"
                onClick={() => toggle("terminals")}
                onMouseEnter={() => setHovered("terminals")}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            {TERMINALS.map((t, i) => (
              <circle
                key={i}
                cx={t.cx}
                cy={t.cy}
                r={10}
                fill={termColor + "50"}
                stroke={termColor}
                strokeWidth={strokeWidth("terminals")}
                className="cursor-pointer transition-all duration-200"
                onClick={() => toggle("terminals")}
                onMouseEnter={() => setHovered("terminals")}
                onMouseLeave={() => setHovered(null)}
              />
            ))}

            {/* ── Labels ──────────────────────────────────────── */}
            {[
              {
                id: "dendrites",
                x: 22,
                y: 250,
                label: "Dendrites",
                anchor: "middle" as const,
              },
              {
                id: "soma",
                x: SOMA_CX,
                y: SOMA_CY + SOMA_R + 14,
                label: "Soma",
                anchor: "middle" as const,
              },
              {
                id: "axon-hillock",
                x: SOMA_CX + SOMA_R + 12,
                y: AXON_Y + 24,
                label: "Axon Hillock",
                anchor: "middle" as const,
              },
              {
                id: "axon",
                x: 395,
                y: AXON_Y - 18,
                label: "Axon",
                anchor: "middle" as const,
              },
              {
                id: "myelin",
                x: 388,
                y: AXON_Y + 24,
                label: "Myelin Sheath",
                anchor: "middle" as const,
              },
              {
                id: "nodes",
                x: 391,
                y: AXON_Y - 10,
                label: "",
                anchor: "middle" as const,
              },
              {
                id: "terminals",
                x: 645,
                y: 138,
                label: "Axon Terminals",
                anchor: "middle" as const,
              },
            ]
              .filter((l) => l.label)
              .map(({ id, x, y, label, anchor }) => {
                const part = PARTS.find((p) => p.id === id)!;
                const isActive = active === id || hovered === id;
                return (
                  <text
                    key={id}
                    x={x}
                    y={y}
                    fill={isActive ? part.color : "#475569"}
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    textAnchor={anchor}
                    fontWeight={isActive ? "bold" : "normal"}
                    className="cursor-pointer transition-colors duration-200"
                    onClick={() => toggle(id)}
                  >
                    {label}
                  </text>
                );
              })}

            {/* Nodes of Ranvier label */}
            <text
              x={391}
              y={AXON_Y - 16}
              fill={active === "nodes" || hovered === "nodes" ? "#fb923c" : "#475569"}
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              textAnchor="middle"
              className="cursor-pointer transition-colors duration-200"
              onClick={() => toggle("nodes")}
            >
              Nodes of Ranvier
            </text>

            {/* Direction arrow */}
            <g style={{ pointerEvents: "none" }}>
              <text
                x={390}
                y={245}
                fill="#1e293b"
                fontSize="9"
                textAnchor="middle"
                fontFamily="ui-sans-serif"
              >
                ← Signal direction →
              </text>
              <line
                x1={340}
                y1={240}
                x2={280}
                y2={240}
                stroke="#1e293b"
                strokeWidth="1"
                markerEnd="url(#arrowLeft)"
              />
              <line
                x1={440}
                y1={240}
                x2={500}
                y2={240}
                stroke="#1e293b"
                strokeWidth="1"
                markerEnd="url(#arrowRight)"
              />
            </g>
          </svg>
        </div>

        {/* Info Panel */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] p-5 min-h-[240px] flex flex-col">
          {activePart ? (
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: activePart.color }}
                />
                <span className="text-sm font-semibold text-foreground">
                  {activePart.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                {activePart.tagline}
              </p>
              <p className="text-xs text-foreground/80 leading-5">
                {activePart.description}
              </p>
              <ul className="space-y-2 flex-1">
                {activePart.facts.map((fact, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-xs text-foreground/70 leading-5"
                  >
                    <span className="text-muted-foreground/40 shrink-0 mt-0.5">
                      →
                    </span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-6">
              <div className="text-5xl opacity-20">⚡</div>
              <p className="text-xs text-muted-foreground">
                Click any part of the neuron to explore its structure and
                function.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Part chips */}
      <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2 bg-[#0a0a0a]">
        {PARTS.map((part) => (
          <button
            key={part.id}
            onClick={() => toggle(part.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-mono border transition-all duration-150 ${
              active === part.id
                ? "border-current text-current bg-current/10"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
            style={
              active === part.id
                ? { color: part.color, borderColor: part.color }
                : {}
            }
          >
            {part.label}
          </button>
        ))}
      </div>
    </div>
  );
}
