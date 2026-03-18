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
      {
        id: "regex",
        label: "Regular Expressions",
        level: "beginner",
        description: "Master pattern matching — from basic character classes to lookaheads and real-world validation.",
        subtopics: [
          { id: "introduction", label: "Introduction", level: "beginner" },
          { id: "characters", label: "Literal Characters", level: "beginner" },
          { id: "character-classes", label: "Character Classes", level: "beginner" },
          { id: "quantifiers", label: "Quantifiers", level: "beginner" },
          { id: "anchors", label: "Anchors", level: "intermediate" },
          { id: "groups", label: "Groups & Backreferences", level: "intermediate" },
          { id: "lookaheads", label: "Lookaheads & Lookbehinds", level: "advanced" },
          { id: "flags", label: "Flags", level: "beginner" },
          { id: "common-patterns", label: "Common Patterns", level: "intermediate" },
          { id: "exercises", label: "Exercises & Challenges", level: "intermediate" },
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
    id: "human-body",
    label: "Human Body",
    description: "Anatomy, physiology, and neuroscience of the human body.",
    topics: [
      {
        id: "brain",
        label: "The Brain",
        level: "beginner",
        description: "From neurons to consciousness — the complete guide to the human brain.",
        subtopics: [
          { id: "overview", label: "Overview", level: "beginner" },
          { id: "anatomy", label: "Brain Anatomy", level: "beginner" },
          { id: "neurons", label: "Neurons", level: "beginner" },
          { id: "glial-cells", label: "Glial Cells", level: "beginner" },
          { id: "gray-vs-white-matter", label: "Gray vs White Matter", level: "beginner" },
          { id: "action-potential", label: "Action Potential", level: "intermediate" },
          { id: "synaptic-transmission", label: "Synaptic Transmission", level: "intermediate" },
          { id: "neurotransmitters", label: "Neurotransmitters", level: "intermediate" },
          { id: "brain-regions-deep", label: "Deep Brain Regions", level: "intermediate" },
          { id: "hemispheres", label: "Brain Hemispheres", level: "intermediate" },
          { id: "cortical-layers", label: "Cortical Layers", level: "intermediate" },
          { id: "blood-brain-barrier", label: "Blood-Brain Barrier", level: "intermediate" },
          { id: "visual-system", label: "Visual System", level: "intermediate" },
          { id: "motor-control", label: "Motor Control", level: "intermediate" },
          { id: "memory", label: "Memory", level: "intermediate" },
          { id: "language", label: "Language", level: "intermediate" },
          { id: "emotion", label: "Emotion & the Limbic System", level: "intermediate" },
          { id: "sleep", label: "Sleep", level: "intermediate" },
          { id: "executive-function", label: "Executive Function", level: "intermediate" },
          { id: "neural-oscillations", label: "Neural Oscillations", level: "advanced" },
          { id: "plasticity", label: "Brain Plasticity", level: "advanced" },
          { id: "adult-neurogenesis", label: "Adult Neurogenesis", level: "advanced" },
          { id: "development", label: "Brain Development", level: "advanced" },
          { id: "consciousness", label: "Consciousness", level: "advanced" },
          { id: "brain-disorders", label: "Brain Disorders", level: "advanced" },
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
