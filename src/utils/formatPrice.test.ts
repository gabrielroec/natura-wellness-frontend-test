import { describe, expect, it } from "vitest";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats cents as dollars", () => {
    expect(formatPrice(2546)).toBe("$25.46");
    expect(formatPrice(100)).toBe("$1.00");
  });

  it("adds the thousands separator", () => {
    expect(formatPrice(114570)).toBe("$1,145.70");
  });
});
