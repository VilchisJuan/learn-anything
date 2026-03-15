"use client";

import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface MemoryNode {
  id: string;
  label: string;
  sublabel?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  parent?: string;
  definition: string;
  brainRegion: string;
  example: string;
  classicStudy: string;
  depth: number; // 0 = root, 1 = branch, 2 = leaf
}

const NODES: MemoryNode[] = [
  {
    id: "memory",
    label: "Memory",
    color: "#e2e8f0",
    bgColor: "#1e293b",
    borderColor: "#475569",
    definition: "The cognitive system by which information is encoded, stored, and retrieved. Memory is not a single entity but a collection of systems serving different functions.",
    brainRegion: "Distributed across multiple brain regions — no single 'memory center'",
    example: "Everything you know, can do, and have experienced is stored as memory.",
    classicStudy: "William James (1890) first distinguished between primary memory (short-term) and secondary memory (long-term), laying the groundwork for modern memory research.",
    depth: 0,
  },
  {
    id: "explicit",
    label: "Explicit",
    sublabel: "Declarative",
    color: "#60a5fa",
    bgColor: "#1e3a5f",
    borderColor: "#3b82f6",
    parent: "memory",
    definition: "Conscious, intentional recollection of facts and events. You are aware you are remembering. Can be verbally described ('declared').",
    brainRegion: "Hippocampus (critical for formation), Medial temporal lobe, Prefrontal cortex",
    example: "Recalling your last birthday party or knowing that Paris is the capital of France.",
    classicStudy: "Patient H.M. (Henry Molaison): after bilateral hippocampal removal in 1953, he lost the ability to form new explicit memories while retaining old ones and implicit learning — the landmark study proving the hippocampus is essential for explicit memory.",
    depth: 1,
  },
  {
    id: "implicit",
    label: "Implicit",
    sublabel: "Non-Declarative",
    color: "#f59e0b",
    bgColor: "#3d2e0f",
    borderColor: "#d97706",
    parent: "memory",
    definition: "Unconscious memory that influences behavior without deliberate recollection. You use it without knowing you're 'remembering'.",
    brainRegion: "Striatum, Cerebellum, Amygdala, Neocortex — varies by type",
    example: "Riding a bicycle without thinking about each movement, or feeling uneasy in a place where you were once hurt.",
    classicStudy: "Warrington & Weiskrantz (1968): amnesic patients could learn new perceptual skills despite being unable to explicitly recall the learning sessions — demonstrating implicit memory's independence from explicit systems.",
    depth: 1,
  },
  {
    id: "episodic",
    label: "Episodic",
    sublabel: "Personal events",
    color: "#818cf8",
    bgColor: "#1e1b4b",
    borderColor: "#6366f1",
    parent: "explicit",
    definition: "Memory for personally experienced events anchored in time and place. The 'mental time travel' system — allows you to re-experience past episodes.",
    brainRegion: "Hippocampus (especially CA1 and subiculum), Prefrontal cortex, Temporal lobes",
    example: "Remembering your first day of school — the smell, the people, the feelings — as a re-lived experience.",
    classicStudy: "Endel Tulving (1972) coined the term 'episodic memory' and distinguished it from semantic memory. He showed episodic memory involves conscious re-experiencing ('remembering') vs. mere knowing.",
    depth: 2,
  },
  {
    id: "semantic",
    label: "Semantic",
    sublabel: "Facts & knowledge",
    color: "#38bdf8",
    bgColor: "#0c2a3d",
    borderColor: "#0ea5e9",
    parent: "explicit",
    definition: "Memory for general facts, concepts, and world knowledge, divorced from personal experience. Knowing without necessarily remembering how you learned it.",
    brainRegion: "Anterior temporal lobes, Neocortex (distributed), Left temporal lobe for language",
    example: "Knowing that water boils at 100°C, or that dogs are mammals — without recalling when or where you learned this.",
    classicStudy: "Patient K.C. (studied by Tulving): after severe brain injury, he lost all episodic memory but retained significant semantic knowledge — proof that episodic and semantic memory can dissociate.",
    depth: 2,
  },
  {
    id: "procedural",
    label: "Procedural",
    sublabel: "Skills & habits",
    color: "#fb923c",
    bgColor: "#3d1f0f",
    borderColor: "#f97316",
    parent: "implicit",
    definition: "Memory for how to perform skilled actions and habits. Acquired through repetition and practice. Typically becomes automatic and resistant to loss.",
    brainRegion: "Striatum (basal ganglia), Supplementary motor area, Cerebellum, Motor cortex",
    example: "Typing on a keyboard, playing piano, riding a bike, tying your shoes.",
    classicStudy: "Patient H.M.: despite severe amnesia, he showed normal learning of mirror-drawing tasks over days — demonstrating procedural memory operates independently of the hippocampus.",
    depth: 2,
  },
  {
    id: "priming",
    label: "Priming",
    sublabel: "Perceptual / conceptual",
    color: "#f59e0b",
    bgColor: "#3d2e0f",
    borderColor: "#d97706",
    parent: "implicit",
    definition: "Exposure to a stimulus influences the response to a subsequent stimulus, without conscious awareness. Prior experience speeds up processing or biases choices.",
    brainRegion: "Neocortex (perceptual areas: visual, auditory cortex), Right temporal lobe",
    example: "After reading the word 'doctor,' you identify 'nurse' faster than 'bread' — the concept is already activated.",
    classicStudy: "Tulving & Schacter (1990): amnesic patients showed normal perceptual priming effects on word-stem completion tasks despite being unable to explicitly recall the words — establishing priming as a distinct implicit system.",
    depth: 2,
  },
  {
    id: "conditioning",
    label: "Conditioning",
    sublabel: "Classical / operant",
    color: "#34d399",
    bgColor: "#0d2e22",
    borderColor: "#10b981",
    parent: "implicit",
    definition: "Learning associations between stimuli (classical) or between actions and outcomes (operant). Forms the basis of behavioral habits and emotional responses.",
    brainRegion: "Amygdala (fear/emotional), Cerebellum (timing), Striatum (reward-based operant)",
    example: "Feeling anxious before a doctor's appointment (classical), or checking your phone repeatedly because it's sometimes rewarding (operant).",
    classicStudy: "Bechara et al. (1995): patients with amygdala damage failed to acquire fear conditioning even with intact hippocampi, while hippocampal patients showed normal conditioning — proving the amygdala's specific role in emotional conditioning.",
    depth: 2,
  },
];

