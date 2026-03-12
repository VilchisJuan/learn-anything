import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Level } from "@learn-anything/content-config";

// Content lives at the monorepo root /content/
const CONTENT_ROOT = path.join(process.cwd(), "..", "..", "content");

export interface LessonFrontmatter {
  title: string;
  description: string;
  level: Level;
  area: string;
  topic: string;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: number; // 2 = ##, 3 = ###
}

export interface LessonData {
  frontmatter: LessonFrontmatter;
  source: string; // raw MDX string for next-mdx-remote
  toc: TocEntry[];
}

/** Extract table-of-contents entries from raw MDX text */
function extractToc(mdx: string): TocEntry[] {
  const toc: TocEntry[] = [];
  const headingRe = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRe.exec(mdx)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    toc.push({ id, text, depth });
  }

  return toc;
}

export function getLessonData(
  area: string,
  topic: string,
  subtopic: string
): LessonData | null {
  const filePath = path.join(CONTENT_ROOT, area, topic, `${subtopic}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    frontmatter: data as LessonFrontmatter,
    source: content,
    toc: extractToc(content),
  };
}
