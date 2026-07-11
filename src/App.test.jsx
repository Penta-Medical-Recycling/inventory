// Integration test for the App-level Maintenance/Home gate.
// PentaProvider fetches /Site-Status on mount; App renders Maintenance when the platform record
// reports "Offline", otherwise the normal Home UI.
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen } from "./test/utils";
import App from "./App";
import { server } from "./test/mocks/server";
import { siteStatusOfflineRecords } from "./test/mocks/fixtures";

const SITE_STATUS_URL =
  "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Site-Status";

describe("App status gate", () => {
  it("renders the Home UI when the platform status is Online (default handler)", async () => {
    renderWithProviders(<App />);

    // NavBar logo (alt="logo") appears only on the non-maintenance layout.
    expect(await screen.findByAltText("logo")).toBeInTheDocument();
    // The Maintenance page uses a different alt text; it should be absent.
    expect(screen.queryByAltText("Company Logo")).not.toBeInTheDocument();
  });

  it("renders the Maintenance page when the platform status is Offline", async () => {
    server.use(
      http.get(SITE_STATUS_URL, () =>
        HttpResponse.json({ records: siteStatusOfflineRecords })
      )
    );

    renderWithProviders(<App />);

    expect(
      await screen.findByText("Under repairs. Thanks for your patience!")
    ).toBeInTheDocument();
    expect(screen.queryByAltText("logo")).not.toBeInTheDocument();
  });
});
