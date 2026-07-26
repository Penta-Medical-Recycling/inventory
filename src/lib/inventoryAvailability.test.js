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

  it("matches manufacturer filters against the manufacturer name, not record IDs", () => {
    // The option value is the URL-encoded manufacturer NAME (as used by the
    // Airtable query). Only the fully-populated record has this manufacturer.
    expect(
      getAvailableSkuCodes(items, {
        ...baseFilters,
        selectedManufacturer: [
          {
            label: "Freedom Innovation",
            value: encodeURIComponent("Freedom Innovation"),
          },
        ],
      })
    ).toEqual(new Set(["LSHELL"]));
  });

  it("excludes records with blank sizes when a size range is active", () => {
    // Only LSHELL has a Size; the two blank-size records must be dropped so the
    // local result matches the server query, which excludes blank sizes.
    expect(
      getAvailableSkuCodes(items, {
        ...baseFilters,
        isRangeOn: true,
        minValue: 1,
        maxValue: 75,
      })
    ).toEqual(new Set(["LSHELL"]));
  });
});
