// End-to-end request-flow integration coverage. These tests use the real App,
// HashRouter, PentaProvider, Partner, and Cart components while MSW stands in
// for Airtable. Each scenario starts with one physical inventory item in the
// cart and asserts the final Requests POST body.
import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, userEvent, waitFor } from "./test/utils";
import App from "./App";
import { AIRTABLE_API_URL, AIRTABLE_BASE_ID } from "./config/airtable";
import { ANNOUNCEMENT_DISMISSAL_KEY, getRequestParty } from "./lib/storage";
import { inventoryRecords } from "./test/mocks/fixtures";
import { server } from "./test/mocks/server";

const REQUESTS_URL = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Requests`;
const cartItem = inventoryRecords[0].fields;

const startRequestFlow = () => {
  localStorage.setItem(ANNOUNCEMENT_DISMISSAL_KEY, "bulk-order-workflow-v2");
  localStorage.setItem(cartItem["Item ID"], JSON.stringify(cartItem));
  sessionStorage.setItem(
    "allInventoryItems",
    JSON.stringify(inventoryRecords.map((record) => record.fields))
  );
  window.location.hash = "#/partner";

  const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
  const user = userEvent.setup();
  renderWithProviders(<App />);
  return { confirmSpy, user };
};

const captureRequestWrite = () => {
  let requestBody;
  server.use(
    http.post(REQUESTS_URL, async ({ request }) => {
      requestBody = await request.json();
      return HttpResponse.json({ records: [{ id: "recCreatedRequest" }] });
    })
  );
  return () => requestBody;
};

const choosePartner = async (user, partnerName) => {
  const partnerInput = await screen.findByLabelText("PartnerDropdown");
  await waitFor(() => expect(partnerInput).toBeEnabled());
  await user.click(partnerInput);
  await user.click(await screen.findByText(partnerName));
};

const submitCartRequest = async (user) => {
  const numberInputs = screen.getAllByPlaceholderText("Please input a number");
  await user.type(numberInputs[0], "3");
  await user.type(numberInputs[1], "1");
  await user.type(screen.getByPlaceholderText("Additional Notes"), "Integration request");
  await user.click(screen.getByRole("button", { name: "Confirm" }));
};

afterEach(() => {
  window.location.hash = "#/";
  vi.restoreAllMocks();
});

describe("request flow integration", () => {
  it("submits the original Partner-only request flow", async () => {
    const getRequestBody = captureRequestWrite();
    const { confirmSpy, user } = startRequestFlow();

    await choosePartner(user, "2ft Prosthetics");
    expect(screen.queryByLabelText("ClinicianDropdown")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "SubmitPartner" }));

    expect(
      await screen.findByRole("heading", { name: "Request details" })
    ).toBeInTheDocument();
    expect(screen.getByText("2ft Prosthetics")).toBeInTheDocument();
    await submitCartRequest(user);

    await waitFor(() => expect(getRequestBody()).toBeDefined());
    const fields = getRequestBody().records[0].fields;
    expect(fields.Partner).toEqual(["recF5bBGGYd4Oezt4"]);
    expect(fields).not.toHaveProperty("Clinicians");
    expect(fields["Items You Would Like"]).toEqual(["22-1287"]);
    expect(fields["Number of patients helped"]).toBe(3);
    expect(fields["Number of children helped"]).toBe(1);
    expect(fields["Additional Notes"]).toBe("Integration request");
    expect(confirmSpy).toHaveBeenCalledOnce();
    await waitFor(() => expect(getRequestParty()).toBeNull());
    expect(localStorage.getItem(cartItem["Item ID"])).toBeNull();
  });

  it("requires and submits a mapped Clinician request flow", async () => {
    const getRequestBody = captureRequestWrite();
    const { confirmSpy, user } = startRequestFlow();

    await choosePartner(user, "Stepping into Grace");
    const submitPartner = screen.getByRole("button", { name: "SubmitPartner" });
    expect(submitPartner).toBeDisabled();

    const clinicianInput = screen.getByLabelText("ClinicianDropdown");
    await user.click(clinicianInput);
    await user.click(await screen.findByText("Alex Morgan"));
    expect(submitPartner).toBeEnabled();
    await user.click(submitPartner);

    expect(
      await screen.findByRole("heading", { name: "Request details" })
    ).toBeInTheDocument();
    expect(screen.getByText("Stepping into Grace")).toBeInTheDocument();
    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    await submitCartRequest(user);

    await waitFor(() => expect(getRequestBody()).toBeDefined());
    const fields = getRequestBody().records[0].fields;
    expect(fields.Partner).toEqual(["recSteppingIntoGrace"]);
    expect(fields.Clinicians).toEqual(["recClinicianA"]);
    expect(fields["Items You Would Like"]).toEqual(["22-1287"]);
    expect(fields["Additional Notes"]).toBe("Integration request");
    expect(confirmSpy).toHaveBeenCalledOnce();
    await waitFor(() => expect(getRequestParty()).toBeNull());
    expect(localStorage.getItem(cartItem["Item ID"])).toBeNull();
  });
});
