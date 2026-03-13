"use client";

import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  disableBack?: boolean;
  disableFwd?: boolean;
  /** Current interval in ms — smaller = faster */
  speed: number;
  onSpeedChange: (ms: number) => void;
  /** Fastest allowed in ms. Default 200 */
  minMs?: number;
  /** Slowest allowed in ms. Default 3000 */
  maxMs?: number;
  /** CSS color string used for the active play button and slider accent */
  accentColor?: string;
  /** Extra content rendered at the end of the button row (e.g. step counter, progress bar) */
  children?: React.ReactNode;
}

/**
 * Shared playback controls bar for step-based animations.
 * Renders reset / back / play-pause / forward buttons + a speed slider.
 * Speed slider: right = faster (lower ms), left = slower (higher ms).
 */
export function PlaybackControls({
  isPlaying,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  disableBack = false,
  disableFwd = false,
  speed,
  onSpeedChange,
  minMs = 200,
  maxMs = 3000,
  accentColor = "#818cf8",
  children,
}: PlaybackControlsProps) {
  // Invert so slider right = fast (low ms)
  const sliderValue = maxMs + minMs - speed;

  return (
    <div className="px-5 py-3 border-t border-border flex flex-col gap-2 bg-[#0a0a0a]">
      {/* Row 1 — transport buttons + optional slot */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Reset"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={onStepBack}
          disabled={disableBack}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step back"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={onTogglePlay}
          className="p-1.5 rounded transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
          style={isPlaying ? { color: accentColor, backgroundColor: accentColor + "1a" } : undefined}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={onStepForward}
          disabled={disableFwd}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step forward"
        >
          <SkipForward size={14} />
        </button>
        {children}
      </div>

      {/* Row 2 — speed slider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground shrink-0">Speed</span>
        <input
          type="range"
          min={minMs}
          max={maxMs}
          step={50}
          value={sliderValue}
          onChange={(e) => onSpeedChange(maxMs + minMs - Number(e.target.value))}
          className="flex-1 h-1"
          style={{ accentColor } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
