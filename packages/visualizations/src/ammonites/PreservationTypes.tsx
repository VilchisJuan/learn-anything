"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreservationType {
  id: string;
  name: string;
  mineral: string;
  color: string;
  bgGradient: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Very Rare";
  locations: string[];
  description: string;
  howItForms: string;
  visualNote: string;
}

const TYPES: PreservationType[] = [
  {
    id: "calcite",
    name: "Calcite",
    mineral: "CaCO₃ (calcite)",
    color: "#94a3b8",
    bgGradient: "from-slate-800/40 to-slate-700/20",
    rarity: "Common",
    locations: ["Worldwide — most limestone formations"],
    description: "The most common preservation. The original aragonite shell converts to the more stable calcite polymorph, preserving shape but losing the original mineral.",
    howItForms: "Aragonite (unstable) → calcite replacement during burial. Millions of years under heat and pressure drive the mineralogical change.",
    visualNote: "White, grey, or cream coloured. Often found in grey limestone. Fine detail and suture lines usually preserved.",
  },
  {
    id: "pyrite",
    name: "Pyrite",
    mineral: "FeS₂ (iron sulfide)",
    color: "#eab308",
    bgGradient: "from-yellow-900/40 to-yellow-800/20",
    rarity: "Uncommon",
    locations: ["Whitby / Yorkshire coast, UK", "Holzmaden, Germany", "Posidonia Shale deposits"],
    description: "Iron sulfide replaces the shell in oxygen-poor (anoxic) muds. Creates stunning golden metallic specimens — often called 'fool's gold ammonites'.",
    howItForms: "Bacteria decompose organic matter in anoxic sediment, producing hydrogen sulfide (H₂S). H₂S + iron in porewater → FeS₂ crystals that infill and replace the shell.",
    visualNote: "Metallic gold or brassy colour. Can develop oxidation tarnish over time (convert to iron oxides). Best preserved in low-oxygen museum conditions.",
  },
  {
    id: "opal",
    name: "Opal",
    mineral: "SiO₂·nH₂O (hydrated silica)",
    color: "#e879f9",
    bgGradient: "from-fuchsia-900/40 to-purple-900/20",
    rarity: "Very Rare",
    locations: ["Lightning Ridge, New South Wales, Australia", "Coober Pedy, South Australia"],
    description: "Silica-rich groundwater replaces the shell, creating specimens with spectacular rainbow iridescence. Among the most valuable fossil gemstones.",
    howItForms: "Silica-rich groundwater percolates through the sediment and gradually replaces the shell material with hydrated silica (opal). The pore structure creates thin-film interference, producing colour.",
    visualNote: "Flashes of red, green, blue, and purple iridescence. 'Precious opal' classification. Often cut and polished as gemstones.",
  },
  {
    id: "ammolite",
    name: "Ammolite",
    mineral: "Aragonite (original, iridescent)",
    color: "#22c55e",
    bgGradient: "from-green-900/40 to-emerald-900/20",
    rarity: "Rare",
    locations: ["Alberta, Canada (Bearpaw Formation)", "Commercially mined near Lethbridge"],
    description: "Exceptionally, the ORIGINAL aragonite shell survives and develops iridescent thin-film colour from ultra-thin crystal layers — like mother-of-pearl but more spectacular.",
    howItForms: "Cold, clay-rich sediments in Alberta preserved the aragonite from normal diagenetic alteration. The shell's layered crystal structure (similar to nacre) produces structural colour via thin-film interference.",
    visualNote: "Brilliant green, red, gold, and blue iridescence. One of the few organic gemstones. Mined by Korite International in Alberta. Used in jewellery.",
  },
  {
    id: "silica",
    name: "Silicified",
    mineral: "SiO₂ (quartz/chert)",
    color: "#60a5fa",
    bgGradient: "from-blue-900/40 to-blue-800/20",
    rarity: "Uncommon",
    locations: ["Many limestone/chert formations", "Acid preparation specimens"],
    description: "Shell replaced by silica. Acid-resistant — specimens can be freed from limestone by dissolving the matrix in weak acid, leaving perfectly 3D shells.",
    howItForms: "Silica-bearing groundwater replaces calcium carbonate. Common near silica-rich volcanic deposits. Creates very hard, durable specimens.",
    visualNote: "Glassy, white, grey or translucent. Often exquisitely preserved in 3D due to acid-preparation techniques. Heavily used in research for fine anatomical study.",
  },
  {
    id: "original",
    name: "Original Shell",
    mineral: "Aragonite (unchanged)",
    color: "#fb923c",
    bgGradient: "from-orange-900/40 to-amber-900/20",
    rarity: "Very Rare",
    locations: ["Some Cretaceous deposits", "Madagascar (Cleoniceras)", "Cold, dry burial conditions"],
    description: "The rarest preservation — the original shell material, millions of years old, is chemically unchanged. Some specimens retain colour patterns.",
    howItForms: "Requires exceptional burial conditions: cool temperatures, low water flow, minimal diagenetic alteration. Cold clay-rich sediments are best. Found mostly in Cretaceous deposits < 100 Ma.",
    visualNote: "May retain original shell colour patterns (brown, cream, orange bands). Some even retain original microstructure under the electron microscope. Scientifically invaluable.",
  },
];

