import { describe, expect, it, vi } from "vitest";
import { checkCartItemAvailability, getCartItemKeys } from "./Cart";

describe("Cart item detection", () => {
  it("treats partner and notes metadata as an empty cart", () => {
    expect(getCartItemKeys({ partner: "Demo Clinic", notes: "Urgent" })).toEqual([]);
  });

  it("returns persisted inventory item keys", () => {
    expect(
      getCartItemKeys({ partner: "Demo Clinic", notes: "", "22-1287": "{}" })
    ).toEqual(["22-1287"]);
  });
});

describe("Cart availability checks", () => {
  it("reports items that are no longer available", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] }),
    });

    const result = await checkCartItemAvailability(["22-1287"], fetchImpl);

    expect(result.unavailableIds).toEqual(["22-1287"]);
    expect(result.failedIds).toEqual([]);
  });

  it("fails closed when availability cannot be verified", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    const result = await checkCartItemAvailability(["22-1287"], fetchImpl);

    expect(result.unavailableIds).toEqual([]);
    expect(result.failedIds).toEqual(["22-1287"]);
    expect(result.statuses["22-1287"]).toBe("error");
  });
});