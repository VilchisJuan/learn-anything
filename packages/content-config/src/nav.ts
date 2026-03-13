import type { Level } from "./levels";

export interface NavSubtopic {
  id: string;
  label: string;
  level: Level;
}

/** A JLPT level (N5, N4…) or any sub-grouping inside a topic that adds a 4th routing segment */
export interface NavLevel {
  id: string;    // e.g. "n5"
  label: string; // e.g. "N5 — Beginner"
  level: Level;
  description?: string;
  subtopics: NavSubtopic[];
}

export interface NavTopic {
  id: string;
  label: string;
  level: Level;
  description?: string;
  group?: string;
  subtopics?: NavSubtopic[]; // 3-level: /area/topic/subtopic
  levels?: NavLevel[];       // 4-level: /area/topic/level/subtopic
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
    id: "languages",
    label: "Languages",
    description: "Learn world languages with structured lessons, exercises, and interactive tools.",
    topics: [
      {
        id: "japanese",
        label: "Japanese",
        level: "n5",
        group: "East Asian",
        description: "Master Japanese from the ground up — kana, kanji, grammar, and vocabulary.",
        levels: [
          {
            id: "n5",
            label: "N5 — Beginner",
            level: "n5",
            description: "Foundations: hiragana, katakana, basic grammar, ~800 words.",
            subtopics: [
              { id: "hiragana", label: "Hiragana", level: "n5" },
              { id: "katakana", label: "Katakana", level: "n5" },
              { id: "numbers", label: "Numbers & Counting", level: "n5" },
              { id: "greetings", label: "Greetings & Phrases", level: "n5" },
              { id: "particles", label: "Essential Particles", level: "n5" },
              { id: "sentence-structure", label: "Sentence Structure", level: "n5" },
              { id: "verbs", label: "Verbs & Conjugation", level: "n5" },
              { id: "adjectives", label: "Adjectives", level: "n5" },
              { id: "basic-kanji", label: "Basic Kanji", level: "n5" },
              { id: "vocabulary", label: "Core Vocabulary", level: "n5" },
              { id: "n5-quiz", label: "N5 Practice Quiz", level: "n5" },
            ],
          },
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
