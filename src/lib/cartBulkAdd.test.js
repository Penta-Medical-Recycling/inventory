import { describe, expect, it, beforeEach } from "vitest";
import { bulkAddToCart, getItemDisplayName } from "./cartBulkAdd";

const makeItem = (id, overrides = {}) => ({
  ["Item ID"]: id,
  ["SKU Item Code"]: "LSHELL",
  ["Description (from SKU)"]: ["Left Shell"],
  Size: 28,
  ...overrides,
});

const bySku = (code) => (entry) => entry["SKU Item Code"] === code;

describe("bulkAddToCart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("rejects invalid quantities", () => {
    const result = bulkAddToCart({
      items: [makeItem("a")],
      matcher: bySku("LSHELL"),
      unitsRequested: 0,
    });
    expect(result).toEqual({ addedCount: 0, availableCount: 0, status: "invalid-quantity" });
  });

  it("reports inventory-unavailable when items are missing", () => {
    const result = bulkAddToCart({
      items: [],
      matcher: bySku("LSHELL"),
      unitsRequested: 1,
    });
    expect(result.status).toBe("inventory-unavailable");
  });

  it("reports insufficient stock without writing to the cart", () => {
    const items = [makeItem("a"), makeItem("b")];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 3,
    });
    expect(result).toEqual({ addedCount: 0, availableCount: 2, status: "insufficient-stock" });
    expect(localStorage.length).toBe(0);
  });

  it("adds N distinct units FIFO", () => {
    const items = [makeItem("a"), makeItem("b"), makeItem("c")];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 2,
    });
    expect(result.addedCount).toBe(2);
    expect(localStorage.getItem("a")).toBeTruthy();
    expect(localStorage.getItem("b")).toBeTruthy();
    expect(localStorage.getItem("c")).toBeNull();
  });

  it("fills oldest-first by Date Added regardless of list order", () => {
    const items = [
      makeItem("newer", { ["Date Added"]: "2024-03-01" }),
      makeItem("oldest", { ["Date Added"]: "2024-01-01" }),
      makeItem("middle", { ["Date Added"]: "2024-02-01" }),
    ];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 2,
    });
    expect(result.addedCount).toBe(2);
    expect(localStorage.getItem("oldest")).toBeTruthy();
    expect(localStorage.getItem("middle")).toBeTruthy();
    expect(localStorage.getItem("newer")).toBeNull();
  });

  it("prefers units with a known Date Added over undated ones", () => {
    const items = [
      makeItem("undated"),
      makeItem("dated", { ["Date Added"]: "2024-01-01" }),
    ];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 1,
    });
    expect(result.addedCount).toBe(1);
    expect(localStorage.getItem("dated")).toBeTruthy();
    expect(localStorage.getItem("undated")).toBeNull();
  });

  it("adds the priority item first even when it is not first in the list", () => {
    const items = [makeItem("a"), makeItem("b"), makeItem("c")];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 1,
      priorityItemId: "c",
    });
    expect(result.addedCount).toBe(1);
    expect(localStorage.getItem("c")).toBeTruthy();
    expect(localStorage.getItem("a")).toBeNull();
  });

  it("skips units already in the cart", () => {
    localStorage.setItem("a", JSON.stringify(makeItem("a")));
    const items = [makeItem("a"), makeItem("b")];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 1,
    });
    expect(result.addedCount).toBe(1);
    expect(localStorage.getItem("b")).toBeTruthy();
  });

  it("honours an exact size filter", () => {
    const items = [makeItem("a", { Size: 28 }), makeItem("b", { Size: 30 })];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 1,
      selectedSize: { exact: "30" },
    });
    expect(result.addedCount).toBe(1);
    expect(localStorage.getItem("b")).toBeTruthy();
    expect(localStorage.getItem("a")).toBeNull();
  });

  it("honours a size range filter", () => {
    const items = [makeItem("a", { Size: 20 }), makeItem("b", { Size: 30 })];
    const result = bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 1,
      selectedSize: { range: [25, 35] },
    });
    expect(result.addedCount).toBe(1);
    expect(localStorage.getItem("b")).toBeTruthy();
  });

  it("stores the selected size on written cart entries", () => {
    const items = [makeItem("a")];
    bulkAddToCart({
      items,
      matcher: bySku("LSHELL"),
      unitsRequested: 1,
      selectedSize: { range: [25, 35], exact: null },
    });
    const stored = JSON.parse(localStorage.getItem("a"));
    expect(stored["Selected Size"]).toEqual({ range: [25, 35], exact: null });
    expect(stored["Qty."]).toBe(1);
  });
});

describe("getItemDisplayName", () => {
  it("prefers the SKU description", () => {
    expect(getItemDisplayName(makeItem("a"))).toBe("Left Shell");
  });

  it("falls back through name fields", () => {
    expect(getItemDisplayName({ ["Item Name"]: "Widget" })).toBe("Widget");
    expect(getItemDisplayName({ Model: "M1" })).toBe("M1");
    expect(getItemDisplayName({})).toBe("Unnamed Item");
  });
});
