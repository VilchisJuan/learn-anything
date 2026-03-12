import { notFound } from "next/navigation";
import { getLessonData } from "@/lib/mdx";
import { AppShell } from "@/components/layout/AppShell";
import { LessonLayout } from "@/components/content/LessonLayout";

interface Props {
  params: Promise<{ area: string; topic: string; subtopic: string }>;
}

export default async function SubtopicPage({ params }: Props) {
  const { area, topic, subtopic } = await params;
  const lesson = getLessonData(area, topic, subtopic);

  if (!lesson) notFound();

  return (
    <AppShell>
      <LessonLayout lesson={lesson} />
    </AppShell>
  );
}
