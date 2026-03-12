"use client";

import { Search } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-14 border-b border-border flex items-center gap-4 px-6 shrink-0 bg-background/80 backdrop-blur-sm">
      <div className="flex-1 flex items-center gap-3 max-w-xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-sm flex-1">
          <Search size={14} />
          <span>Search topics, concepts...</span>
          <kbd className="ml-auto text-xs bg-accent px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-xs">Interactive Learning Platform</span>
      </div>
    </header>
  );
}
