"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Spiral Math ──────────────────────────────────────────────────────────────
// Logarithmic spiral: r = A · e^(B·θ)
// Whorl Expansion Ratio WER = e^(2π·B) ≈ 3.97 — typical for many ammonites
const A = 10, B = 0.22;
const CX = 240, CY = 175; // SVG center
const TWO_PI = 2 * Math.PI;

function spiralR(theta: number) { return A * Math.exp(B * theta); }

function pt(theta: number): [number, number] {
  const rad = spiralR(theta);
  return [CX + rad * Math.cos(theta), CY - rad * Math.sin(theta)];
}

// Inner wall of whorl at theta = outer wall of previous whorl
function innerPt(theta: number): [number, number] { return pt(theta - TWO_PI); }

function arcPath(t1: number, t2: number, n = 100): string {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = t1 + (t2 - t1) * (i / n);
    const [x, y] = pt(t);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

// Closed region between outer arc t1→t2 and the inner wall reversed
function regionPath(t1: number, t2: number, n = 80): string {
  const fwd = Array.from({ length: n + 1 }, (_, i) => {
    const t = t1 + (t2 - t1) * (i / n);
    const [x, y] = pt(t);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const back = Array.from({ length: n + 1 }, (_, i) => {
    const t = t2 - (t2 - t1) * (i / n);
    const [x, y] = innerPt(t);
    return `L${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return [...fwd, ...back, "Z"].join(" ");
}

// Inner whorls: outer arc 0→2π closed with start point
function innerWhorlsPath(): string {
  const fwd = Array.from({ length: 101 }, (_, i) => {
    const t = (i / 100) * TWO_PI;
    const [x, y] = pt(t);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  });
  // Close with tiny inner whorls (spiral inward to center)
  const back = Array.from({ length: 101 }, (_, i) => {
    const t = TWO_PI - (i / 100) * TWO_PI;
    const r2 = spiralR(t) * 0.35; // inner spiral approximation
    const [x, y] = [CX + r2 * Math.cos(t), CY - r2 * Math.sin(t)];
    return `L${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return [...fwd, ...back, "Z"].join(" ");
}

// ─── Anatomy Data ─────────────────────────────────────────────────────────────

const SEPTA_THETAS = [2.1, 2.35, 2.6, 2.85, 3.05, 3.2].map((x) => x * Math.PI);
const BODY_START = 3.2 * Math.PI;
const SHELL_END = 4 * Math.PI;

const CHAMBER_REGIONS: [number, number][] = [
  [TWO_PI, 2.1 * Math.PI],
  [2.1 * Math.PI, 2.35 * Math.PI],
  [2.35 * Math.PI, 2.6 * Math.PI],
  [2.6 * Math.PI, 2.85 * Math.PI],
  [2.85 * Math.PI, 3.05 * Math.PI],
  [3.05 * Math.PI, BODY_START],
];

const CHAMBER_COLORS = ["#78350f", "#92400e", "#7c2d12", "#b45309", "#78350f", "#9a3412"];

interface Part {
  id: string;
  label: string;
  color: string;
  tagline: string;
  facts: string[];
}

const PARTS: Part[] = [
  {
    id: "aperture",
    label: "Aperture",
    color: "#fbbf24",
    tagline: "The shell's living opening",
    facts: [
      "The aperture is where the animal's soft body extended — tentacles, eyes, siphon funnel.",
      "Shape is highly variable: simple, constricted, lipped, or protected by jaw-like aptychi.",
      "Palaeontologists use aperture shape as a key species identification feature.",
      "Some species had elaborate ornaments (spines, ribs, tubercles) around the aperture.",
    ],
  },
  {
    id: "body-chamber",
    label: "Body Chamber",
    color: "#34d399",
    tagline: "Where the animal lived",
    facts: [
      "The body chamber housed all of the animal's soft tissues.",
      "Always the final and largest chamber — it was never sealed by a septum.",
      "Occupies roughly the last ½ to ¾ revolution of the shell in most species.",
      "The body chamber / phragmocone boundary is marked by the last septum.",
    ],
  },
  {
    id: "phragmocone",
    label: "Phragmocone",
    color: "#f59e0b",
    tagline: "The buoyancy engine — gas-filled chambers",
    facts: [
      "The phragmocone (\"frag-MOH-cone\") is the series of sealed, gas-filled chambers.",
      "As the animal grew, it secreted a new septum and moved its body forward.",
      "Each chamber was progressively emptied of fluid and filled with gas via the siphuncle.",
      "This buoyancy system worked like a submarine's ballast tanks — but biological.",
    ],
  },
  {
    id: "septa",
    label: "Septa",
    color: "#a78bfa",
    tagline: "Curved walls dividing the chambers",
    facts: [
      "Septa (singular: septum) are the internal walls that separate adjacent chambers.",
      "They are NOT flat — they are deeply curved, like saddle surfaces.",
      "The complex shape increases structural strength, resisting implosion under water pressure.",
      "Where the septum meets the outer shell wall, it creates the visible suture line pattern.",
      "Suture complexity increased over evolutionary time: goniatitic → ceratitic → ammonitic.",
    ],
  },
  {
    id: "siphuncle",
    label: "Siphuncle",
    color: "#f87171",
    tagline: "The living tube connecting all chambers",
    facts: [
      "The siphuncle is a thin tube of living tissue threading through all chambers.",
      "It passes through a small hole (foramen) in each septum.",
      "The siphuncle secreted or absorbed fluid to change the gas/liquid ratio in each chamber.",
      "In ammonoids, the siphuncle runs near the OUTER (ventral) wall — unlike nautiloids (central).",
      "Its position is a key feature distinguishing ammonoid groups from nautiloids.",
    ],
  },
  {
    id: "umbilicus",
    label: "Umbilicus",
    color: "#94a3b8",
    tagline: "The central depression revealing inner whorls",
    facts: [
      "The umbilicus is the open or filled central axis of the coiled shell.",
      "Wide umbilicus = 'evolute' coiling (outer whorls don't overlap inner ones much).",
      "Narrow/closed umbilicus = 'involute' coiling (outer whorl wraps tightly over inner ones).",
      "The umbilical ratio (width / total diameter) is a key measurement for species identification.",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AmmoniteAnatomyDiagram() {
  const [active, setActive] = useState<string | null>(null);

  const activePart = PARTS.find((p) => p.id === active);

  const paths = useMemo(() => {
    const innerWhorls = innerWhorlsPath();
    const bodyChamber = regionPath(BODY_START, SHELL_END);
    const chambers = CHAMBER_REGIONS.map(([t1, t2]) => regionPath(t1, t2));
    const outerShell = arcPath(0, SHELL_END, 200);
    const innerWall = (() => {
      return Array.from({ length: 101 }, (_, i) => {
        const t = TWO_PI + (i / 100) * (SHELL_END - TWO_PI);
        const [x, y] = innerPt(t);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(" ");
    })();

    const septa = SEPTA_THETAS.map((theta) => {
      const [ox, oy] = pt(theta);
      const [ix, iy] = innerPt(theta);
      return { ox, oy, ix, iy };
    });

    // Siphuncle dots: 78% from inner toward outer (near ventral/outer wall)
    const siphuncle = SEPTA_THETAS.map((theta) => {
      const [ox, oy] = pt(theta);
      const [ix, iy] = innerPt(theta);
      return { x: ix + 0.78 * (ox - ix), y: iy + 0.78 * (oy - iy) };
    });

    return { innerWhorls, bodyChamber, chambers, outerShell, innerWall, septa, siphuncle };
  }, []);

  const dim = (id: string) =>
    active !== null && active !== id ? "opacity-20" : "opacity-100";

  function toggle(id: string) {
    setActive((prev) => (prev === id ? null : id));
  }

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Ammonite Anatomy — Cross Section</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Click any label to highlight and learn about each part</p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* SVG diagram */}
        <div className="flex-1 flex items-center justify-center p-4 bg-[#0d0d0d]">
          <svg
            viewBox="0 0 520 340"
            className="max-w-full"
            style={{ maxHeight: 442 }}
          >
            {/* Inner whorls / umbilicus */}
            <path
              d={paths.innerWhorls}
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1"
              className={`cursor-pointer transition-opacity duration-200 ${dim("umbilicus")}`}
              onClick={() => toggle("umbilicus")}
            />
            {active === "umbilicus" && (
              <path d={paths.innerWhorls} fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
            )}

            {/* Phragmocone chambers */}
            {paths.chambers.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={CHAMBER_COLORS[i % CHAMBER_COLORS.length] + "40"}
                stroke="none"
                className={`cursor-pointer transition-opacity duration-200 ${dim("phragmocone")}`}
                onClick={() => toggle("phragmocone")}
              />
            ))}
            {active === "phragmocone" &&
              paths.chambers.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
              ))}

            {/* Body chamber */}
            <path
              d={paths.bodyChamber}
              fill="#06554040"
              stroke="none"
              className={`cursor-pointer transition-opacity duration-200 ${dim("body-chamber")}`}
              onClick={() => toggle("body-chamber")}
            />
            {active === "body-chamber" && (
              <path d={paths.bodyChamber} fill="none" stroke="#34d399" strokeWidth="2" opacity="0.6" />
            )}

            {/* Outer shell wall */}
            <path
              d={paths.outerShell}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Inner wall of outermost whorl */}
            <path d={paths.innerWall} fill="none" stroke="#64748b" strokeWidth="1.2" />

            {/* Septa */}
            {paths.septa.map((s, i) => (
              <line
                key={i}
                x1={s.ox} y1={s.oy} x2={s.ix} y2={s.iy}
                stroke="#a78bfa"
                strokeWidth="1.5"
                className={`cursor-pointer transition-opacity duration-200 ${
                  active && active !== "septa" && active !== "phragmocone" ? "opacity-20" : "opacity-80"
                }`}
                onClick={() => toggle("septa")}
              />
            ))}

            {/* Siphuncle dots */}
            {paths.siphuncle.map((s, i) => (
              <circle
                key={i}
                cx={s.x} cy={s.y} r="3.5"
                fill="#f87171"
                className={`cursor-pointer transition-opacity duration-200 ${dim("siphuncle")}`}
                onClick={() => toggle("siphuncle")}
              />
            ))}

            {/* Aperture highlight arc */}
            {active === "aperture" && (() => {
              const [ax, ay] = pt(SHELL_END);
              return <circle cx={ax} cy={ay} r="10" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />;
            })()}

            {/* Aperture click zone */}
            {(() => {
              const [ax, ay] = pt(SHELL_END);
              return (
                <circle
                  cx={ax} cy={ay} r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => toggle("aperture")}
                />
              );
            })()}

            {/* SVG labels */}
            {[
              { id: "aperture",     tx: 410, ty: 155, label: "Aperture" },
              { id: "body-chamber", tx: 160, ty:  28, label: "Body Chamber" },
              { id: "phragmocone",  tx:  68, ty: 240, label: "Phragmocone" },
              { id: "septa",        tx: 390, ty: 295, label: "Septa" },
              { id: "siphuncle",    tx: 420, ty: 265, label: "Siphuncle" },
              { id: "umbilicus",    tx: 272, ty: 175, label: "Umbilicus" },
            ].map(({ id, tx, ty, label }) => {
              const part = PARTS.find((p) => p.id === id)!;
              const isActive = active === id;
              return (
                <g key={id} className="cursor-pointer" onClick={() => toggle(id)}>
                  <text
                    x={tx} y={ty}
                    fill={isActive ? part.color : "#64748b"}
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                    textAnchor="middle"
                    fontWeight={isActive ? "bold" : "normal"}
                    className="transition-colors duration-200"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-[#0a0a0a] p-5 min-h-[220px] flex flex-col">
          <AnimatePresence mode="wait">
            {activePart ? (
              <motion.div
                key={activePart.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activePart.color }} />
                  <span className="text-sm font-semibold text-foreground">{activePart.label}</span>
                </div>
                <p className="text-xs text-muted-foreground italic">{activePart.tagline}</p>
                <ul className="space-y-2 flex-1">
                  {activePart.facts.map((fact, i) => (
                    <li key={i} className="flex gap-2 text-xs text-foreground/75 leading-5">
                      <span className="text-muted-foreground/40 shrink-0 mt-0.5">→</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-4"
              >
                <div className="text-5xl opacity-20">⊙</div>
                <p className="text-xs text-muted-foreground">
                  Click a label above or a part of the diagram to explore ammonite anatomy.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Anatomy label buttons */}
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
            style={active === part.id ? { color: part.color, borderColor: part.color } : {}}
          >
            {part.label}
          </button>
        ))}
      </div>
    </div>
  );
}
