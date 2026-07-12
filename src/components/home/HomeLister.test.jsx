// Verifies the search input is debounced: typing several characters quickly
// results in a single inventory request for the final term, not one per key.
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, waitFor } from "../../test/utils";
import { server } from "../../test/mocks/server";
import { inventoryRecords } from "../../test/mocks/fixtures";
import Search from "./Search";
import HomeLister from "./HomeLister";

const INVENTORY_URL = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory";

describe("Home search debounce", () => {
  it("issues a single request for the final term when typing quickly", async () => {
    // Record every inventory request's (decoded) query so we can inspect the
    // search terms it carried. Respond without an offset so pagination stops.
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
        <Search />
        <HomeLister onRemove={false} setOnRemove={() => {}} />
      </>
    );

    await user.type(screen.getByPlaceholderText("Search ..."), "abc");

    // Exactly one request carries the fully-typed term.
    await waitFor(
      () =>
        expect(
          queries.filter((q) => q.includes('SEARCH("abc",')).length
        ).toBe(1),
      { timeout: 4000 }
    );

    // Intermediate keystrokes ("a", "ab") never triggered a request.
    expect(
      queries.filter(
        (q) => q.includes('SEARCH("a",') || q.includes('SEARCH("ab",')
      )
    ).toHaveLength(0);
  });
});
