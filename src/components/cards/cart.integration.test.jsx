// Integration tests for the add-to-cart / remove-from-cart flow driven by InStockCard.
// These exercise the real collaboration between InStockCard, QuantityModal, MessageModal,
// PentaProvider (cart count) and browser storage:
//   - the cart is persisted in localStorage keyed by "Item ID" (each physical unit = one key)
//   - the FIFO fulfilment logic reads the cached master list from sessionStorage
//     ("allInventoryItems"), so tests seed it the same way the app populates it.
// setup.js clears localStorage + sessionStorage after each test for isolation.
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, userEvent } from "../../test/utils";
import InStockCard from "./InStockCard";
import { inventoryRecords } from "../../test/mocks/fixtures";

const sizedItem = inventoryRecords[0].fields; // "Left Foot Shell", Size 29, Item ID "22-1287"
const noSizeItem = inventoryRecords[1].fields; // "Socket, Left leg", no Size, Item ID "23-1689"

// The FIFO fulfilment path reads the cached master list from sessionStorage.
const seedMasterList = (fields) =>
  sessionStorage.setItem("allInventoryItems", JSON.stringify(fields));

describe("cart add flow", () => {
  it("adds a no-size item to the cart through the quantity modal", async () => {
    const user = userEvent.setup();
    seedMasterList([noSizeItem]);

    renderWithProviders(<InStockCard item={noSizeItem} />);

    // Precondition: not in the cart yet.
    expect(screen.getByLabelText("AddToCart")).toBeInTheDocument();
    expect(localStorage.getItem("23-1689")).toBeNull();

    await user.click(screen.getByLabelText("AddToCart"));

    // No size on this item, so the modal opens straight on the quantity step.
    expect(await screen.findByText(/How many units/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // The unit is persisted (keyed by Item ID, quantity 1).
    expect(JSON.parse(localStorage.getItem("23-1689"))?.["Qty."]).toBe(1);

    // The card swapped to the in-cart layout.
    expect(await screen.findByLabelText("IncrementQty")).toBeInTheDocument();
    expect(screen.getByLabelText("DecrementQty")).toBeInTheDocument();
    expect(screen.queryByLabelText("AddToCart")).not.toBeInTheDocument();
    expect(screen.getByText("In cart")).toBeInTheDocument();
  });

  it("adds a sized item after choosing the size step", async () => {
    const user = userEvent.setup();
    seedMasterList([sizedItem]);

    renderWithProviders(<InStockCard item={sizedItem} />);

    await user.click(screen.getByLabelText("AddToCart"));

    // Sized item → the size-range step comes first.
    expect(
      await screen.findByText(/Select size range for Left Foot Shell/i)
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Then the quantity step.
    expect(await screen.findByText(/How many units/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(JSON.parse(localStorage.getItem("22-1287"))?.["Qty."]).toBe(1);
    expect(await screen.findByLabelText("DecrementQty")).toBeInTheDocument();
  });

  it("fulfils a multi-unit request by adding distinct records (FIFO)", async () => {
    const user = userEvent.setup();
    // Two distinct physical units that share a description; no size so the
    // quantity step is reached directly.
    const unitA = { "Description (from SKU)": ["Test Pylon"], "Item ID": "T-001" };
    const unitB = { "Description (from SKU)": ["Test Pylon"], "Item ID": "T-002" };
    seedMasterList([unitA, unitB]);

    renderWithProviders(<InStockCard item={unitA} />);

    await user.click(screen.getByLabelText("AddToCart"));
    await screen.findByText(/How many units/i);

    // Bump the requested quantity from 1 to 2, then submit.
    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Both distinct records are now in the cart, each stored with quantity 1.
    expect(JSON.parse(localStorage.getItem("T-001"))?.["Qty."]).toBe(1);
    expect(JSON.parse(localStorage.getItem("T-002"))?.["Qty."]).toBe(1);
  });

  it("shows a loading message and adds nothing when the master list isn't ready", async () => {
    const user = userEvent.setup();
    // Intentionally do NOT seed sessionStorage: the master list is still loading.

    renderWithProviders(<InStockCard item={noSizeItem} />);

    await user.click(screen.getByLabelText("AddToCart"));
    await screen.findByText(/How many units/i);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(/still loading/i)).toBeInTheDocument();
    // Nothing was written to the cart and the card stays in its add state.
    expect(localStorage.getItem("23-1689")).toBeNull();
    expect(screen.queryByLabelText("DecrementQty")).not.toBeInTheDocument();
  });
});

describe("cart remove flow", () => {
  it("removes an in-cart unit when the decrement control is clicked", async () => {
    const user = userEvent.setup();
    // Pre-seed the unit into the cart so the card renders the in-cart layout.
    localStorage.setItem("23-1689", JSON.stringify({ ...noSizeItem, "Qty.": 1 }));

    renderWithProviders(<InStockCard item={noSizeItem} />);

    expect(screen.getByLabelText("DecrementQty")).toBeInTheDocument();
    expect(screen.getByText("In cart")).toBeInTheDocument();

    await user.click(screen.getByLabelText("DecrementQty"));

    // The unit is gone from storage and the card reverts to the add control.
    expect(localStorage.getItem("23-1689")).toBeNull();
    expect(await screen.findByLabelText("AddToCart")).toBeInTheDocument();
    expect(screen.queryByText("In cart")).not.toBeInTheDocument();
  });
});
