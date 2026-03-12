"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/mdx";

interface TableOfContentsProps {
  entries: TocEntry[];
}

export function TableOfContents({ entries }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observations) => {
        for (const obs of observations) {
          if (obs.isIntersecting) setActiveId(obs.target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    entries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="sticky top-6 space-y-1 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </p>
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          className={`block py-0.5 transition-colors leading-snug ${
            entry.depth === 3 ? "pl-3" : ""
          } ${
            activeId === entry.id
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  );
}
