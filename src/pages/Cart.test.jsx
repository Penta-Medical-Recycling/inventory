import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, userEvent, waitFor } from "../test/utils";
import PentaContext from "../context/PentaContext";
import Cart, { checkCartItemAvailability, getCartItemKeys } from "./Cart";

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
  it("defers the availability request until the user submits the cart", async () => {
    const user = userEvent.setup();
    localStorage.setItem("partner", "Demo Clinic");
    localStorage.setItem(
      "22-1287",
      JSON.stringify({
        "Item ID": "22-1287",
        "Description (from SKU)": ["Demo Item"],
      })
    );
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] }),
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner: "Demo Clinic",
            setCartCount: vi.fn(),
          }}
        >
          <Cart />
        </PentaContext.Provider>
      </MemoryRouter>,
      { withProviders: false }
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    fetchSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("checks multiple items in one request and reports missing items as unavailable", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        records: [{ fields: { "Item ID": "22-1287" } }],
      }),
    });

    const result = await checkCartItemAvailability(
      ["22-1287", "23-1689"],
      fetchImpl
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const requestUrl = new URL(fetchImpl.mock.calls[0][0]);
    expect(requestUrl.searchParams.get("filterByFormula")).toContain(
      "OR({Item ID}='22-1287',{Item ID}='23-1689')"
    );
    expect(requestUrl.searchParams.getAll("fields[]")).toEqual(["Item ID"]);
    expect(result.unavailableIds).toEqual(["23-1689"]);
    expect(result.failedIds).toEqual([]);
  });

  it("checks carts over 100 items in sequential batches", async () => {
    const itemIds = Array.from({ length: 101 }, (_, index) => `ITEM-${index + 1}`);
    const fetchImpl = vi.fn(async (url) => {
      const formula = new URL(url).searchParams.get("filterByFormula");
      const records = itemIds
        .filter((id) => formula.includes(`{Item ID}='${id}'`))
        .map((id) => ({ fields: { "Item ID": id } }));
      return { ok: true, json: async () => ({ records }) };
    });

    const result = await checkCartItemAvailability(itemIds, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.unavailableIds).toEqual([]);
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