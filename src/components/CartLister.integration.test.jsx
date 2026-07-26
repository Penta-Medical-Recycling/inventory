// Integration tests for how the cart surfaces the "Unavailable" state.
// CartLister is the component that decides — per item — whether to render an
// InStockCard or an OutOfStockCard, based on the `outOfStock` set that Cart.jsx
// builds after validating each Item ID against the backend. These tests drive that
// branching through real localStorage the same way the cart does.
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen } from "../test/utils";
import CartLister from "./CartLister";
import { inventoryRecords } from "../test/mocks/fixtures";

const item = inventoryRecords[0].fields; // "Left Foot Shell", Item ID "22-1287"
const itemId = item["Item ID"];

// The cart persists each unit in localStorage keyed by its Item ID.
const seedCartItem = (fields) =>
  localStorage.setItem(fields["Item ID"], JSON.stringify(fields));

describe("cart unavailable state", () => {
  it("renders an item as Unavailable when its id is in the out-of-stock set", () => {
    seedCartItem(item);

    renderWithProviders(
      <CartLister
        outOfStock={new Set([itemId])}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{ [itemId]: "done" }}
      />
    );

    // The muted status pill is shown...
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    // ...alongside the single "remove from cart" action.
    expect(screen.getByLabelText("RemoveFromCart")).toBeInTheDocument();
    // The item is NOT rendered as an orderable in-stock card.
    expect(screen.queryByLabelText("AddToCart")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("IncrementQty")).not.toBeInTheDocument();
    expect(screen.queryByText("In cart")).not.toBeInTheDocument();
  });

  it("renders the same item as an in-stock cart card when it is not flagged", () => {
    seedCartItem(item);

    renderWithProviders(
      <CartLister
        outOfStock={new Set()}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{ [itemId]: "done" }}
      />
    );

    // No unavailable state: the item shows the normal in-cart controls instead.
    expect(screen.queryByText("Unavailable")).not.toBeInTheDocument();
    expect(screen.getByText("In cart")).toBeInTheDocument();
    expect(screen.getByLabelText("DecrementQty")).toBeInTheDocument();
  });
});
