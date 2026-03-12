"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Leaf,
  Atom,
  Brain,
  ChevronRight,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { NAV_AREAS } from "@learn-anything/content-config";
import type { NavArea, NavTopic } from "@learn-anything/content-config";

const AREA_ICONS: Record<string, React.ReactNode> = {
  programming: <Code2 size={16} />,
  nature: <Leaf size={16} />,
  physics: <Atom size={16} />,
  "cognitive-science": <Brain size={16} />,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const activeArea = pathname.split("/")[1] ?? null;
  const [expandedArea, setExpandedArea] = useState<string | null>(
    activeArea ?? "programming"
  );

  function toggleArea(areaId: string) {
    setExpandedArea((prev) => (prev === areaId ? null : areaId));
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link
        href="/"
        onClick={onClose}
        className="h-14 flex items-center gap-2.5 px-5 border-b border-border shrink-0 hover:bg-accent/40 transition-colors"
      >
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <BookOpen size={13} className="text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-foreground tracking-tight">learn anything</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Areas
        </p>
        <ul className="space-y-0.5">
          {NAV_AREAS.map((area: NavArea) => (
            <AreaItem
              key={area.id}
              area={area}
              isExpanded={expandedArea === area.id}
              onToggle={() => toggleArea(area.id)}
              onLinkClick={onClose}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FlaskConical size={12} />
          <span>Experiments enabled</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-sidebar flex-col h-full overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar flex flex-col overflow-hidden md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface AreaItemProps {
  area: NavArea;
  isExpanded: boolean;
  onToggle: () => void;
  onLinkClick: () => void;
}

function AreaItem({ area, isExpanded, onToggle, onLinkClick }: AreaItemProps) {
  return (
    <li>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group ${
          isExpanded
            ? "bg-accent text-foreground"
            : "text-sidebar-foreground hover:bg-accent/60 hover:text-foreground"
        }`}
      >
        <span
          className={`shrink-0 transition-colors ${
            isExpanded
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          }`}
        >
          {AREA_ICONS[area.id] ?? <BookOpen size={16} />}
        </span>
        <span className="flex-1 text-left font-medium">{area.label}</span>
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-muted-foreground shrink-0"
        >
          <ChevronRight size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            key="topics"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden mt-0.5 ml-2 pl-3 border-l border-border space-y-0.5"
          >
            {area.topics.map((topic) => (
              <TopicItem
                key={topic.id}
                areaId={area.id}
                topic={topic}
                onLinkClick={onLinkClick}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

interface TopicItemProps {
  areaId: string;
  topic: NavTopic;
  onLinkClick: () => void;
}

function TopicItem({ areaId, topic, onLinkClick }: TopicItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(
    pathname.includes(`/${areaId}/${topic.id}`)
  );

  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
  const topicPath = `/${areaId}/${topic.id}`;
  const isActive = pathname === topicPath;

  if (hasSubtopics) {
    return (
      <li>
        <button
          onClick={() => setExpanded((p) => !p)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors group ${
            isActive
              ? "text-foreground bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          }`}
        >
          <span className="flex-1 text-left">{topic.label}</span>
          <LevelBadge level={topic.level} compact />
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.12 }}
            className="text-muted-foreground shrink-0 ml-0.5"
          >
            <ChevronRight size={12} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="overflow-hidden ml-2 pl-3 border-l border-border/60 mt-0.5 space-y-0.5"
            >
              {topic.subtopics!.map((sub) => {
                const subPath = `/${areaId}/${topic.id}/${sub.id}`;
                const isSubActive = pathname === subPath;
                return (
                  <li key={sub.id}>
                    <Link
                      href={subPath}
                      onClick={onLinkClick}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                        isSubActive
                          ? "text-primary font-medium bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      }`}
                    >
                      <span className="flex-1">{sub.label}</span>
                      <LevelBadge level={sub.level} compact />
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={topicPath}
        onClick={onLinkClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isActive
            ? "text-primary font-medium bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
        }`}
      >
        <span className="flex-1">{topic.label}</span>
        <LevelBadge level={topic.level} compact />
      </Link>
    </li>
  );
}
