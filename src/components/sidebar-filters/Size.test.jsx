// Edge-case coverage for the Size range steppers: boundary buttons disable at
// 1 / largestSize, stepping works, and the regression where typing a below-min
// prefix (e.g. "3" toward "30") must not be clamped/overwritten mid-edit.
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { renderWithProviders, screen, userEvent } from "../../test/utils";
import PentaContext from "../../context/PentaContext";
import Size from "./Size";

// Renders <Size /> with a controlled PentaContext so tests can drive minValue,
// maxValue and largestSize and observe the committed setters.
function renderSize({ min = 1, max = 60, largestSize = 60 } = {}) {
  const setMinSpy = vi.fn();
  const setMaxSpy = vi.fn();

  function Harness() {
    const [minValue, setMinValue] = useState(min);
    const [maxValue, setMaxValue] = useState(max);
    const ctx = {
      minValue,
      maxValue,
      largestSize,
      setMinValue: (v) => {
        setMinSpy(v);
        setMinValue(v);
      },
      setMaxValue: (v) => {
        setMaxSpy(v);
        setMaxValue(v);
      },
    };
    return (
      <PentaContext.Provider value={ctx}>
        <Size />
      </PentaContext.Provider>
    );
  }

  renderWithProviders(<Harness />, { withProviders: false });
  return { setMinSpy, setMaxSpy };
}

describe("Size range steppers", () => {
  it("disables the Min decrement button at the lower bound (1)", () => {
    renderSize({ min: 1, max: 30, largestSize: 60 });

    expect(screen.getByRole("button", { name: "Decrease Min" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase Min" })).toBeEnabled();
  });

  it("disables the Max increment button at the upper bound (largestSize)", () => {
    renderSize({ min: 1, max: 60, largestSize: 60 });

    expect(screen.getByRole("button", { name: "Increase Max" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrease Max" })).toBeEnabled();
  });

  it("steps the value with the increment/decrement buttons", async () => {
    const user = userEvent.setup();
    const { setMinSpy, setMaxSpy } = renderSize({
      min: 5,
      max: 40,
      largestSize: 60,
    });

    await user.click(screen.getByRole("button", { name: "Increase Min" }));
    expect(setMinSpy).toHaveBeenCalledWith(6);

    await user.click(screen.getByRole("button", { name: "Decrease Max" }));
    expect(setMaxSpy).toHaveBeenCalledWith(39);
  });

  it("regression: typing a below-min prefix in Max isn't clamped mid-edit", async () => {
    const user = userEvent.setup();
    const { setMaxSpy } = renderSize({ min: 14, max: 20, largestSize: 60 });

    const maxInput = screen.getByLabelText("Max size");
    await user.clear(maxInput);
    await user.type(maxInput, "3");

    // "3" is below the min (14) but must stay as typed, not snap to 14.
    expect(maxInput).toHaveValue(3);
    expect(setMaxSpy).not.toHaveBeenCalledWith(14);

    // Finishing "30" commits the now in-range value.
    await user.type(maxInput, "0");
    expect(maxInput).toHaveValue(30);
    expect(setMaxSpy).toHaveBeenCalledWith(30);
  });

  it("clamps an out-of-range value to the bound on blur", async () => {
    const user = userEvent.setup();
    const { setMaxSpy } = renderSize({ min: 14, max: 20, largestSize: 60 });

    const maxInput = screen.getByLabelText("Max size");
    await user.clear(maxInput);
    await user.type(maxInput, "3");
    await user.tab(); // blur

    // Left at a below-min value, blur clamps it up to the min (14).
    expect(setMaxSpy).toHaveBeenCalledWith(14);
    expect(maxInput).toHaveValue(14);
  });
});
