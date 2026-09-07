import { describe, it, expect } from "vitest";
import { readingSchema } from "../schema";

describe("readingSchema", () => {
  it("accepts a full take", () => {
    const result = readingSchema.safeParse({
      title: "Always Do Extra",
      url: "https://www.bennorthrop.com/Essays/2021/always-do-extra.php",
      author: "Ben Northrop",
      read: "2026-09-07",
      tags: ["career"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a `read` that YAML parsed into a Date", () => {
    const result = readingSchema.safeParse({
      title: "Always Do Extra",
      url: "https://www.bennorthrop.com/Essays/2021/always-do-extra.php",
      read: new Date("2026-09-07"),
    });
    expect(result.success).toBe(true);
  });

  it("defaults tags to an empty array", () => {
    const result = readingSchema.parse({
      title: "Always Do Extra",
      url: "https://www.bennorthrop.com/",
      read: "2026-09-07",
    });
    expect(result.tags).toEqual([]);
  });

  it("rejects a missing url", () => {
    const result = readingSchema.safeParse({
      title: "Always Do Extra",
      read: "2026-09-07",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a url that is not a url", () => {
    const result = readingSchema.safeParse({
      title: "Always Do Extra",
      url: "bennorthrop.com",
      read: "2026-09-07",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing read date", () => {
    const result = readingSchema.safeParse({
      title: "Always Do Extra",
      url: "https://www.bennorthrop.com/",
    });
    expect(result.success).toBe(false);
  });
});
