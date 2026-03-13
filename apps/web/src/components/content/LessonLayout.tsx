import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { LessonData } from "@/lib/mdx";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { TableOfContents } from "@/components/content/TableOfContents";
import {
  HiraganaChart, KatakanaChart, KanaQuiz, ParticleExercise,
  KanjiFlashcards, ConjugationTable, JlptQuiz,
  StackVisualizer, StackExercise, HeapVisualizer, HeapAnimation,
  AmmoniteAnatomyDiagram, ShellGrowthAnimation, GeologicTimeline, SutureDiagram, ExtinctionEvent,
  AmmoniteSizeComparison, CephalopodTree, DepthRangeChart, PreservationTypes,
  ShellParameterExplorer, SpeciesGallery, HeteromorphGallery, AmmoniteQuiz, AmmoniteTimeLapse,
} from "@learn-anything/visualizations";

interface LessonLayoutProps {
  lesson: LessonData;
}

/** Custom link renderer — internal /path links get Wikipedia-style concept styling */
function MdxLink({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href?.startsWith("/");

  if (isInternal) {
    return (
      <Link
        href={href!}
        className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors font-medium"
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
      {...rest}
    >
      {children}
    </a>
  );
}

const MDX_COMPONENTS = {
  a: MdxLink,
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border scroll-mt-20"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-base font-semibold text-foreground mt-6 mb-3 scroll-mt-20" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[20px] leading-7 text-foreground/90 mb-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-5 mb-4 space-y-1.5 text-[20px] text-foreground/90" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-[20px] text-foreground/90" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { "data-language"?: string }) => {
    // Block code processed by rehype-pretty-code — it applies inline token colors, skip extra styling
    if (props["data-language"]) {
      return <code {...props}>{children}</code>;
    }
    // Inline code
    return (
      <code
        className="font-mono text-[17px] bg-muted border border-border px-1.5 py-0.5 rounded text-primary"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement> & { "data-language"?: string }) => {
    const lang = props["data-language"];
    return (
      <div className="mb-6">
        {lang && (
          <div className="flex items-center px-4 py-1.5 bg-zinc-900 rounded-t-lg border border-b-0 border-border">
            <span className="text-xs text-zinc-400 font-mono tracking-wider">{lang}</span>
          </div>
        )}
        <pre
          className={`overflow-x-auto text-[15px] leading-6 font-mono p-4 border border-border ${lang ? "rounded-b-lg bg-zinc-950" : "rounded-lg bg-muted"}`}
          {...props}
        >
          {children}
        </pre>
      </div>
    );
  },
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="text-left font-semibold text-foreground px-4 py-2 border-b border-border bg-muted"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-2.5 border-b border-border/50 text-foreground/80 align-top"
      {...props}
    >
      {children}
    </td>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-2 border-primary pl-4 italic text-muted-foreground my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border my-8" />,
  HiraganaChart: () => <HiraganaChart />,
  KatakanaChart: () => <KatakanaChart />,
  KanaQuiz: () => <KanaQuiz />,
  ParticleExercise: () => <ParticleExercise />,
  KanjiFlashcards: () => <KanjiFlashcards />,
  ConjugationTable: () => <ConjugationTable />,
  JlptQuiz: () => <JlptQuiz />,
  StackVisualizer: () => <StackVisualizer />,
  StackExercise: () => <StackExercise />,
  HeapVisualizer: () => <HeapVisualizer />,
  HeapAnimation: () => <HeapAnimation />,
  AmmoniteAnatomyDiagram: () => <AmmoniteAnatomyDiagram />,
  ShellGrowthAnimation: () => <ShellGrowthAnimation />,
  GeologicTimeline: () => <GeologicTimeline />,
  SutureDiagram: () => <SutureDiagram />,
  ExtinctionEvent: () => <ExtinctionEvent />,
  AmmoniteSizeComparison: () => <AmmoniteSizeComparison />,
  CephalopodTree: () => <CephalopodTree />,
  DepthRangeChart: () => <DepthRangeChart />,
  PreservationTypes: () => <PreservationTypes />,
  ShellParameterExplorer: () => <ShellParameterExplorer />,
  SpeciesGallery: () => <SpeciesGallery />,
  HeteromorphGallery: () => <HeteromorphGallery />,
  AmmoniteQuiz: () => <AmmoniteQuiz />,
  AmmoniteTimeLapse: () => <AmmoniteTimeLapse />,
};

export function LessonLayout({ lesson }: LessonLayoutProps) {
  const { frontmatter, source, toc } = lesson;

  return (
    <div className="flex gap-12 max-w-6xl mx-auto">
      {/* Article */}
      <article className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="capitalize">{frontmatter.area}</span>
            <span>/</span>
            <span className="capitalize">{frontmatter.topic.replace(/-/g, " ")}</span>
            {frontmatter.sublevel && (
              <>
                <span>/</span>
                <span className="uppercase font-semibold text-blue-400">{frontmatter.sublevel}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
            {frontmatter.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <LevelBadge level={frontmatter.level} />
            <p className="text-sm text-muted-foreground">{frontmatter.description}</p>
          </div>
        </div>

        {/* MDX body */}
        <div>
          <MDXRemote
            source={source}
            components={MDX_COMPONENTS}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              rehypePlugins: [
                  [rehypePrettyCode, { theme: "github-dark" }],
                  rehypeSlug,
                ],
              },
            }}
          />
        </div>
      </article>

      {/* Right rail — ToC */}
      <aside className="hidden xl:block w-52 shrink-0">
        <TableOfContents entries={toc} />
      </aside>
    </div>
  );
}
