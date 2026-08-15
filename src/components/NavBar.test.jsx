import { MemoryRouter } from "react-router-dom";
import { render, screen, userEvent } from "../test/utils";
import PentaContext from "../context/PentaContext";
import { ANNOUNCEMENT_DISMISSAL_KEY } from "../lib/storage";
import NavBar from "./NavBar";

const bulkOrderMessage =
  "We have added a bulk order feature! You can now select multiple items.";

const renderNavBar = (message = bulkOrderMessage) =>
  render(
    <MemoryRouter>
      <PentaContext.Provider
        value={{
          selectedPartner: "",
          cartCount: 0,
          isCartPressed: false,
          isSideBarActive: false,
          popUpStatus: "Online",
          message,
        }}
      >
        <NavBar />
      </PentaContext.Provider>
    </MemoryRouter>,
    { withProviders: false }
  );

describe("NavBar announcements", () => {
  it("shows the guidance once and persists its dismissal", async () => {
    const user = userEvent.setup();
    const { unmount } = renderNavBar();

    expect(
      await screen.findByRole("heading", { name: "Adding multiple items" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "close" }));
    expect(
      screen.queryByRole("heading", { name: "Adding multiple items" })
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(ANNOUNCEMENT_DISMISSAL_KEY)).toBe(
      "bulk-order-workflow-v2"
    );

    unmount();
    renderNavBar();
    expect(
      screen.queryByRole("heading", { name: "Adding multiple items" })
    ).not.toBeInTheDocument();
  });

  it("can be reopened from the announcements button", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      ANNOUNCEMENT_DISMISSAL_KEY,
      "bulk-order-workflow-v2"
    );
    renderNavBar();

    await user.click(screen.getByRole("button", { name: "Announcements" }));
    expect(
      screen.getByRole("heading", { name: "Adding multiple items" })
    ).toBeInTheDocument();
  });

  it("shows a new administrator announcement after prior guidance was dismissed", async () => {
    localStorage.setItem(
      ANNOUNCEMENT_DISMISSAL_KEY,
      "bulk-order-workflow-v2"
    );
    renderNavBar("Inventory maintenance begins at 5 PM.");

    expect(
      await screen.findByText("Inventory maintenance begins at 5 PM.")
    ).toBeInTheDocument();
  });
});