import { describe, expect, it } from "vitest";
import { findOpaqueBounds } from "./trimTransparentImage";

describe("findOpaqueBounds", () => {
  it("finds visible content inside transparent padding", () => {
    const pixels = new Uint8ClampedArray(3 * 3 * 4);
    pixels[(1 * 3 + 1) * 4 + 3] = 255;

    expect(findOpaqueBounds(pixels, 3, 3)).toEqual({
      left: 1,
      top: 1,
      width: 1,
      height: 1,
    });
  });

  it("returns null for a fully transparent image", () => {
    expect(findOpaqueBounds(new Uint8ClampedArray(2 * 2 * 4), 2, 2)).toBeNull();
  });
});