"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Math ──────────────────────────────────────────────────────────────────────
const TWO_PI = 2 * Math.PI;
function shellPt(theta: number, A: number, B: number, cx: number, cy: number): [number, number] {
  const r = A * Math.exp(B * theta);
  return [cx + r * Math.cos(theta), cy - r * Math.sin(theta)];
}
function buildSpiral(turns: number, A: number, B: number, cx: number, cy: number, n = 120): string {
  return Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = shellPt((i / n) * turns * TWO_PI, A, B, cx, cy);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}
function buildRib(theta: number, A: number, B: number, cx: number, cy: number, innerFrac: number): string {
  const r = A * Math.exp(B * theta);
  const ri = r * innerFrac;
  const cos = Math.cos(theta), sin = Math.sin(theta);
  return `M${(cx + ri * cos).toFixed(1)},${(cy - ri * sin).toFixed(1)} L${(cx + r * cos).toFixed(1)},${(cy - r * sin).toFixed(1)}`;
}

// ─── Species data ──────────────────────────────────────────────────────────────
interface Species {
  id: string;
  name: string;
  latin: string;
  period: string;
  age: string;
  B: number;
  color: string;
  ribbing: "smooth" | "fine" | "coarse" | "tuberculate" | "keeled";
  diameter: string;
  habitat: string;
  suture: "goniatitic" | "ceratitic" | "ammonitic";
  description: string;
  features: string[];
}

const SPECIES: Species[] = [
  {
    id: "goniatites",
    name: "Goniatites",
    latin: "Goniatites crenistria",
    period: "Carboniferous",
    age: "330–315 Ma",
    B: 0.12,
    color: "#94a3b8",
    ribbing: "smooth",
    diameter: "3–7 cm",
    habitat: "Shallow seas",
    suture: "goniatitic",
    description: "One of the earliest true ammonoids. Its simple angular sutures gave the goniatite group its name. Smooth, involute shell ideal for open-water swimming.",
    features: ["Simple angular sutures", "Smooth involute shell", "Very evolute coiling"],
  },
  {
    id: "dactylioceras",
    name: "Dactylioceras",
    latin: "Dactylioceras commune",
    period: "Early Jurassic",
    age: "182–175 Ma",
    B: 0.17,
    color: "#fbbf24",
    ribbing: "coarse",
    diameter: "5–10 cm",
    habitat: "Shallow shelf seas",
    suture: "ammonitic",
    description: "The classic Jurassic ammonite, found abundantly at Whitby, Yorkshire. Its strong radial ribs bifurcate (split in two) halfway out — a diagnostic feature. Often preserved in pyrite.",
    features: ["Bifurcating radial ribs", "Evolute coiling (large umbilicus)", "Complex ammonitic sutures"],
  },
  {
    id: "asteroceras",
    name: "Asteroceras",
    latin: "Asteroceras obtusum",
    period: "Early Jurassic",
    age: "196–190 Ma",
    B: 0.22,
    color: "#f97316",
    ribbing: "coarse",
    diameter: "10–20 cm",
    habitat: "Open shelf",
    suture: "ammonitic",
    description: "A robust, rapidly expanding ammonite with strong ribs that cross the venter (outer edge) without a keel. Used as an index fossil for the Obtusum Zone.",
    features: ["Strong primary ribs", "Rounded venter (no keel)", "Moderate umbilicus"],
  },
  {
    id: "hildoceras",
    name: "Hildoceras",
    latin: "Hildoceras bifrons",
    period: "Early Jurassic",
    age: "175–170 Ma",
    B: 0.26,
    color: "#a78bfa",
    ribbing: "keeled",
    diameter: "6–12 cm",
    habitat: "Open water, moderate depth",
    suture: "ammonitic",
    description: "Recognisable by its distinctive tricarinate (three-keeled) venter: a central keel flanked by two grooves. Named after St Hilda of Whitby, whose legend claimed she turned snakes to stone.",
    features: ["Triple keel on outer edge", "Deep spiral grooves", "Involute, compressed shell"],
  },
  {
    id: "perisphinctes",
    name: "Perisphinctes",
    latin: "Perisphinctes sp.",
    period: "Late Jurassic",
    age: "157–148 Ma",
    B: 0.19,
    color: "#34d399",
    ribbing: "coarse",
    diameter: "15–60 cm",
    habitat: "Shallow reef and platform",
    suture: "ammonitic",
    description: "A large, prominently ribbed evolute ammonite that became widespread across the Jurassic Tethys Sea. Its ribs branch at the umbilical shoulder, creating a distinctive 'Y' pattern.",
    features: ["Branching ribbing (Y-pattern)", "Wide open umbilicus", "Large size (up to 60 cm)"],
  },
  {
    id: "placenticeras",
    name: "Placenticeras",
    latin: "Placenticeras meeki",
    period: "Late Cretaceous",
    age: "85–70 Ma",
    B: 0.30,
    color: "#0891b2",
    ribbing: "tuberculate",
    diameter: "10–35 cm",
    habitat: "Epicontinental seas",
    suture: "ammonitic",
    description: "A highly involute Cretaceous ammonite with tubercles (knob-like protrusions) along the umbilical and ventral edges. Shows evidence of mosasaur bite marks — some with healed damage, proving survival.",
    features: ["Row of ventral tubercles", "Highly involute (tiny umbilicus)", "Extremely complex sutures"],
  },
  {
    id: "amaltheus",
    name: "Amaltheus",
    latin: "Amaltheus margaritatus",
    period: "Early Jurassic",
    age: "186–183 Ma",
    B: 0.24,
    color: "#f87171",
    ribbing: "keeled",
    diameter: "3–8 cm",
    habitat: "Open marine, moderate depth",
    suture: "ammonitic",
    description: "Famous for its rope-like keel — a distinctive raised ridge along the outer edge with a braided or beaded texture (the 'margaritatus' or 'pearl' keel). Used as a biozone index fossil across Europe.",
    features: ["Rope-textured (pearled) keel", "Moderately involute", "Fine radial ribs"],
  },
  {
    id: "parapuzosia",
    name: "Parapuzosia",
    latin: "P. seppenradensis",
    period: "Late Cretaceous",
    age: "85–72 Ma",
    B: 0.20,
    color: "#e2e8f0",
    ribbing: "fine",
    diameter: "up to 180 cm",
    habitat: "Open ocean",
    suture: "ammonitic",
    description: "The largest known ammonite species, with specimens reaching 1.8 metres in diameter. A complete specimen was found near Seppenrade, Germany in 1895. The animal inside may have weighed over 200 kg.",
    features: ["Largest ammonite ever (up to 1.8 m)", "Fine rib pattern", "Complex sutured septa for depth tolerance"],
  },
];

