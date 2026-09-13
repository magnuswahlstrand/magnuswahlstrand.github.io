import type { MarkdownHeading } from "astro";

type TOCProps = { headings: MarkdownHeading[] };

export default function TOC({ headings }: TOCProps) {
  if (!headings.length) return null;
  const baseDepth = Math.min(...headings.map(heading => heading.depth));
  return (
    <nav className="article-outline" aria-label="On this page">
      <ul>
        {headings.map(heading => (
          <li
            key={heading.slug}
            style={{
              paddingLeft: `${Math.min(heading.depth - baseDepth, 2) * 0.75}rem`,
            }}
          >
            <a href={`#${heading.slug}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
