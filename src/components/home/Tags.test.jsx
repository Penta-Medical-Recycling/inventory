import { describe, expect, it, vi } from "vitest";
import PentaContext from "../../context/PentaContext";
import { renderWithProviders, screen, userEvent } from "../../test/utils";
import Tags from "./Tags";

const defaultContext = {
  selectedFilter: {
    Prosthesis: false,
    Orthosis: false,
    Pediatric: false,
  },
  isRangeOn: false,
  selectedManufacturer: [],
  selectedDescriptions: [],
  selectedPart: "",
  extremity: "All",
  isSideBarActive: false,
  setIsSideBarActive: vi.fn(),
  clearFilters: vi.fn(),
};

const renderTags = (overrides = {}) =>
  renderWithProviders(
    <PentaContext.Provider value={{ ...defaultContext, ...overrides }}>
      <Tags />
    </PentaContext.Provider>,
    { withProviders: false }
  );

describe("Tags", () => {
  it("hides the clear action when filters are at their defaults", () => {
    renderTags();

    expect(
      screen.queryByRole("button", { name: "Clear all filters" })
    ).not.toBeInTheDocument();
  });

  it("clears active filters from the home toolbar", async () => {
    const user = userEvent.setup();
    const clearFilters = vi.fn();
    renderTags({
      selectedFilter: { ...defaultContext.selectedFilter, Pediatric: true },
      clearFilters,
    });

    expect(screen.getByRole("button", { name: "1 Filter" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));

    expect(clearFilters).toHaveBeenCalledOnce();
  });
});