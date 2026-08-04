// Unit coverage for QuantityModal's sized bulk flow: the size step warns
// preemptively (and blocks advancing) when no inventory matches the selection.
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "../../test/utils";
import QuantityModal from "./QuantityModal";

const renderModal = (props = {}) =>
  render(
    <QuantityModal
      itemName="Valve Plate"
      currentItemId={null}
      hasSize
      onSubmit={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
    { withProviders: false }
  );

describe("QuantityModal size availability", () => {
  it("warns and disables Next when no items match the selected size", () => {
    renderModal({ getAvailableCount: () => 0 });

    expect(screen.getByRole("alert")).toHaveTextContent(/no items available in this size/i);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("allows advancing to the quantity step when the size has stock", async () => {
    const user = userEvent.setup();
    renderModal({ getAvailableCount: () => 3 });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const next = screen.getByRole("button", { name: "Next" });
    expect(next).toBeEnabled();
    await user.click(next);

    expect(await screen.findByText(/How many units/i)).toBeInTheDocument();
    expect(screen.getByText(/available to add/i)).toBeInTheDocument();
  });

  it("returns to the size step from the quantity step via the back arrow", async () => {
    const user = userEvent.setup();
    renderModal({ getAvailableCount: () => 3 });

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText(/How many units/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back to size selection/i }));

    expect(screen.getByRole("heading", { name: /size range/i })).toBeInTheDocument();
    expect(screen.queryByText(/How many units/i)).not.toBeInTheDocument();
  });

  it("switches to exact-size mode and blocks Next until a value is entered", async () => {
    const user = userEvent.setup();
    renderModal({ getAvailableCount: () => 3 });

    // Range mode shows the slider, not the exact input.
    expect(screen.queryByPlaceholderText(/e\.g\. 26\.5/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /exact size/i }));

    const exactInput = screen.getByPlaceholderText(/e\.g\. 26\.5/i);
    expect(exactInput).toBeInTheDocument();
    // No value yet - can't proceed.
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    await user.type(exactInput, "26.5");
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });
});
