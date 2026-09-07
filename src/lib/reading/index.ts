import type { MarkdownInstance } from "astro";
import { readingSchema } from "./schema";
import type { Reading } from "./schema";

// Reading takes are rendered as sections of a single page, so the markdown
// instance (not just the frontmatter) is what callers need: `entry.Content`
// renders the take. Validation still happens here, so a bad file fails the
// build with its path, like `@lib/posts` and `@lib/games`.
const readingModules = import.meta.glob<
  MarkdownInstance<Record<string, unknown>>
>("../../reading/*.md", { eager: true });

export function loadReading(): MarkdownInstance<Reading>[] {
  return Object.entries(readingModules).map(([path, mod]) => {
    const parsed = readingSchema.safeParse(mod.frontmatter);
    if (!parsed.success) {
      throw new Error(
        `Invalid reading frontmatter in ${path}: ${parsed.error.message}`
      );
    }
    return mod as unknown as MarkdownInstance<Reading>;
  });
}

/** Newest first, by the date the article was read. */
export function getSortedReading(): MarkdownInstance<Reading>[] {
  return loadReading().sort(
    (a, b) => readTime(b.frontmatter) - readTime(a.frontmatter)
  );
}

function readTime(frontmatter: Reading): number {
  return new Date(frontmatter.read).getTime();
}

/**
 * Anchor for one take, so an entry can be linked as
 * `/lists/reading#always-do-extra`. Derived from the filename with the date
 * prefix stripped, which keeps the anchor stable if the take is re-dated.
 */
export function readingSlug(entry: MarkdownInstance<Reading>): string {
  return entry
    .file!.split("/")
    .pop()!
    .replace(/\.md$/, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "");
}
