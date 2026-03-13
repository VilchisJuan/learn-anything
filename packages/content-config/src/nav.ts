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
  group?: string; // sidebar display grouping within an area (e.g. "Animals", "Plants")
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
  {
    id: "nature",
    label: "Nature",
    description: "Earth history, evolution, ecology, and the living world.",
    topics: [
      {
        id: "ammonites",
        label: "Ammonites",
        level: "beginner",
        group: "Animals",
        description: "400 million years of coiled shells — anatomy, evolution, ecology, and extinction.",
        subtopics: [
          { id: "introduction", label: "Introduction", level: "beginner" },
          { id: "anatomy", label: "Anatomy", level: "beginner" },
          { id: "shell-geometry", label: "Shell Geometry", level: "intermediate" },
          { id: "evolution-timeline", label: "Evolution Timeline", level: "intermediate" },
          { id: "ecology", label: "Ecology", level: "intermediate" },
          { id: "extinction", label: "Extinction", level: "intermediate" },
          { id: "fossils", label: "Fossils", level: "beginner" },
          { id: "species-gallery", label: "Species Gallery", level: "beginner" },
          { id: "heteromorphs", label: "Heteromorphs", level: "intermediate" },
          { id: "cultural-history", label: "Cultural History", level: "beginner" },
          { id: "quiz", label: "Knowledge Check", level: "beginner" },
        ],
      },
    ],
  },
];
