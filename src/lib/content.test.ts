import { describe, expect, it } from "vitest";

import { MAX_SHORT_SECONDS, clips, formatCount, isShortDurationAllowed, products } from "./content";

describe("FainShow content", () => {
  it("has exactly 3 sample videos", () => {
    expect(clips).toHaveLength(3);
  });

  it("has exactly 4 shop products", () => {
    expect(products).toHaveLength(4);
  });

  it("formats counts the Romanian way", () => {
    expect(formatCount(12400)).toBe("12,4K");
    expect(formatCount(23000)).toBe("23K");
    expect(formatCount(950)).toBe("950");
  });
});

describe("Short video length limit (max 3 minutes)", () => {
  it("allows exactly 3 minutes", () => {
    expect(isShortDurationAllowed(180)).toBe(true);
  });

  it("rejects anything over 3 minutes", () => {
    expect(isShortDurationAllowed(181)).toBe(false);
  });

  it("every sample short is within the limit", () => {
    expect(clips.every((c) => c.durationSec <= MAX_SHORT_SECONDS)).toBe(true);
  });
});
