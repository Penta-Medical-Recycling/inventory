// InStockCard reflects cart state from localStorage. A single click on the add button adds the
// exact unit instantly (no modal); once in the cart the only control is remove.
// Relies on the afterEach hook in setup.js clearing localStorage between tests for isolation.
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, userEvent } from "../../test/utils";
import InStockCard from "./InStockCard";
import { inventoryRecords } from "../../test/mocks/fixtures";

const item = inventoryRecords[0].fields; // Item ID "22-1287", Description "Left Foot Shell", Size 29

describe("InStockCard", () => {
  it("shows the add-to-cart control when the item is not in the cart", () => {
    renderWithProviders(<InStockCard item={item} />);

    expect(screen.getByRole("button", { name: /Add Left Foot Shell to cart/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remove Left Foot Shell from cart/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View reference images for Left Foot Shell/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("In cart")).not.toBeInTheDocument();
  });

  it("instantly adds the exact unit when add-to-cart is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InStockCard item={item} />);

    await user.click(screen.getByRole("button", { name: /Add Left Foot Shell to cart/i }));

    // No size prompt for a single add; the exact unit is persisted immediately.
    expect(
      screen.queryByText(/Select size range for Left Foot Shell/i)
    ).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(item["Item ID"]))?.["Qty."]).toBe(1);
    expect(await screen.findByRole("button", { name: /Remove Left Foot Shell from cart/i })).toBeInTheDocument();
    expect(screen.getByLabelText("In cart")).toBeInTheDocument();
  });

  it("shows only a remove control when the item is in the cart", () => {
    localStorage.setItem(item["Item ID"], JSON.stringify({ ...item, "Qty.": 1 }));

    renderWithProviders(<InStockCard item={item} />);

    // In-cart layout offers remove only - no add/increment affordance.
    expect(screen.getByRole("button", { name: /Remove Left Foot Shell from cart/i })).toBeInTheDocument();
    expect(screen.getByLabelText("In cart")).toBeInTheDocument();
    expect(screen.queryByLabelText("IncrementQty")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add Left Foot Shell to cart/i })).not.toBeInTheDocument();
  });
});
