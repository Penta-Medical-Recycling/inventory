// Integration tests for the grouped cart and its per-unit availability states.
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
  it("summarizes and renders an unavailable item within its SKU group", () => {
    seedCartItem(item);

    renderWithProviders(
      <CartLister
        outOfStock={new Set([itemId])}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{ [itemId]: "done" }}
      />
    );

    expect(screen.getByText(/1 unavailable/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /collapse left foot shell/i })).toBeInTheDocument();

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /remove left foot shell 22-1287 from cart/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add .* to cart/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("IncrementQty")).not.toBeInTheDocument();
  });

  it("renders the same item as an in-stock cart row when it is not flagged", () => {
    seedCartItem({
      ...item,
      Image: [{ thumbnails: { small: { url: "https://example.com/item-small.png" } } }],
    });

    renderWithProviders(
      <CartLister
        outOfStock={new Set()}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{ [itemId]: "done" }}
      />
    );

    // No unavailable state: the item shows the normal removable cart row instead.
    expect(screen.queryByText("Unavailable")).not.toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "https://example.com/item-small.png"
    );
    expect(
      screen.getByRole("button", { name: /remove left foot shell 22-1287 from cart/i })
    ).toBeInTheDocument();
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

    await user.click(
      screen.getByRole("button", { name: /remove left foot shell 22-1287 from cart/i })
    );

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

    expect(screen.getByText(/1 couldn't verify/i)).toBeInTheDocument();
    expect(screen.getByText("Couldn't verify")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /remove left foot shell 22-1287 from cart/i })
    ).toBeEnabled();
  });

  it("groups by SKU name and sorts children by size then Item ID", async () => {
    const user = userEvent.setup();
    const makeItem = ({ name, sku, size, itemId }) => ({
      "Description (from SKU)": [name],
      "SKU Item Code": [sku],
      "Item ID": itemId,
      ...(size == null ? {} : { Size: size }),
    });

    [
      makeItem({ name: "Alpha Brace", sku: "ALPHA", size: 2, itemId: "A-10" }),
      makeItem({ name: "Beta Foot", sku: "BETA", size: 4, itemId: "B-1" }),
      makeItem({ name: "Alpha Brace", sku: "ALPHA", size: 10, itemId: "A-1" }),
      makeItem({ name: "Alpha Brace", sku: "ALPHA", size: 2, itemId: "A-2" }),
      makeItem({ name: "Alpha Brace", sku: "ALPHA", itemId: "A-20" }),
      makeItem({ name: "Alpha Brace", sku: "ALPHA", itemId: "A-3" }),
    ].forEach(seedCartItem);

    renderWithProviders(
      <CartLister
        outOfStock={new Set()}
        setOutOfStock={vi.fn()}
        itemValidationStatus={{}}
      />
    );

    expect(
      screen
        .getAllByRole("button", { name: /^collapse (?!all)/i })
        .map((button) => button.getAttribute("aria-label"))
    ).toEqual(["Collapse Alpha Brace, 5 items", "Collapse Beta Foot, 1 item"]);
    expect(screen.queryByText("Size 2 x 2 · Size 10 x 1")).not.toBeInTheDocument();
    expect(screen.queryByText("ALPHA")).not.toBeInTheDocument();
    expect(screen.queryByText(/no size/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Universal size" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Expand all" }));

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)
    ).toEqual(["Size 2", "Size 10", "Universal size", "Size 4"]);
    expect(
      screen.getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)
    ).toEqual(["A-2", "A-10", "A-1", "A-3", "A-20", "B-1"]);
  });
});
