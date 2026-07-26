import { describe, expect, it } from "vitest";
import { inventoryRecords } from "../test/mocks/fixtures";
import { getAvailableSkuCodes } from "./inventoryAvailability";

const baseFilters = {
  selectedDescriptions: [],
  selectedSKU: [],
  selectedManufacturer: [],
  selectedFilter: { Prosthesis: false, Orthosis: false, Pediatric: false },
  searchInput: "",
  selectedPart: "",
  extremity: "All",
  isRangeOn: false,
  minValue: 1,
  maxValue: 75,
};

const items = inventoryRecords.map((record) => record.fields);

describe("getAvailableSkuCodes", () => {
  it("returns all SKU codes without filters", () => {
    expect(getAvailableSkuCodes(items, baseFilters)).toEqual(
      new Set(["LSHELL", "LSKT", "PYIC"])
    );
  });

  it("applies search, tag, part, extremity, and size filters locally", () => {
    expect(
      getAvailableSkuCodes(items, {
        ...baseFilters,
        searchInput: "left shell",
        selectedFilter: { ...baseFilters.selectedFilter, Prosthesis: true },
        selectedPart: "Feet",
        extremity: "Lower",
        isRangeOn: true,
        minValue: 28,
        maxValue: 30,
      })
    ).toEqual(new Set(["LSHELL"]));
  });
});
