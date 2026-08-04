import { describe, expect, it } from "vitest";
import { getInventoryPagePlan } from "./inventoryPagination";

const groups = (count) => Array.from({ length: count }, (_, index) => ({ key: `g-${index}` }));

describe("getInventoryPagePlan", () => {
  it.each([
    [0, 0, 0, 36, 0],
    [35, 0, 35, 1, 0],
    [36, 0, 36, 0, 0],
    [37, 0, 36, 0, 0],
    [37, 1, 1, 35, 0],
    [71, 1, 35, 1, 0],
    [72, 1, 36, 0, 0],
    [72, 2, 0, 36, 0],
    [37, 2, 0, 36, 35],
  ])(
    "%i groups on page %i yields %i groups, %i item slots, starting at %i",
    (groupCount, page, expectedGroups, expectedItems, expectedStart) => {
      const plan = getInventoryPagePlan(page, groups(groupCount));
      expect(plan.groups).toHaveLength(expectedGroups);
      expect(plan.individualCount).toBe(expectedItems);
      expect(plan.individualStart).toBe(expectedStart);
    }
  );
});
