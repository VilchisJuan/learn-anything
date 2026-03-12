"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_AREAS } from "@learn-anything/content-config";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Code2, ArrowRight, Layers } from "lucide-react";

const AREA_ICONS: Record<string, React.ReactNode> = {
  programming: <Code2 size={20} />,
};

const AREA_COLORS: Record<string, string> = {
  programming: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40",
};

const AREA_ICON_COLORS: Record<string, string> = {
  programming: "text-indigo-400",
};

export function HomeContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-xs text-muted-foreground">
          <Layers size={11} />
          Interactive Learning Platform
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Learn anything,{" "}
          <span className="text-primary">interactively.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
          Explore concepts through visual experiments. Tweak parameters, build
          your own examples, and understand how things work — not just what they are.
        </p>
      </motion.div>

      {/* Areas Grid */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Explore areas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NAV_AREAS.map((area, i) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <div
                className={`group relative p-5 rounded-xl border bg-gradient-to-br transition-all ${
                  AREA_COLORS[area.id] ?? "from-zinc-500/10 to-zinc-500/5 border-zinc-500/20"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={AREA_ICON_COLORS[area.id] ?? "text-foreground"}>
                    {AREA_ICONS[area.id]}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{area.label}</h3>
                <p className="text-sm text-muted-foreground mb-4">{area.description}</p>

                {/* Topics + subtopics as links */}
                <div className="space-y-1">
                  {area.topics.map((topic) => (
                    <div key={topic.id}>
                      {topic.subtopics && topic.subtopics.length > 0 ? (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-1 pt-1">
                            {topic.label}
                          </p>
                          {topic.subtopics.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${area.id}/${topic.id}/${sub.id}`}
                              className="flex items-center justify-between text-xs py-1.5 px-2 rounded-md border border-transparent hover:border-border hover:bg-accent/60 transition-all group/link"
                            >
                              <span className="text-foreground/80 group-hover/link:text-foreground transition-colors">
                                {sub.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <LevelBadge level={sub.level} compact />
                                <ArrowRight size={11} className="text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs py-1 border-t border-border/50">
                          <span className="text-muted-foreground">{topic.label}</span>
                          <LevelBadge level={topic.level} compact />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
