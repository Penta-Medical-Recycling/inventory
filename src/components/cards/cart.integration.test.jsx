// Integration tests for the add-to-cart / remove-from-cart flow driven by InStockCard.
// These exercise the real collaboration between InStockCard, PentaProvider (cart count) and
// browser storage: the cart is persisted in localStorage keyed by "Item ID" (each physical
// unit = one key). Adding is a single instant click; the in-cart state offers remove only.
// setup.js clears localStorage + sessionStorage after each test for isolation.
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, userEvent } from "../../test/utils";
import InStockCard from "./InStockCard";
import { inventoryRecords } from "../../test/mocks/fixtures";

const sizedItem = inventoryRecords[0].fields; // "Left Foot Shell", Size 29, Item ID "22-1287"
const noSizeItem = inventoryRecords[1].fields; // "Socket, Left leg", no Size, Item ID "23-1689"

describe("cart add flow", () => {
  it("instantly adds a no-size item to the cart when AddToCart is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(<InStockCard item={noSizeItem} />);

    // Precondition: not in the cart yet.
    expect(screen.getByLabelText("AddToCart")).toBeInTheDocument();
    expect(localStorage.getItem("23-1689")).toBeNull();

    await user.click(screen.getByLabelText("AddToCart"));

    // Single add is instant: no quantity modal appears.
    expect(screen.queryByText(/How many units/i)).not.toBeInTheDocument();

    // The unit is persisted (keyed by Item ID, quantity 1).
    expect(JSON.parse(localStorage.getItem("23-1689"))?.["Qty."]).toBe(1);

    // The card swapped to the in-cart layout, which offers remove only.
    expect(await screen.findByLabelText("DecrementQty")).toBeInTheDocument();
    expect(screen.queryByLabelText("IncrementQty")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("AddToCart")).not.toBeInTheDocument();
  });

  it("instantly adds a sized item as the exact unit without a size prompt", async () => {
    const user = userEvent.setup();

    renderWithProviders(<InStockCard item={sizedItem} />);

    await user.click(screen.getByLabelText("AddToCart"));

    // No size step for a single add - the exact displayed unit is added.
    expect(
      screen.queryByText(/Select size range for Left Foot Shell/i)
    ).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("22-1287"))?.["Qty."]).toBe(1);
    expect(await screen.findByLabelText("DecrementQty")).toBeInTheDocument();
  });
});

describe("cart remove flow", () => {
  it("removes an in-cart unit when the decrement control is clicked", async () => {
    const user = userEvent.setup();
    // Pre-seed the unit into the cart so the card renders the in-cart layout.
    localStorage.setItem("23-1689", JSON.stringify({ ...noSizeItem, "Qty.": 1 }));

    renderWithProviders(<InStockCard item={noSizeItem} />);

    expect(screen.getByLabelText("DecrementQty")).toBeInTheDocument();

    await user.click(screen.getByLabelText("DecrementQty"));

    // The unit is gone from storage and the card reverts to the add control.
    expect(localStorage.getItem("23-1689")).toBeNull();
    expect(await screen.findByLabelText("AddToCart")).toBeInTheDocument();
  });
});
