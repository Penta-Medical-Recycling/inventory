// Integration tests for the Description sidebar filter. These drive the real
// SideBar + HomeLister and assert the Airtable request HomeLister actually
// sends (its `filterByFormula`) as descriptions are selected/removed. Like the
// sibling filters.integration.test.jsx, we assert the *query we build* rather
// than mock-filtered results: the real filtering runs in Airtable, so a
// filter-aware mock would just re-implement that eval instead of our code.
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { useContext, useEffect } from "react";
import {
  renderWithProviders,
  screen,
  within,
  userEvent,
  waitFor,
} from "../../test/utils";
import { server } from "../../test/mocks/server";
import { inventoryRecords } from "../../test/mocks/fixtures";
import PentaContext from "../../context/PentaContext";
import SideBar from "../SideBar";
import HomeLister from "./HomeLister";

const INVENTORY_URL = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory";

// Opens the filters drawer on mount so the sidebar (and Description filter) renders.
function OpenFilters() {
  const { setIsSideBarActive } = useContext(PentaContext);
  useEffect(() => setIsSideBarActive(true), [setIsSideBarActive]);
  return null;
}

async function setup() {
  // Seed the cached master list BEFORE rendering. This is where the Description
  // filter sources its options from, and it also lets HomeLister skip its
  // background master-list fetch so the only inventory requests are the display
  // fetches whose query we want to inspect.
  sessionStorage.setItem(
    "allInventoryItems",
    JSON.stringify(inventoryRecords.map((r) => r.fields))
  );

  // Record every inventory request's decoded query so we can inspect the
  // filterByFormula it carried. Respond without an offset so pagination stops.
  const queries = [];
  server.use(
    http.get(INVENTORY_URL, ({ request }) => {
      queries.push(decodeURIComponent(new URL(request.url).search));
      return HttpResponse.json({ records: inventoryRecords });
    })
  );

  const user = userEvent.setup();
  renderWithProviders(
    <>
      <OpenFilters />
      <SideBar />
      <HomeLister onRemove={false} setOnRemove={() => {}} />
    </>
  );

  // The Description filter is visible once the drawer opens.
  await screen.findByText("Description");
  return { user, queries };
}

// The Description filter section (scoped so we don't collide with the sibling
// Manufacturer combobox).
const descSection = () => screen.getByText("Description").closest(".filter-section");

// The chips input that opens the Description combobox popup.
const descInput = () => descSection().querySelector("[data-slot='combobox-chip-input']");

// The open combobox popup, portalled to the body. Only one combobox is ever
// open at a time, so this unambiguously targets the Description list.
async function openDescriptionPopup(user) {
  await user.click(descInput());
  return waitFor(() => {
    const popup = document.querySelector("[data-slot='combobox-content']");
    if (!popup) throw new Error("Description combobox did not open");
    return popup;
  });
}

// Select a description option by its label. Scoped to the popup because the
// same description text also appears on the inventory cards below.
async function selectDescription(user, label) {
  const popup = await openDescriptionPopup(user);
  await user.click(within(popup).getByText(label));
}

// The Manufacturer filter section (a sibling combobox) and a helper to pick one.
// The inventory cards also render a "Manufacturer" label, so target the sidebar
// filter's <label> specifically.
const manuSection = () =>
  screen
    .getAllByText("Manufacturer")
    .find((el) => el.tagName === "LABEL")
    .closest(".filter-section");

async function selectManufacturer(user, label) {
  await user.click(manuSection().querySelector("[data-slot='combobox-chip-input']"));
  const popup = await waitFor(() => {
    const el = document.querySelector("[data-slot='combobox-content']");
    if (!el) throw new Error("Manufacturer combobox did not open");
    return el;
  });
  await user.click(await within(popup).findByText(label));
}

describe("Description filter → HomeLister inventory query", () => {
  it("lists description options sourced from the inventory data", async () => {
    const { user } = await setup();

    const popup = await openDescriptionPopup(user);
    // The three distinct "Description (from SKU)" values from the fixtures.
    expect(within(popup).getByText("Left Foot Shell")).toBeInTheDocument();
    expect(
      within(popup).getByText("Pylon, with Integrated Tube Clamp")
    ).toBeInTheDocument();
    expect(within(popup).getByText("Socket, Left leg")).toBeInTheDocument();
  });

  it("selecting a description adds an OR SEARCH condition to the request", async () => {
    const { user, queries } = await setup();

    await selectDescription(user, "Left Foot Shell");

    await waitFor(() =>
      expect(
        queries.some((q) =>
          q.includes('OR(SEARCH("left foot shell", {StringSearch}))')
        )
      ).toBe(true)
    );
  });

  it("selecting multiple descriptions ORs their SEARCH conditions together", async () => {
    const { user, queries } = await setup();

    await selectDescription(user, "Left Foot Shell");
    await selectDescription(user, "Socket, Left leg");

    await waitFor(() => {
      const hit = queries.find(
        (q) =>
          q.includes('SEARCH("left foot shell", {StringSearch})') &&
          q.includes('SEARCH("socket left leg", {StringSearch})')
      );
      expect(hit).toBeTruthy();
      // Both terms live inside a single OR(...) group.
      expect(hit).toContain(
        'OR(SEARCH("left foot shell", {StringSearch}),SEARCH("socket left leg", {StringSearch}))'
      );
    });
  });

  it("does not add a description condition until one is selected", async () => {
    const { queries } = await setup();

    // The initial display fetch happens without any description selected.
    await waitFor(() => expect(queries.length).toBeGreaterThan(0));
    expect(
      queries.every((q) => !q.includes('SEARCH("left foot shell"'))
    ).toBe(true);
  });

  it("removing the selected description drops its condition from the next request", async () => {
    const { user, queries } = await setup();

    await selectDescription(user, "Left Foot Shell");
    await waitFor(() =>
      expect(
        queries.some((q) => q.includes('SEARCH("left foot shell"'))
      ).toBe(true)
    );

    // Remove the chip via its X button, then the follow-up request should no
    // longer carry the description condition.
    const chip = within(descSection()).getByLabelText("Left Foot Shell");
    await user.click(within(chip).getByRole("button"));

    await waitFor(() => {
      const last = queries[queries.length - 1];
      expect(last).not.toContain('SEARCH("left foot shell"');
    });
  });

  it("combines the description condition with a manufacturer equality in one request", async () => {
    const { user, queries } = await setup();

    await selectDescription(user, "Left Foot Shell");
    await selectManufacturer(user, "3M");

    // The request issued after both selections carries both filters together.
    await waitFor(() => {
      const hit = queries.find(
        (q) =>
          q.includes('OR(SEARCH("left foot shell", {StringSearch}))') &&
          q.includes("{Manufacturer}='3M'")
      );
      expect(hit).toBeTruthy();
    });
  });
});
