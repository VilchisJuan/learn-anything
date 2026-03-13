import type { Level } from "@learn-anything/content-config";

const LEVEL_CONFIG: Record<Level, { label: string; className: string; dot: string }> = {
  beginner: {
    label: "Beginner",
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    dot: "bg-emerald-400",
  },
  intermediate: {
    label: "Intermediate",
    className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    dot: "bg-amber-400",
  },
  advanced: {
    label: "Advanced",
    className: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    dot: "bg-rose-400",
  },
  n5: {
    label: "JLPT N5",
    className: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    dot: "bg-blue-400",
  },
  n4: {
    label: "JLPT N4",
    className: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    dot: "bg-cyan-400",
  },
  n3: {
    label: "JLPT N3",
    className: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    dot: "bg-violet-400",
  },
  n2: {
    label: "JLPT N2",
    className: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    dot: "bg-orange-400",
  },
  n1: {
    label: "JLPT N1",
    className: "text-red-400 bg-red-400/10 border-red-400/20",
    dot: "bg-red-400",
  },
};

interface LevelBadgeProps {
  level: Level;
  compact?: boolean;
}

export function LevelBadge({ level, compact = false }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level];

  if (compact) {
    return (
      <span
        title={config.label}
        className={`inline-flex items-center justify-center w-1.5 h-1.5 rounded-full ${config.dot}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
