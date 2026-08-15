import { render, screen } from "../../test/utils";
import PentaContext from "../../context/PentaContext";
import PopUpCard from "./PopUpCard";

const renderPopup = (message) =>
  render(
    <PentaContext.Provider value={{ message }}>
      <PopUpCard showModal onClose={() => {}} />
    </PentaContext.Provider>,
    { withProviders: false }
  );

describe("PopUpCard", () => {
  it("shows the current group-based workflow for the legacy bulk-order notice", () => {
    renderPopup(
      "We have added a bulk order feature! You can now select the quantity of the item you want when you add the first item. Please allow a few moments for the system to load."
    );

    expect(
      screen.getByRole("heading", { name: "Adding multiple items" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Add multiple to cart").closest("li")).toHaveTextContent(
      "Select Add multiple to cart above the inventory list."
    );
    expect(screen.queryByText(/before you begin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/when you add the first item/i)).not.toBeInTheDocument();
  });

  it("preserves unrelated administrator announcements", () => {
    renderPopup("Inventory maintenance begins at 5 PM.");

    expect(screen.getByText("Inventory maintenance begins at 5 PM.")).toBeInTheDocument();
  });
});