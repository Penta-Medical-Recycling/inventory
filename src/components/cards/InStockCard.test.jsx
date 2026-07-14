// InStockCard reflects cart state from localStorage and opens the QuantityModal when the add
// button is clicked. Relies on the afterEach hook in setup.js clearing localStorage between tests
// for isolation.
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

  it("opens the quantity modal when add-to-cart is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InStockCard item={item} />);

    await user.click(screen.getByLabelText("AddToCart"));

    // Item has a Size, so the modal opens on the size-range step for the item name.
    expect(
      await screen.findByText(/Select size range for Left Foot Shell/i)
    ).toBeInTheDocument();
  });

  it("reflects in-cart state when the item is pre-seeded in localStorage", () => {
    localStorage.setItem(item["Item ID"], JSON.stringify({ ...item, "Qty.": 1 }));

    renderWithProviders(<InStockCard item={item} />);

    // In-cart layout swaps the single add button for increment/decrement controls.
    expect(screen.getByLabelText("DecrementQty")).toBeInTheDocument();
    expect(screen.getByLabelText("IncrementQty")).toBeInTheDocument();
    expect(screen.queryByLabelText("AddToCart")).not.toBeInTheDocument();
  });
});
