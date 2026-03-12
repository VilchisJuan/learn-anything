"use client";

import { Menu, Search } from "lucide-react";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border flex items-center gap-3 px-4 md:px-6 shrink-0 bg-background/80 backdrop-blur-sm">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1 flex items-center gap-3 max-w-xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-sm flex-1">
          <Search size={14} />
          <span>Search topics, concepts...</span>
          <kbd className="ml-auto text-xs bg-accent px-1.5 py-0.5 rounded border border-border hidden sm:inline">⌘K</kbd>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-xs">Interactive Learning Platform</span>
      </div>
    </header>
  );
}
