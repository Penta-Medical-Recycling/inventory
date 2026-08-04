// Integration tests for how the cart surfaces the "Unavailable" state.
// CartLister is the component that decides — per item — whether to render an
// InStockCard or an OutOfStockCard, based on the `outOfStock` set that Cart.jsx
// builds after validating each Item ID against the backend. These tests drive that
// branching through real localStorage the same way the cart does.
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "../test/utils";
import CartLister, { getCartItemImageUrl } from "./CartLister";
import { inventoryRecords } from "../test/mocks/fixtures";

const item = inventoryRecords[0].fields; // "Left Foot Shell", Item ID "22-1287"
const itemId = item["Item ID"];

// The cart persists each unit in localStorage keyed by its Item ID.
const seedCartItem = (fields) =>
  localStorage.setItem(fields["Item ID"], JSON.stringify(fields));

it("resolves a cart item image from its SKU group", () => {
  expect(
    getCartItemImageUrl(item, [
      { skuCodes: ["LSHELL"], imageUrl: "https://example.com/left-foot-shell.png" },
    ])
  ).toBe("https://example.com/left-foot-shell.png");
});

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
    expect(screen.getByRole("button", { name: /remove left foot shell from cart/i })).toBeInTheDocument();
    // The item is NOT rendered as an orderable in-stock card.
    expect(screen.queryByLabelText("AddToCart")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("IncrementQty")).not.toBeInTheDocument();
  });

  it("renders the same item as an in-stock cart card when it is not flagged", () => {
    seedCartItem({
      ...item,
      Image: [{ thumbnails: { small: { url: "https://example.com/item-small.png" } } }],
    });

    const { container } = renderWithProviders(
      <CartLister
        outOfStock={new Set()}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{ [itemId]: "done" }}
      />
    );

    // No unavailable state: the item shows the normal removable cart row instead.
    expect(screen.queryByText("Unavailable")).not.toBeInTheDocument();
    expect(container.querySelector(".cart-list__media img")).toHaveAttribute(
      "src",
      "https://example.com/item-small.png"
    );
    expect(screen.getByRole("button", { name: /remove left foot shell from cart/i })).toBeInTheDocument();
  });

  it("removes a physical item from the cart list", async () => {
    const user = userEvent.setup();
    seedCartItem(item);

    renderWithProviders(
      <CartLister
        outOfStock={new Set()}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{ [itemId]: "done" }}
      />
    );

    await user.click(screen.getByRole("button", { name: /remove left foot shell from cart/i }));

    expect(localStorage.getItem(itemId)).toBeNull();
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("keeps an unverifiable item visible and removable", () => {
    seedCartItem(item);

    renderWithProviders(
      <CartLister
        outOfStock={new Set()}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{ [itemId]: "error" }}
      />
    );

    expect(screen.getByText("Couldn't verify")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /remove left foot shell from cart/i })
    ).toBeEnabled();
  });
});