// ─── Layout calculation ────────────────────────────────────────────────────────

// SVG layout constants
const SVG_W = 680;
const SVG_H = 320;
const NODE_W = 110;
const NODE_H = 44;
const DEPTH_X: Record<number, number> = { 0: 40, 1: 220, 2: 450 };

// Position for each node (y center)
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  memory:      { x: DEPTH_X[0], y: SVG_H / 2 },
  explicit:    { x: DEPTH_X[1], y: SVG_H * 0.27 },
  implicit:    { x: DEPTH_X[1], y: SVG_H * 0.73 },
  episodic:    { x: DEPTH_X[2], y: SVG_H * 0.14 },
  semantic:    { x: DEPTH_X[2], y: SVG_H * 0.36 },
  procedural:  { x: DEPTH_X[2], y: SVG_H * 0.55 },
  priming:     { x: DEPTH_X[2], y: SVG_H * 0.73 },
  conditioning:{ x: DEPTH_X[2], y: SVG_H * 0.89 },
};

function getEdges() {
  const edges: { from: string; to: string; color: string }[] = [];
  for (const node of NODES) {
    if (node.parent) {
      const parent = NODES.find((n) => n.id === node.parent)!;
      edges.push({ from: node.parent, to: node.id, color: parent.color });
    }
  }
  return edges;
}

function edgePath(fromId: string, toId: string) {
  const from = NODE_POSITIONS[fromId];
  const to = NODE_POSITIONS[toId];
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
}

const EDGES = getEdges();

// ─── Component ─────────────────────────────────────────────────────────────────

export function MemoryTypesChart() {
  const [selected, setSelected] = useState<string | null>("episodic");

  const activeNode = NODES.find((n) => n.id === selected) ?? null;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Taxonomy of Human Memory Systems</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click any node to explore its definition, brain region, and classic research
        </p>
      </div>

      <div className="flex flex-col xl:flex-row">
        {/* Tree SVG */}
        <div className="flex-1 bg-[#0d0d0d] p-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full"
            style={{ minWidth: 480, height: 280 }}
          >
            {/* Edges */}
            {EDGES.map((e) => {
              const isHighlighted =
                selected === e.from || selected === e.to ||
                // highlight chain to root
                (activeNode?.parent === e.to && selected === e.from) ||
                (activeNode?.id === e.to);
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(e.from, e.to)}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={isHighlighted ? 2 : 1}
                  opacity={selected && !isHighlighted ? 0.12 : 0.6}
                />
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const pos = NODE_POSITIONS[node.id];
              const isSelected = selected === node.id;
              const isDimmed = selected !== null && !isSelected;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelected(isSelected ? null : node.id)}
                  className="cursor-pointer"
                  opacity={isDimmed ? 0.35 : 1}
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <rect
                      x={-3}
                      y={-3}
                      width={NODE_W + 6}
                      height={NODE_H + 6}
                      rx={9}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={1.5}
                      opacity={0.6}
                    />
                  )}
                  <rect
                    x={0}
                    y={0}
                    width={NODE_W}
                    height={NODE_H}
                    rx={7}
                    fill={node.bgColor}
                    stroke={node.borderColor}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <text
                    x={NODE_W / 2}
                    y={node.sublabel ? 16 : 26}
                    fill={node.color}
                    fontSize={node.depth === 0 ? 13 : 11}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={NODE_W / 2}
                      y={30}
                      fill={node.color}
                      fontSize="9"
                      fontWeight="400"
                      opacity={0.7}
                      textAnchor="middle"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="xl:w-80 border-t xl:border-t-0 xl:border-l border-border bg-[#0a0a0a] flex flex-col">
          {activeNode ? (
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: activeNode.color }}
                >
                  {activeNode.label}
                  {activeNode.sublabel && (
                    <span className="text-sm font-normal ml-2 opacity-70">
                      ({activeNode.sublabel})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Definition</div>
                <p className="text-xs text-foreground/80 leading-5">{activeNode.definition}</p>
              </div>

              <div className="rounded-md border border-border bg-muted/10 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Brain Region</div>
                <p className="text-xs leading-5" style={{ color: activeNode.color + "cc" }}>
                  {activeNode.brainRegion}
                </p>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Example</div>
                <p className="text-xs text-foreground/70 leading-5 italic">"{activeNode.example}"</p>
              </div>

              <div className="rounded-md border p-3 text-xs leading-5" style={{ borderColor: activeNode.borderColor + "40", backgroundColor: activeNode.bgColor + "66" }}>
                <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: activeNode.color + "99" }}>
                  Classic Research
                </div>
                <p className="text-foreground/75">{activeNode.classicStudy}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground text-xs">
              Click any node in the tree to explore that memory system
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
