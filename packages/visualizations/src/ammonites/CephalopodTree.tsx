"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  label: string;
  sublabel?: string;
  status: "living" | "extinct";
  color: string;
  x: number; // 0–1 relative position
  y: number; // depth level (0 = root)
  info: string;
  children?: string[];
  parent?: string;
}

// Tree laid out in a 500×280 SVG
// Root at top, leaves at bottom
const NODES: TreeNode[] = [
  {
    id: "cephalopoda",
    label: "Cephalopoda",
    sublabel: "class",
    status: "living",
    color: "#94a3b8",
    x: 0.5, y: 0,
    info: "Cephalopods evolved ~530 million years ago. The name means 'head-foot'. They are the most intelligent invertebrates on Earth.",
    children: ["nautiloidea", "ammonoidea", "coleoidea"],
  },
  {
    id: "nautiloidea",
    label: "Nautiloidea",
    sublabel: "nautiluses",
    status: "living",
    color: "#34d399",
    x: 0.15, y: 1,
    info: "Nautiloids first appeared ~490 Ma. Today only 6 living species remain in the Indo-Pacific. They are the closest living relative to ammonites.",
    children: [],
    parent: "cephalopoda",
  },
  {
    id: "ammonoidea",
    label: "Ammonoidea",
    sublabel: "ammonoids",
    status: "extinct",
    color: "#f59e0b",
    x: 0.5, y: 1,
    info: "Ammonoids span 334 million years (400–66 Ma). They include three major groups defined by their suture pattern complexity.",
    children: ["goniatitida", "ceratitida", "ammonitida"],
    parent: "cephalopoda",
  },
  {
    id: "coleoidea",
    label: "Coleoidea",
    sublabel: "squid, octopus, cuttlefish",
    status: "living",
    color: "#818cf8",
    x: 0.85, y: 1,
    info: "Coleoids evolved ~300 Ma. They abandoned the external shell in favour of speed and intelligence. Includes the largest invertebrate ever (giant squid).",
    children: [],
    parent: "cephalopoda",
  },
  {
    id: "goniatitida",
    label: "Goniatitida",
    sublabel: "simple sutures",
    status: "extinct",
    color: "#fbbf24",
    x: 0.32, y: 2,
    info: "Devonian to Permian. Earliest ammonoids, with angular goniatitic sutures. Survived the Late Devonian extinction only to be nearly wiped out at the end-Permian.",
    children: [],
    parent: "ammonoidea",
  },
  {
    id: "ceratitida",
    label: "Ceratitida",
    sublabel: "serrated lobes",
    status: "extinct",
    color: "#f97316",
    x: 0.5, y: 2,
    info: "Permian to Triassic. Recovered from the end-Permian extinction and dominated Triassic seas. Suture lobes are serrated, saddles smooth.",
    children: [],
    parent: "ammonoidea",
  },
  {
    id: "ammonitida",
    label: "Ammonitida",
    sublabel: "true ammonites",
    status: "extinct",
    color: "#ef4444",
    x: 0.68, y: 2,
    info: "Triassic to Cretaceous (235–66 Ma). True ammonites with highly complex ammonitic sutures. Most diverse and well-known ammonoid group. Extinct at K-Pg.",
    children: [],
    parent: "ammonoidea",
  },
];

const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));

// SVG dimensions
const W = 500, H = 270;
const PAD_X = 50, PAD_Y = 30;
const LEVEL_H = (H - PAD_Y * 2) / 2; // height per level
const NODE_R = 22;

function nodeXY(n: TreeNode): [number, number] {
  return [PAD_X + n.x * (W - PAD_X * 2), PAD_Y + n.y * LEVEL_H];
}

export function CephalopodTree() {
  const [active, setActive] = useState<string | null>(null);
  const activeNode = active ? NODE_MAP[active] : null;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Cephalopod Family Tree</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Where ammonites fit in the tree of life — click any group to learn more</p>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 bg-[#0d0d0d] flex items-center justify-center p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="max-w-full" style={{ maxHeight: H }}>
            {/* Edges */}
            {NODES.filter((n) => n.parent).map((n) => {
              const [x1, y1] = nodeXY(NODE_MAP[n.parent!]);
              const [x2, y2] = nodeXY(n);
              const mx = (x1 + x2) / 2;
              return (
                <path
                  key={`edge-${n.id}`}
                  d={`M${x1},${y1 + NODE_R} C${x1},${mx} ${x2},${y1 + NODE_R} ${x2},${y2 - NODE_R}`}
                  fill="none"
                  stroke={active === n.id || active === n.parent ? n.color : "#1e293b"}
                  strokeWidth={active === n.id || active === n.parent ? 2 : 1.5}
                  className="transition-colors duration-200"
                />
              );
            })}

            {/* Nodes */}
            {NODES.map((n) => {
              const [cx, cy] = nodeXY(n);
              const isActive = active === n.id;
              return (
                <g
                  key={n.id}
                  className="cursor-pointer"
                  onClick={() => setActive(isActive ? null : n.id)}
                >
                  <circle
                    cx={cx} cy={cy} r={NODE_R + (isActive ? 3 : 0)}
                    fill={isActive ? n.color + "30" : "#111"}
                    stroke={n.color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="transition-all duration-150"
                  />
                  {/* Living/extinct dot */}
                  <circle
                    cx={cx + NODE_R - 5} cy={cy - NODE_R + 5} r={4}
                    fill={n.status === "living" ? "#34d399" : "#f87171"}
                  />
                  <text x={cx} y={cy - 4} fill={isActive ? n.color : "#e2e8f0"} fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="ui-sans-serif, sans-serif">
                    {n.label}
                  </text>
                  {n.sublabel && (
                    <text x={cx} y={cy + 8} fill="#64748b" fontSize="7.5" textAnchor="middle" fontFamily="ui-monospace, monospace">
                      {n.sublabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Legend */}
            <g>
              <circle cx={PAD_X} cy={H - 12} r={4} fill="#34d399" />
              <text x={PAD_X + 8} y={H - 8} fill="#64748b" fontSize="8" fontFamily="monospace">living</text>
              <circle cx={PAD_X + 48} cy={H - 12} r={4} fill="#f87171" />
              <text x={PAD_X + 56} y={H - 8} fill="#64748b" fontSize="8" fontFamily="monospace">extinct</text>
            </g>
          </svg>
        </div>

        {/* Info panel */}
        <div className="md:w-60 border-t md:border-t-0 md:border-l border-border bg-[#0a0a0a] p-4 min-h-[140px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {activeNode ? (
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeNode.color }} />
                  <span className="text-xs font-semibold text-foreground">{activeNode.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeNode.status === "living" ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                    {activeNode.status}
                  </span>
                </div>
                <p className="text-xs text-foreground/75 leading-5">{activeNode.info}</p>
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground text-center"
              >
                Click any node to learn about that cephalopod group.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
