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

    expect(screen.getByLabelText("AddToCart")).toBeInTheDocument();
    expect(screen.queryByLabelText("DecrementQty")).not.toBeInTheDocument();
  });

  it("instantly adds the exact unit when add-to-cart is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InStockCard item={item} />);

    await user.click(screen.getByLabelText("AddToCart"));

    // No size prompt for a single add; the exact unit is persisted immediately.
    expect(
      screen.queryByText(/Select size range for Left Foot Shell/i)
    ).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(item["Item ID"]))?.["Qty."]).toBe(1);
    expect(await screen.findByLabelText("DecrementQty")).toBeInTheDocument();
  });

  it("shows only a remove control when the item is in the cart", () => {
    localStorage.setItem(item["Item ID"], JSON.stringify({ ...item, "Qty.": 1 }));

    renderWithProviders(<InStockCard item={item} />);

    // In-cart layout offers remove only - no add/increment affordance.
    expect(screen.getByLabelText("DecrementQty")).toBeInTheDocument();
    expect(screen.queryByLabelText("IncrementQty")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("AddToCart")).not.toBeInTheDocument();
  });
});