// ─── SVG shell renderer ────────────────────────────────────────────────────────
function SpeciesSVG({ sp, active }: { sp: Species; active: boolean }) {
  const cx = 55, cy = 55, R = 40;
  const turns = 2.5;
  const A = R / Math.exp(sp.B * turns * TWO_PI);
  const spiral = buildSpiral(turns, A, sp.B, cx, cy);

  // Ribs — for coarse/tuberculate ribbing types, draw lines
  const ribCount = sp.ribbing === "coarse" || sp.ribbing === "tuberculate" ? 12 : sp.ribbing === "fine" ? 20 : 0;
  const ribTheta0 = TWO_PI; // ribs on outermost whorl
  const ribs = ribCount > 0
    ? Array.from({ length: ribCount }, (_, i) => {
        const t = ribTheta0 + (i / ribCount) * TWO_PI;
        return buildRib(t, A, sp.B, cx, cy, Math.exp(-TWO_PI * sp.B));
      })
    : [];

  // Keel line along venter
  const keelPath = sp.ribbing === "keeled"
    ? buildSpiral(1, A * Math.exp(sp.B * TWO_PI) / R * (R + 3), sp.B, cx, cy, 60).replace("M", "M")
    : null;

  const shellStroke = active ? sp.color : "#94a3b8";
  const opacity = active ? 1 : 0.7;

  return (
    <svg viewBox="0 0 110 110" className="w-full h-full">
      {/* Inner whorl hint */}
      <path d={buildSpiral(turns - 1, A, sp.B, cx, cy)} fill="none" stroke={shellStroke} strokeWidth="0.8" opacity={opacity * 0.35} />
      {/* Main spiral */}
      <path d={spiral} fill="none" stroke={shellStroke} strokeWidth={active ? 2 : 1.5} opacity={opacity} strokeLinecap="round" />
      {/* Ribs */}
      {ribs.map((r, i) => (
        <path key={i} d={r} fill="none" stroke={shellStroke} strokeWidth={sp.ribbing === "fine" ? 0.5 : 0.9} opacity={opacity * 0.55} />
      ))}
      {/* Tubercles */}
      {sp.ribbing === "tuberculate" && Array.from({ length: 8 }, (_, i) => {
        const t = TWO_PI + (i / 8) * TWO_PI;
        const r = A * Math.exp(sp.B * t);
        const [tx, ty] = [cx + r * Math.cos(t), cy - r * Math.sin(t)];
        return <circle key={i} cx={tx} cy={ty} r="2" fill={shellStroke} opacity={opacity * 0.7} />;
      })}
      {/* Umbilicus */}
      <circle cx={cx} cy={cy} r={A * 0.9} fill="none" stroke={shellStroke} strokeWidth="0.6" opacity={opacity * 0.3} strokeDasharray="2,1.5" />
    </svg>
  );
}

