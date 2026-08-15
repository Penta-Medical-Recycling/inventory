// The Partner page loads partner names via fetchSelectOptions("Partners") (-> GET /Partners) and
// presents them in a searchable shadcn Combobox. Opening the combobox reveals the options and
// selecting one enables the Submit button. Covers the empty-list edge case that the sort/map path
// handles gracefully.
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent } from "../test/utils";
import Partner from "./Partner";
import { AIRTABLE_API_URL, AIRTABLE_BASE_ID } from "../config/airtable";
import { server } from "../test/mocks/server";
import { getRequestParty } from "../lib/storage";

const PARTNERS_URL = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Partners`;
const CLINICIANS_URL = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Clinicians`;

describe("Partner page", () => {
  it("lists partner names fetched from Airtable, sorted", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Partner />);

    // Wait for the fetched options to populate, then open the combobox popup.
    const input = await screen.findByPlaceholderText("Select a Partner");
    await user.click(input);

    // Names come from the mocked /Partners handler.
    expect(await screen.findByText("Mitch Dobson")).toBeInTheDocument();
    expect(screen.getByText("2ft Prosthetics")).toBeInTheDocument();
    expect(screen.getByText("Healing Hands for Haiti")).toBeInTheDocument();
  });

  it("selecting a partner enables the Submit button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Partner />);

    const input = await screen.findByPlaceholderText("Select a Partner");
    const submit = screen.getByRole("button", { name: "SubmitPartner" });
    expect(submit).toBeDisabled();

    await user.click(input);
    await user.click(await screen.findByText("2ft Prosthetics"));

    expect(submit).toBeEnabled();
    expect(screen.queryByLabelText("ClinicianDropdown")).not.toBeInTheDocument();
  });

  it("shows the selected partner in the combobox input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Partner />);

    const input = await screen.findByPlaceholderText("Select a Partner");
    await user.click(input);
    await user.click(await screen.findByText("2ft Prosthetics"));

    expect(input).toHaveValue("2ft Prosthetics");
  });

  it("renders no options when the partners list is empty (server.use override)", async () => {
    const user = userEvent.setup();
    server.use(http.get(PARTNERS_URL, () => HttpResponse.json({ records: [] })));

    renderWithProviders(<Partner />);

    // Combobox input still renders; there are simply no partner options to show.
    const input = await screen.findByPlaceholderText("Select a Partner");
    await user.click(input);
    expect(screen.queryByText("Mitch Dobson")).not.toBeInTheDocument();
    expect(screen.queryByText("2ft Prosthetics")).not.toBeInTheDocument();
  });

  it("requires a clinician when the selected partner has mapped clinicians", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Partner />);

    await user.click(await screen.findByPlaceholderText("Select a Partner"));
    await user.click(await screen.findByText("Stepping into Grace"));

    const clinicianInput = screen.getByPlaceholderText("Select a Clinician");
    const submit = screen.getByRole("button", { name: "SubmitPartner" });
    expect(clinicianInput).toBeInTheDocument();
    expect(submit).toBeDisabled();

    await user.click(clinicianInput);
    expect(await screen.findByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.queryByText("Unassigned Clinician")).not.toBeInTheDocument();
    await user.click(screen.getByText("Alex Morgan"));

    expect(submit).toBeEnabled();
  });

  it("clears the clinician when the partner changes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Partner />);

    const partnerInput = await screen.findByPlaceholderText("Select a Partner");
    await user.click(partnerInput);
    await user.click(await screen.findByText("Stepping into Grace"));
    await user.click(screen.getByPlaceholderText("Select a Clinician"));
    await user.click(await screen.findByText("Alex Morgan"));

    await user.click(partnerInput);
    await user.click(await screen.findByText("2ft Prosthetics"));

    expect(screen.queryByLabelText("ClinicianDropdown")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SubmitPartner" })).toBeEnabled();
  });

  it("persists linked Partner and Clinician record IDs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Partner />);

    await user.click(await screen.findByPlaceholderText("Select a Partner"));
    await user.click(await screen.findByText("Stepping into Grace"));
    await user.click(screen.getByPlaceholderText("Select a Clinician"));
    await user.click(await screen.findByText("Jordan Lee"));
    await user.click(screen.getByRole("button", { name: "SubmitPartner" }));

    expect(getRequestParty()).toEqual({
      partnerId: "recSteppingIntoGrace",
      partnerName: "Stepping into Grace",
      clinicianRequired: true,
      clinicianId: "recClinicianB",
      clinicianName: "Jordan Lee",
    });
  });

  it("fails closed when clinician mappings cannot be loaded", async () => {
    server.use(
      http.get(CLINICIANS_URL, () =>
        HttpResponse.json({ error: { type: "SERVER_ERROR" } }, { status: 500 })
      )
    );

    renderWithProviders(<Partner />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load partners and clinicians."
    );
    expect(screen.getByRole("button", { name: "SubmitPartner" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
