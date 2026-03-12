import type { Level } from "./levels";

export interface NavSubtopic {
  id: string;
  label: string;
  level: Level;
}

export interface NavTopic {
  id: string;
  label: string;
  level: Level;
  description?: string;
  subtopics?: NavSubtopic[];
}

export interface NavArea {
  id: string;
  label: string;
  description: string;
  topics: NavTopic[];
}

export const NAV_AREAS: NavArea[] = [
  {
    id: "programming",
    label: "Programming",
    description: "Algorithms, data structures, systems, and software design.",
    topics: [
      {
        id: "memory-management",
        label: "Memory Management",
        level: "intermediate",
        description: "Stack, heap, allocation strategies, and garbage collection.",
        subtopics: [
          { id: "stack", label: "Stack Memory", level: "intermediate" },
          { id: "heap", label: "Heap Memory", level: "intermediate" },
        ],
      },
    ],
  },
];
