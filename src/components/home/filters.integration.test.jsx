// Integration tests for the filter UI. These drive the real Search + SideBar
// through user interactions and assert the exact Airtable `filterByFormula` the
// app would send (via urlCreator). We assert the *query we build* rather than
// mock-filtered results on purpose: the actual filtering runs in Airtable, so a
// filter-aware mock would just re-implement (and test) that eval, not our code.
import { describe, it, expect } from "vitest";
import { useContext, useEffect } from "react";
import {
  renderWithProviders,
  screen,
  within,
  userEvent,
  waitFor,
} from "../../test/utils";
import PentaContext from "../../context/PentaContext";
import SideBar from "../SideBar";
import Search from "./Search";

// Opens the filters drawer on mount.
function OpenFilters() {
  const { setIsSideBarActive } = useContext(PentaContext);
  useEffect(() => setIsSideBarActive(true), [setIsSideBarActive]);
  return null;
}

// Renders the decoded query urlCreator() would send for the current selections.
function QueryProbe() {
  const { urlCreator } = useContext(PentaContext);
  return <div data-testid="query">{decodeURIComponent(urlCreator())}</div>;
}

const query = () => screen.getByTestId("query").textContent;

// Scope a lookup to a toggle group by its label (AssistiveDevice and Extremity
// both contain an "All" button, so unscoped queries would be ambiguous).
const group = (labelText) => within(screen.getByText(labelText).closest("div"));

async function setup() {
  const result = renderWithProviders(
    <>
      <OpenFilters />
      <Search />
      <SideBar />
      <QueryProbe />
    </>
  );
  await screen.findByText("Assistive Device");
  return result;
}

async function chooseAssistive(user, name) {
  await user.click(group("Assistive Device").getByRole("button", { name }));
  await screen.findByText("Extremity");
}

async function chooseExtremity(user, name) {
  await user.click(group("Extremity").getByRole("button", { name }));
}

describe("Filter integration → Airtable query", () => {
  it("keyword search adds a StringSearch condition", async () => {
    const user = userEvent.setup();
    await setup();

    await user.type(screen.getByPlaceholderText("Search"), "foot");

    await waitFor(() =>
      expect(query()).toContain('SEARCH("foot", {StringSearch})')
    );
  });

  it("assistive device + lower extremity + part → tag, limb guide, and non-arm conditions", async () => {
    const user = userEvent.setup();
    await setup();

    await chooseAssistive(user, "Prosthesis");
    await chooseExtremity(user, "Lower");
    await user.click(await screen.findByRole("button", { name: "Feet" }));

    await waitFor(() => {
      const q = query();
      expect(q).toContain('FIND("Prosthesis", ARRAYJOIN({Tag}))');
      expect(q).toContain('FIND("Feet", ARRAYJOIN({Limb Guide}))');
      expect(q).toContain('NOT(FIND("Arms/ Hands", ARRAYJOIN({Limb Guide})))');
    });
  });

  it("assistive device + upper extremity → hides parts and filters to Arms/Hands", async () => {
    const user = userEvent.setup();
    await setup();

    await chooseAssistive(user, "Orthosis");
    await chooseExtremity(user, "Upper");

    // Upper extremity shows no Parts selector / leg diagram.
    expect(
      screen.queryByRole("group", { name: /lower extremity/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Liners" })
    ).not.toBeInTheDocument();

    await waitFor(() => {
      const q = query();
      expect(q).toContain('FIND("Orthosis", ARRAYJOIN({Tag}))');
      expect(q).toContain('FIND("Arms/ Hands", ARRAYJOIN({Limb Guide}))');
    });
  });

  it("selecting a manufacturer adds a Manufacturer equality", async () => {
    const user = userEvent.setup();
    await setup();

    // Reveal the manufacturer/pediatric/size controls without adding filters.
    await chooseAssistive(user, "All");
    await chooseExtremity(user, "All");

    // Open the manufacturer combobox and pick "3M". The drawer and the combobox
    // popup both render in portals, so query the whole document and scope the
    // option lookup to the open popup.
    const manuSection = screen
      .getAllByText("Manufacturer")
      .find((element) => element.tagName === "LABEL")
      .closest(".filter-section");
    await user.click(manuSection.querySelector("[data-slot='combobox-chip-input']"));
    const popup = await waitFor(() => {
      const el = document.querySelector("[data-slot='combobox-content']");
      if (!el) throw new Error("manufacturer combobox did not open");
      return el;
    });
    await user.click(await within(popup).findByText("3M", {}, { timeout: 3000 }));

    await waitFor(() => expect(query()).toContain("{Manufacturer}='3M'"));
  });

  it("enabling Pediatric adds the Pediatric tag condition", async () => {
    const user = userEvent.setup();
    await setup();

    await chooseAssistive(user, "All");
    await chooseExtremity(user, "All");
    await user.click(await screen.findByText("Show pediatric-sized products"));

    await waitFor(() =>
      expect(query()).toContain('FIND("Pediatric", ARRAYJOIN({Tag}))')
    );
  });

  it("pediatric + assistive device requires both tags", async () => {
    const user = userEvent.setup();
    await setup();

    await chooseAssistive(user, "Prosthesis");
    await chooseExtremity(user, "All");
    await user.click(await screen.findByText("Show pediatric-sized products"));

    await waitFor(() => {
      const q = query();
      expect(q).toContain('FIND("Prosthesis", ARRAYJOIN({Tag}))');
      expect(q).toContain('FIND("Pediatric", ARRAYJOIN({Tag}))');
    });
  });

  it("narrowing the size range adds a Size lower bound", async () => {
    const user = userEvent.setup();
    await setup();

    await chooseAssistive(user, "All");
    await chooseExtremity(user, "All");

    const minInput = await screen.findByLabelText("Min size");
    await user.clear(minInput);
    await user.type(minInput, "5");

    await waitFor(() => expect(query()).toContain("{Size} >= 5"));
  });
});
