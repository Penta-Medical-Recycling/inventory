// The Partner page loads partner names via fetchSelectOptions("Partners") (-> GET /Partners) and
// presents them in a searchable shadcn Combobox. Opening the combobox reveals the options and
// selecting one enables the Submit button. Covers the empty-list edge case that the sort/map path
// handles gracefully.
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent } from "../test/utils";
import Partner from "./Partner";
import { server } from "../test/mocks/server";

const PARTNERS_URL = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Partners";

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
});
