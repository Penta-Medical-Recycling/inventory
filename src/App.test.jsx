// Integration test for the App-level Maintenance/Home gate.
// PentaProvider fetches /Site-Status on mount; App renders Maintenance when the platform record
// reports "Offline", otherwise the normal Home UI.
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen } from "./test/utils";
import App from "./App";
import { AIRTABLE_API_URL, AIRTABLE_BASE_ID } from "./config/airtable";
import { server } from "./test/mocks/server";
import { siteStatusOfflineRecords } from "./test/mocks/fixtures";

const SITE_STATUS_URL =
  `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Site-Status`;

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

  it("holds a loading screen until the status resolves, then shows Home", async () => {
    renderWithProviders(<App />);

    // serverStatus starts as null (unknown). The app must NOT render inventory
    // yet - it holds a loading screen so a request can't start before an
    // eventual "Offline" response would replace the UI.
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByAltText("logo")).not.toBeInTheDocument();

    // Once the status resolves to Online, the Home UI appears.
    expect(await screen.findByAltText("logo")).toBeInTheDocument();
    expect(screen.queryByAltText("Company Logo")).not.toBeInTheDocument();
  });

  it("shows an error message when the status fetch fails", async () => {
    server.use(http.get(SITE_STATUS_URL, () => HttpResponse.error()));

    renderWithProviders(<App />);

    // A host failure surfaces an error rather than the Maintenance screen.
    expect(
      await screen.findByText(/trouble reaching the inventory service/i)
    ).toBeInTheDocument();
    expect(screen.queryByAltText("Company Logo")).not.toBeInTheDocument();
  });
});
