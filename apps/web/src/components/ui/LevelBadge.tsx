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
