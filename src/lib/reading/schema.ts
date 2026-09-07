import { z } from "zod";

/**
 * Frontmatter for one reading take in `src/reading/*.md`.
 *
 * One file per article read: the frontmatter is the article, the markdown body
 * is the take. `read` arrives as a `Date` — YAML parses an unquoted
 * `read: 2026-09-07` into a Date object, the same gotcha `postSchema.datetime`
 * documents — so both Date and string are accepted.
 */
export const readingSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  author: z.string().optional(),
  read: z.union([z.string(), z.date()]),
  tags: z.array(z.string()).default([]),
});

export type Reading = z.infer<typeof readingSchema>;
