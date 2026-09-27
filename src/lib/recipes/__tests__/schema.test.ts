import { describe, it, expect } from "vitest";
import { recipeSchema } from "../schema";

describe("recipeSchema", () => {
  it("accepts a full recipe", () => {
    const result = recipeSchema.safeParse({
      title: "Katsu Sando",
      added: "2026-09-05",
      source: { label: "ICA Recept", url: "https://www.ica.se/recept/katsu" },
      images: [{ src: "/img/recipes/kimchi/1.jpeg", alt: "Napa cabbage" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a recipe with only a title", () => {
    expect(recipeSchema.safeParse({ title: "Kimchi" }).success).toBe(true);
  });

  it("rejects a missing title", () => {
    expect(recipeSchema.safeParse({ added: "2026-09" }).success).toBe(false);
  });

  it("rejects an added that is not YYYY-MM-DD", () => {
    const result = recipeSchema.safeParse({
      title: "Kimchi",
      added: "2026-07",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a source without a url", () => {
    const result = recipeSchema.safeParse({
      title: "Kimchi",
      source: { label: "ICA Recept" },
    });
    expect(result.success).toBe(false);
  });
});
