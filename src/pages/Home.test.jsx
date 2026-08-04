// Integration tests for the Option D group-level bulk order flow rendered by Home.
// A "Bulk add" action appears in the group-context bar only for single-SKU groups; it opens the
// shared QuantityModal and FIFO-fills units from the cached master inventory into localStorage.
// The SKU Groups + inventory endpoints are served by MSW; setup.js clears storage between tests.
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, userEvent } from "../test/utils";
import PentaProvider from "../context/PentaProvider";
import Home from "./Home";

// adb-m is a single-SKU group ("ADB-M"); orthotics is multi-SKU ("AAFO","ABL").
const renderHomeAtGroup = (groupKey) =>
  render(
    <MemoryRouter initialEntries={[`/?group=${groupKey}`]}>
      <PentaProvider>
        <Home />
      </PentaProvider>
    </MemoryRouter>
  );

const seedMasterList = (fields) =>
  sessionStorage.setItem("allInventoryItems", JSON.stringify(fields));

describe("Home group bulk order flow", () => {
  it("shows a Bulk add action for a single-SKU group", async () => {
    renderHomeAtGroup("adb-m");

    expect(
      await screen.findByRole("button", { name: /Bulk add Double Adapter - Male/i })
    ).toBeInTheDocument();
  });

  it("does not show Bulk add for a multi-SKU group", async () => {
    renderHomeAtGroup("orthotics");

    // The group context bar (back button) confirms the group resolved.
    expect(await screen.findByText("Orthotics")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Bulk add/i })).not.toBeInTheDocument();
  });

  it("FIFO-fills the requested units for the single SKU into the cart", async () => {
    const user = userEvent.setup();
    const unitA = {
      "Description (from SKU)": ["Double Adapter"],
      "SKU Item Code": ["ADB-M"],
      "Item ID": "A-001",
    };
    const unitB = {
      "Description (from SKU)": ["Double Adapter"],
      "SKU Item Code": ["ADB-M"],
      "Item ID": "A-002",
    };
    seedMasterList([unitA, unitB]);

    renderHomeAtGroup("adb-m");

    await user.click(
      await screen.findByRole("button", { name: /Bulk add Double Adapter - Male/i })
    );

    // No size on these units, so the modal opens on the quantity step.
    await screen.findByText(/How many units/i);
    await user.click(screen.getByRole("button", { name: "Increase Quantity" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(JSON.parse(localStorage.getItem("A-001"))?.["Qty."]).toBe(1);
    expect(JSON.parse(localStorage.getItem("A-002"))?.["Qty."]).toBe(1);
  });

  it("caps the quantity stepper at the available stock", async () => {
    const user = userEvent.setup();
    seedMasterList([
      {
        "Description (from SKU)": ["Double Adapter"],
        "SKU Item Code": ["ADB-M"],
        "Item ID": "A-001",
      },
    ]);

    renderHomeAtGroup("adb-m");

    await user.click(
      await screen.findByRole("button", { name: /Bulk add Double Adapter - Male/i })
    );
    await screen.findByText(/How many units/i);

    // Only one unit is in stock, so the modal reflects the cap and the increment
    // button is disabled - the user can't request more than exists.
    expect(await screen.findByText(/available to add/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase Quantity" })).toBeDisabled();

    // Submitting the capped quantity adds exactly the one available unit.
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(JSON.parse(localStorage.getItem("A-001"))?.["Qty."]).toBe(1);
  });
});
