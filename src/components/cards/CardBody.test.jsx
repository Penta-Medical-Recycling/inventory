// Pure presentational component: no network and no providers required.
// Covers rendering of array-valued Airtable fields and graceful handling of missing fields.
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../../test/utils";
import CardBody from "./CardBody";
import { inventoryRecords } from "../../test/mocks/fixtures";

const fullRecord = inventoryRecords[0].fields; // well-populated
const edgeRecord = inventoryRecords[2].fields; // no Item ID / Size / Manufacturer / Model

describe("CardBody", () => {
  it("renders details from a fully-populated inventory record", () => {
    renderWithProviders(<CardBody item={fullRecord} />, { withProviders: false });

    expect(screen.getByText("22-1287")).toBeInTheDocument(); // Item ID
    expect(screen.getByText("Left Foot Shell")).toBeInTheDocument(); // Description (array field)
    expect(screen.getByText("Prosthesis")).toBeInTheDocument(); // Tag (array field)
    expect(screen.getByText("29")).toBeInTheDocument(); // Size
    expect(screen.getByText("Freedom Innovation")).toBeInTheDocument(); // Manufacturer
    expect(screen.getByText("Manufacturer")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
  });

  it("does not crash and omits optional blocks for a sparse record", () => {
    renderWithProviders(<CardBody item={edgeRecord} />, { withProviders: false });

    expect(screen.getByText("Pylon, with Integrated Tube Clamp")).toBeInTheDocument();
    // Optional labels are absent because Manufacturer / Size / Model fields are missing.
    expect(screen.queryByText("Manufacturer")).not.toBeInTheDocument();
    expect(screen.queryByText("Size")).not.toBeInTheDocument();
    expect(screen.queryByText("Model")).not.toBeInTheDocument();
  });
});
