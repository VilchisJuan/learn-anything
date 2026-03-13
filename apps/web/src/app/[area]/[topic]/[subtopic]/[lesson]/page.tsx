import { notFound } from "next/navigation";
import { getLessonDataDeep } from "@/lib/mdx";
import { AppShell } from "@/components/layout/AppShell";
import { LessonLayout } from "@/components/content/LessonLayout";

// Route: /[area]/[topic]/[subtopic]/[lesson]
// e.g.   /languages/japanese/n5/hiragana
//        subtopic = "n5" (the level group), lesson = "hiragana"

interface Props {
  params: Promise<{ area: string; topic: string; subtopic: string; lesson: string }>;
}

export default async function LevelLessonPage({ params }: Props) {
  const { area, topic, subtopic, lesson } = await params;
  const data = getLessonDataDeep(area, topic, subtopic, lesson);

  if (!data) notFound();

  return (
    <AppShell>
      <LessonLayout lesson={data} />
    </AppShell>
  );
}
