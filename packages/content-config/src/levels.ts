export type Level = "beginner" | "intermediate" | "advanced" | "n5" | "n4" | "n3" | "n2" | "n1";

export const LEVELS: Level[] = ["beginner", "intermediate", "advanced", "n5", "n4", "n3", "n2", "n1"];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  n5: "JLPT N5",
  n4: "JLPT N4",
  n3: "JLPT N3",
  n2: "JLPT N2",
  n1: "JLPT N1",
};