// SVG swatch for each type
function PreservationSwatch({ type }: { type: PreservationType }) {
  const cx = 45, cy = 45, r = 32;
  return (
    <svg viewBox="0 0 90 90" className="w-full h-full">
      <defs>
        {type.id === "opal" && (
          <radialGradient id="opalGrad" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="25%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="75%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f87171" />
          </radialGradient>
        )}
        {type.id === "ammolite" && (
          <radialGradient id="ammoliteGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>
        )}
        {type.id === "pyrite" && (
          <radialGradient id="pyriteGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </radialGradient>
        )}
      </defs>

      {/* Shell circle */}
      <circle
        cx={cx} cy={cy} r={r}
        fill={
          type.id === "opal" ? "url(#opalGrad)"
          : type.id === "ammolite" ? "url(#ammoliteGrad)"
          : type.id === "pyrite" ? "url(#pyriteGrad)"
          : type.color + "30"
        }
        stroke={type.color}
        strokeWidth="2"
      />
      {/* Concentric rings (ammonite coils) */}
      {[0.6, 0.35].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * f}
          fill="none"
          stroke={type.color}
          strokeWidth={1 - i * 0.3}
          opacity="0.5"
        />
      ))}
      {/* Umbilicus */}
      <circle cx={cx} cy={cy} r={r * 0.12} fill={type.color} opacity="0.4" />
      {/* Septa lines */}
      {[0, 45, 110, 185, 260, 320].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + r * 0.35 * Math.cos(rad);
        const y1 = cy + r * 0.35 * Math.sin(rad);
        const x2 = cx + r * Math.cos(rad);
        const y2 = cy + r * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={type.color} strokeWidth="0.8" opacity="0.4" />;
      })}
    </svg>
  );
}

const RARITY_COLORS = {
  "Common": "#94a3b8",
  "Uncommon": "#f59e0b",
  "Rare": "#a78bfa",
  "Very Rare": "#f87171",
};

export function PreservationTypes() {
  const [active, setActive] = useState<string | null>(null);
  const activeType = TYPES.find((t) => t.id === active);
  const infoPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && infoPanelRef.current) {
      // Small delay to let the panel animate open before scrolling
      setTimeout(() => {
        infoPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [active]);

  return (
    <div className="my-8 rounded-xl border border-border bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Types of Ammonite Preservation</h3>
        <p className="text-xs text-muted-foreground mt-0.5">From common calcite replacements to incredibly rare original shells — click to explore</p>
      </div>

      {/* Card grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setActive(active === type.id ? null : type.id)}
            className={`rounded-lg border p-3 flex flex-col gap-2 text-left transition-all duration-150 ${
              active === type.id
                ? "border-current bg-gradient-to-br"
                : "border-border hover:border-muted-foreground bg-[#0d0d0d]"
            }`}
            style={active === type.id ? { borderColor: type.color } : {}}
          >
            {/* Swatch — 200% of original */}
            <div className="mx-auto" style={{ width: 166, height: 166 }}>
              <PreservationSwatch type={type} />
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-semibold" style={{ color: active === type.id ? type.color : "#e2e8f0" }}>
                {type.name}
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-0.5">{type.mineral}</div>
              <div
                className="text-xs font-medium mt-1"
                style={{ color: RARITY_COLORS[type.rarity] }}
              >
                {type.rarity}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info panel */}
      <AnimatePresence mode="wait">
        {activeType && (
          <motion.div
            key={activeType.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border overflow-hidden"
          >
            <div ref={infoPanelRef} className="p-5 bg-[#0a0a0a] flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeType.color }} />
                <span className="text-sm font-semibold text-foreground">{activeType.name}</span>
                <span className="text-xs font-mono text-muted-foreground">{activeType.mineral}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded border border-border" style={{ color: RARITY_COLORS[activeType.rarity] }}>
                  {activeType.rarity}
                </span>
              </div>

              <p className="text-xs text-foreground/80 leading-5">{activeType.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md bg-[#111] border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">How it forms</p>
                  <p className="text-xs text-foreground/70 leading-5">{activeType.howItForms}</p>
                </div>
                <div className="rounded-md bg-[#111] border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">What to look for</p>
                  <p className="text-xs text-foreground/70 leading-5">{activeType.visualNote}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {activeType.locations.map((loc) => (
                      <span key={loc} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{loc}</span>
                    ))}
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
