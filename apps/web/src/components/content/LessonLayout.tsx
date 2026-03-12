import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import type { LessonData } from "@/lib/mdx";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { TableOfContents } from "@/components/content/TableOfContents";
import { StackVisualizer, StackExercise, HeapVisualizer, HeapAnimation } from "@learn-anything/visualizations";

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
    <p className="text-[15px] leading-7 text-foreground/90 mb-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-5 mb-4 space-y-1.5 text-[15px] text-foreground/90" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-[15px] text-foreground/90" {...props}>
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
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="font-mono text-[13px] bg-muted border border-border px-1.5 py-0.5 rounded text-primary"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-muted border border-border rounded-lg p-4 overflow-x-auto text-[13px] font-mono mb-4 leading-6"
      {...props}
    >
      {children}
    </pre>
  ),
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
  StackVisualizer: () => <StackVisualizer />,
  StackExercise: () => <StackExercise />,
  HeapVisualizer: () => <HeapVisualizer />,
  HeapAnimation: () => <HeapAnimation />,
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
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            {frontmatter.title}
          </h1>
          <div className="flex items-center gap-3">
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
                rehypePlugins: [rehypeSlug],
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
