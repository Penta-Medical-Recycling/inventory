// LegDiagram maps the selected Parts filter to which leg SVG(s) render in full
// color; every other part is grayscale. These tests lock in that mapping.
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../../test/utils";
import LegDiagram from "./LegDiagram";

// Alt text of every part, top-to-bottom.
const ALL_PARTS = ["Abutment screw", "Socket", "Knee", "Calf", "Pylon", "Ankle", "Foot"];

// [Parts selection, parts expected in full color]. Everything else is grayscale.
const CASES = [
  ["All", ALL_PARTS],
  ["Liners", ["Abutment screw"]],
  ["Adapters", ["Knee", "Ankle"]],
  ["Knees/Hips", ["Calf"]],
  ["Pylons", ["Pylon"]],
  ["Feet", ["Foot"]],
  ["Accessories", []],
];

const isGrayscale = (alt) => screen.getByAltText(alt).className.includes("grayscale");

describe("LegDiagram part highlighting", () => {
  it.each(CASES)("colors the correct part(s) for %s", (description, coloredParts) => {
    renderWithProviders(<LegDiagram description={description} />, {
      withProviders: false,
    });

    for (const part of ALL_PARTS) {
      const shouldBeColored = coloredParts.includes(part);
      // Colored parts must NOT be grayscale; all others MUST be grayscale.
      expect(isGrayscale(part)).toBe(!shouldBeColored);
    }
  });
});
