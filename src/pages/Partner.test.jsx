// The Partner page loads partner names via fetchSelectOptions("Partners") (-> GET /Partners) and
// filters them by a search box. Covers the empty-list edge case that the sort/map path handles
// gracefully.
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent } from "../test/utils";
import Partner from "./Partner";
import { server } from "../test/mocks/server";

const PARTNERS_URL = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Partners";

describe("Partner page", () => {
  it("lists partner names fetched from Airtable, sorted", async () => {
    renderWithProviders(<Partner />);

    // Names come from the mocked /Partners handler.
    expect(await screen.findByText("Mitch Dobson")).toBeInTheDocument();
    expect(screen.getByText("2ft Prosthetics")).toBeInTheDocument();
    expect(screen.getByText("Healing Hands for Haiti")).toBeInTheDocument();
  });

  it("filters the list as the user types in the search box", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Partner />);

    await screen.findByText("Mitch Dobson");

    await user.type(screen.getByPlaceholderText("Search"), "2ft");

    expect(screen.getByText("2ft Prosthetics")).toBeInTheDocument();
    expect(screen.queryByText("Mitch Dobson")).not.toBeInTheDocument();
  });

  it("renders no options when the partners list is empty (server.use override)", async () => {
    server.use(http.get(PARTNERS_URL, () => HttpResponse.json({ records: [] })));

    renderWithProviders(<Partner />);

    // Search box still renders; there are simply no partner options to show.
    expect(await screen.findByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.queryByText("Mitch Dobson")).not.toBeInTheDocument();
    expect(screen.queryByText("2ft Prosthetics")).not.toBeInTheDocument();
  });
});