const SUTURE_LABELS = { goniatitic: "Goniatitic", ceratitic: "Ceratitic", ammonitic: "Ammonitic" };
const SUTURE_COLORS = { goniatitic: "#f59e0b", ceratitic: "#7c3aed", ammonitic: "#0891b2" };
const RIBBING_LABELS = { smooth: "Smooth", fine: "Fine ribs", coarse: "Coarse ribs", tuberculate: "Tuberculate", keeled: "Keeled" };

// ─── Component ─────────────────────────────────────────────────────────────────
export function SpeciesGallery() {
  const [active, setActive] = useState<string | null>(null);
  const activeSpecies = SPECIES.find((s) => s.id === active);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Iconic Species Gallery</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Eight of the most important ammonite species — click any to explore</p>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
        {SPECIES.map((sp) => (
          <button
            key={sp.id}
            onClick={() => setActive(active === sp.id ? null : sp.id)}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all duration-150 ${
              active === sp.id
                ? "border-current bg-[#1a1a1a]"
                : "border-border hover:border-muted-foreground bg-[#0d0d0d]"
            }`}
            style={active === sp.id ? { borderColor: sp.color } : {}}
          >
            <div className="w-full aspect-square">
              <SpeciesSVG sp={sp} active={active === sp.id} />
            </div>
            <span
              className="text-[8px] font-mono text-center leading-tight"
              style={{ color: active === sp.id ? sp.color : "#64748b" }}
            >
              {sp.name}
            </span>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {activeSpecies && (
          <motion.div
            key={activeSpecies.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-5 bg-[#0a0a0a]">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Left: large SVG */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 self-center">
                  <SpeciesSVG sp={activeSpecies} active />
                </div>

                {/* Right: info */}
                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{activeSpecies.name}</span>
                      <span className="text-xs italic text-muted-foreground">{activeSpecies.latin}</span>
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">{activeSpecies.period}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">{activeSpecies.age}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-border" style={{ color: SUTURE_COLORS[activeSpecies.suture] }}>
                        {SUTURE_LABELS[activeSpecies.suture]} sutures
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/75 leading-5">{activeSpecies.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="rounded bg-[#111] border border-border p-2">
                      <div className="text-muted-foreground mb-0.5">Diameter</div>
                      <div className="font-mono text-foreground">{activeSpecies.diameter}</div>
                    </div>
                    <div className="rounded bg-[#111] border border-border p-2">
                      <div className="text-muted-foreground mb-0.5">Shell</div>
                      <div className="font-mono text-foreground">{RIBBING_LABELS[activeSpecies.ribbing]}</div>
                    </div>
                    <div className="rounded bg-[#111] border border-border p-2">
                      <div className="text-muted-foreground mb-0.5">WER (B={activeSpecies.B})</div>
                      <div className="font-mono text-foreground">{Math.exp(TWO_PI * activeSpecies.B).toFixed(2)}×</div>
                    </div>
                    <div className="rounded bg-[#111] border border-border p-2">
                      <div className="text-muted-foreground mb-0.5">Habitat</div>
                      <div className="font-mono text-foreground">{activeSpecies.habitat}</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Key features</p>
                    <ul className="flex flex-col gap-0.5">
                      {activeSpecies.features.map((f) => (
                        <li key={f} className="text-[10px] text-foreground/70 flex items-start gap-1.5">
                          <span className="text-amber-400 mt-px">›</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
