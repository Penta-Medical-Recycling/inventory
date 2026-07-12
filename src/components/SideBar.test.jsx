// The Parts filter and the lower-leg diagram are only shown when the Extremity
// filter is set to "Lower". This test drives the real drawer flow to verify that.
import { describe, it, expect } from "vitest";
import { useContext, useEffect } from "react";
import { renderWithProviders, screen, userEvent } from "../test/utils";
import PentaContext from "../context/PentaContext";
import SideBar from "./SideBar";

// Opens the drawer on mount via the real context so the sidebar content renders
// (the drawer is closed by default and has no trigger of its own in this test).
function OpenSidebar() {
  const { setIsSideBarActive } = useContext(PentaContext);
  useEffect(() => {
    setIsSideBarActive(true);
  }, [setIsSideBarActive]);
  return null;
}

describe("SideBar Parts + leg diagram gating", () => {
  it("shows Parts and the leg diagram only for the Lower extremity", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <OpenSidebar />
        <SideBar />
      </>
    );

    // Drawer open -> choose an assistive device, then the Lower extremity.
    await user.click(await screen.findByRole("button", { name: "Prosthesis" }));
    await user.click(await screen.findByRole("button", { name: "Lower" }));

    // Parts (a unique option) and the diagram are both present for Lower.
    expect(screen.getByRole("button", { name: "Liners" })).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /lower extremity/i })
    ).toBeInTheDocument();

    // Bidirectional: clicking a leg part selects the matching Parts filter.
    await user.click(screen.getByRole("button", { name: "Select Feet" }));
    expect(screen.getByRole("button", { name: "Feet" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    // Switching to Upper hides both again.
    await user.click(screen.getByRole("button", { name: "Upper" }));
    expect(
      screen.queryByRole("button", { name: "Liners" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: /lower extremity/i })
    ).not.toBeInTheDocument();
  });
});
