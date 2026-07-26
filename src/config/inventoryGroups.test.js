import { describe, expect, it } from "vitest";
import { normalizeInventoryGroups } from "./inventoryGroups";

const record = (id, fields) => ({ id, fields });

describe("normalizeInventoryGroups", () => {
  it("normalizes active groups, sorts them, and resolves overlaps deterministically", () => {
    const groups = normalizeInventoryGroups([
      record("rec-z", {
        Name: "Zeta",
        Key: "zeta",
        Active: true,
        "SKU Item Codes": ["A", "B", "A"],
        Image: [{ url: "original.png", thumbnails: { large: { url: "large.png" } } }],
      }),
      record("rec-a", {
        Name: "Alpha",
        Key: "alpha",
        Active: true,
        "SKU Item Codes": ["B", "C"],
      }),
      record("rec-inactive", {
        Name: "Inactive",
        Key: "inactive",
        Active: false,
        "SKU Item Codes": ["D"],
      }),
      record("rec-bad-key", {
        Name: "Bad key",
        Key: "Bad Key",
        Active: true,
        "SKU Item Codes": ["E"],
      }),
      record("rec-duplicate-key", {
        Name: "Duplicate",
        Key: "zeta",
        Active: true,
        "SKU Item Codes": ["F"],
      }),
    ]);

    expect(groups).toEqual([
      {
        id: "rec-a",
        key: "alpha",
        title: "Alpha",
        skuCodes: ["B", "C"],
        imageUrl: null,
      },
      {
        id: "rec-z",
        key: "zeta",
        title: "Zeta",
        skuCodes: ["A"],
        imageUrl: "large.png",
      },
    ]);
  });
});
