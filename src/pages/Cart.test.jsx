import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, userEvent, waitFor } from "../test/utils";
import PentaContext from "../context/PentaContext";
import Cart, {
  checkCartItemAvailability,
  createRequestFields,
  getCartItemKeys,
} from "./Cart";
import {
  ANNOUNCEMENT_DISMISSAL_KEY,
  getRequestParty,
  setRequestParty,
} from "../lib/storage";
import { clinicianRecords, partnerRecords } from "../test/mocks/fixtures";

describe("Cart item detection", () => {
  it("treats application metadata as an empty cart", () => {
    expect(
      getCartItemKeys({
        partner: "Demo Clinic",
        notes: "Urgent",
        [ANNOUNCEMENT_DISMISSAL_KEY]: "bulk-order-workflow-v2",
      })
    ).toEqual([]);
  });

  it("returns persisted inventory item keys", () => {
    expect(
      getCartItemKeys({ partner: "Demo Clinic", notes: "", "22-1287": "{}" })
    ).toEqual(["22-1287"]);
  });
});

describe("Cart availability checks", () => {
  it("defers the availability request until the user submits the cart", async () => {
    const user = userEvent.setup();
    localStorage.setItem("partner", "Demo Clinic");
    setRequestParty({
      partnerId: "recDemoClinic",
      partnerName: "Demo Clinic",
      clinicianRequired: false,
      clinicianId: null,
      clinicianName: null,
    });
    localStorage.setItem(
      "22-1287",
      JSON.stringify({
        "Item ID": "22-1287",
        "Description (from SKU)": ["Demo Item"],
      })
    );
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] }),
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner: "Demo Clinic",
            setSelectedPartner: vi.fn(),
            setCartCount: vi.fn(),
          }}
        >
          <Cart />
        </PentaContext.Provider>
      </MemoryRouter>,
      { withProviders: false }
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    await user.type(
      screen.getByLabelText(/How many patients do you plan to help/i),
      "1"
    );
    await user.type(
      screen.getByLabelText(/How many of the patients are children/i),
      "0"
    );
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    fetchSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("checks multiple items in one request and reports missing items as unavailable", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        records: [{ fields: { "Item ID": "22-1287" } }],
      }),
    });

    const result = await checkCartItemAvailability(
      ["22-1287", "23-1689"],
      fetchImpl
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const requestUrl = new URL(fetchImpl.mock.calls[0][0]);
    expect(requestUrl.searchParams.get("filterByFormula")).toContain(
      "OR({Item ID}='22-1287',{Item ID}='23-1689')"
    );
    expect(requestUrl.searchParams.getAll("fields[]")).toEqual(["Item ID"]);
    expect(result.unavailableIds).toEqual(["23-1689"]);
    expect(result.failedIds).toEqual([]);
  });

  it("checks carts over 100 items in sequential batches", async () => {
    const itemIds = Array.from({ length: 101 }, (_, index) => `ITEM-${index + 1}`);
    const fetchImpl = vi.fn(async (url) => {
      const formula = new URL(url).searchParams.get("filterByFormula");
      const records = itemIds
        .filter((id) => formula.includes(`{Item ID}='${id}'`))
        .map((id) => ({ fields: { "Item ID": id } }));
      return { ok: true, json: async () => ({ records }) };
    });

    const result = await checkCartItemAvailability(itemIds, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.unavailableIds).toEqual([]);
    expect(result.failedIds).toEqual([]);
  });

  it("fails closed when availability cannot be verified", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    const result = await checkCartItemAvailability(["22-1287"], fetchImpl);

    expect(result.unavailableIds).toEqual([]);
    expect(result.failedIds).toEqual(["22-1287"]);
    expect(result.statuses["22-1287"]).toBe("error");
  });
});

describe("Requests payload", () => {
  const baseInput = {
    requestName: "#ABC123",
    itemIds: ["22-1287"],
    notes: "Urgent",
    numOfPatients: "2",
    numOfChildren: "1",
  };

  it("writes linked Partner and Clinician record IDs", () => {
    const fields = createRequestFields({
      ...baseInput,
      requestParty: {
        partnerId: "recPartner",
        partnerName: "Stepping into Grace",
        clinicianRequired: true,
        clinicianId: "recClinician",
        clinicianName: "Alex Morgan",
      },
    });

    expect(fields.Partner).toEqual(["recPartner"]);
    expect(fields.Clinicians).toEqual(["recClinician"]);
  });

  it("omits Clinicians for a partner without mappings", () => {
    const fields = createRequestFields({
      ...baseInput,
      requestParty: {
        partnerId: "recPartner",
        partnerName: "Demo Clinic",
        clinicianRequired: false,
        clinicianId: null,
        clinicianName: null,
      },
    });

    expect(fields.Partner).toEqual(["recPartner"]);
    expect(fields).not.toHaveProperty("Clinicians");
  });

  it("sends the selected clinician in the Requests POST", async () => {
    const user = userEvent.setup();
    const setSelectedPartner = vi.fn();
    localStorage.setItem("partner", "Stepping into Grace");
    setRequestParty({
      partnerId: "recPartner",
      partnerName: "Stepping into Grace",
      clinicianRequired: true,
      clinicianId: "recClinician",
      clinicianName: "Alex Morgan",
    });
    localStorage.setItem(
      "22-1287",
      JSON.stringify({
        "Item ID": "22-1287",
        "Description (from SKU)": ["Demo Item"],
      })
    );

    let requestBody;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url, options = {}) => {
      if (String(url).includes("/Inventory?")) {
        return {
          ok: true,
          json: async () => ({ records: [{ fields: { "Item ID": "22-1287" } }] }),
        };
      }
      if (String(url).endsWith("/Requests") && options.method === "POST") {
        requestBody = JSON.parse(options.body);
        return { ok: true, json: async () => ({ records: [{ id: "recRequest" }] }) };
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner: "Stepping into Grace",
            setSelectedPartner,
            setCartCount: vi.fn(),
          }}
        >
          <Cart />
        </PentaContext.Provider>
      </MemoryRouter>,
      { withProviders: false }
    );

    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ResetCart" })).toHaveTextContent(
      "Clear"
    );
    await user.click(screen.getByRole("button", { name: "ResetCart" }));
    expect(
      screen.getByText("Are you sure you want to clear your cart?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.type(
      screen.getByLabelText(/How many patients do you plan to help/i),
      "2"
    );
    await user.type(
      screen.getByLabelText(/How many of the patients are children/i),
      "1"
    );
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(requestBody).toBeDefined());
    expect(requestBody.records[0].fields.Partner).toEqual(["recPartner"]);
    expect(requestBody.records[0].fields.Clinicians).toEqual(["recClinician"]);
    await waitFor(() => expect(localStorage.getItem("22-1287")).toBeNull());
    expect(getRequestParty()).toEqual({
      partnerId: "recPartner",
      partnerName: "Stepping into Grace",
      clinicianRequired: true,
      clinicianId: "recClinician",
      clinicianName: "Alex Morgan",
    });
    expect(localStorage.getItem("partner")).toBe("Stepping into Grace");
    expect(setSelectedPartner).not.toHaveBeenCalledWith("");

    fetchSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("preserves checkout state when the Requests write fails", async () => {
    const user = userEvent.setup();
    localStorage.setItem("partner", "Demo Clinic");
    setRequestParty({
      partnerId: "recDemoClinic",
      partnerName: "Demo Clinic",
      clinicianRequired: false,
      clinicianId: null,
      clinicianName: null,
    });
    localStorage.setItem(
      "22-1287",
      JSON.stringify({
        "Item ID": "22-1287",
        "Description (from SKU)": ["Demo Item"],
      })
    );
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("/Inventory?")) {
        return {
          ok: true,
          json: async () => ({ records: [{ fields: { "Item ID": "22-1287" } }] }),
        };
      }
      return {
        ok: false,
        status: 500,
        json: async () => ({ error: { type: "SERVER_ERROR" } }),
      };
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner: "Demo Clinic",
            setSelectedPartner: vi.fn(),
            setCartCount: vi.fn(),
          }}
        >
          <Cart />
        </PentaContext.Provider>
      </MemoryRouter>,
      { withProviders: false }
    );

    await user.type(
      screen.getByLabelText(/How many patients do you plan to help/i),
      "4"
    );
    await user.type(
      screen.getByLabelText(/How many of the patients are children/i),
      "0"
    );
    await user.type(screen.getByLabelText(/Additional notes/i), "Keep this work");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      await screen.findByLabelText(/How many patients do you plan to help/i)
    ).toHaveValue(4);
    expect(screen.getByRole("heading", { name: "Cart" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Additional notes/i)).toHaveValue("Keep this work");
    expect(localStorage.getItem("22-1287")).not.toBeNull();
    expect(getRequestParty()).not.toBeNull();

    fetchSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("redirects a legacy partner-only session to Partner selection", async () => {
    localStorage.setItem("partner", "Stepping into Grace");

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner: "Stepping into Grace",
            setSelectedPartner: vi.fn(),
            setCartCount: vi.fn(),
          }}
        >
          <Routes>
            <Route path="/cart" element={<Cart />} />
            <Route path="/partner" element={<p>Choose request partner</p>} />
          </Routes>
        </PentaContext.Provider>
      </MemoryRouter>,
      { withProviders: false }
    );

    expect(await screen.findByText("Choose request partner")).toBeInTheDocument();
  });
});

describe("Cart request context", () => {
  it("requires both patient counts before enabling the request", async () => {
    const user = userEvent.setup();
    localStorage.setItem("partner", "Demo Clinic");
    setRequestParty({
      partnerId: "recDemoClinic",
      partnerName: "Demo Clinic",
      clinicianRequired: false,
      clinicianId: null,
      clinicianName: null,
    });
    localStorage.setItem(
      "22-1287",
      JSON.stringify({
        "Item ID": "22-1287",
        "Description (from SKU)": ["Demo Item"],
      })
    );

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner: "Demo Clinic",
            setSelectedPartner: vi.fn(),
            setCartCount: vi.fn(),
          }}
        >
          <Cart />
        </PentaContext.Provider>
      </MemoryRouter>,
      { withProviders: false }
    );

    const patientsInput = screen.getByLabelText(
      /How many patients do you plan to help/i
    );
    const childrenInput = screen.getByLabelText(
      /How many of the patients are children/i
    );
    const submitButton = screen.getByRole("button", { name: "Confirm" });

    expect(patientsInput).toBeRequired();
    expect(childrenInput).toBeRequired();
    expect(submitButton).toBeDisabled();

    await user.type(patientsInput, "3");
    expect(submitButton).toBeDisabled();

    await user.type(childrenInput, "0");
    expect(submitButton).toBeEnabled();
  });

  it("preserves Partner and Clinician when the cart is cleared", async () => {
    const user = userEvent.setup();
    const requestParty = {
      partnerId: "recSteppingIntoGrace",
      partnerName: "Stepping into Grace",
      clinicianRequired: true,
      clinicianId: "recClinicianA",
      clinicianName: "Alex Morgan",
    };
    localStorage.setItem("partner", requestParty.partnerName);
    setRequestParty(requestParty);
    localStorage.setItem(
      "22-1287",
      JSON.stringify({
        "Item ID": "22-1287",
        "Description (from SKU)": ["Demo Item"],
      })
    );

    const Harness = () => {
      const [selectedPartner, setSelectedPartner] = useState(
        requestParty.partnerName
      );
      return (
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner,
            setSelectedPartner,
            setCartCount: vi.fn(),
          }}
        >
          <Routes>
            <Route path="/cart" element={<Cart />} />
            <Route path="/" element={<Link to="/cart">Open cart</Link>} />
          </Routes>
        </PentaContext.Provider>
      );
    };

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Harness />
      </MemoryRouter>,
      { withProviders: false }
    );

    await user.click(screen.getByRole("button", { name: "ResetCart" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(getCartItemKeys()).toEqual([]);
    expect(getRequestParty()).toEqual(requestParty);
    expect(localStorage.getItem("partner")).toBe(requestParty.partnerName);

    await user.click(screen.getByRole("link", { name: "Open cart" }));
    expect(
      screen.getByRole("heading", { name: "Your cart is empty" })
    ).toBeInTheDocument();
  });

  it("edits Partner and Clinician in place without losing cart items", async () => {
    const user = userEvent.setup();
    const item = {
      "Item ID": "22-1287",
      "Description (from SKU)": ["Demo Item"],
    };
    localStorage.setItem("partner", "Stepping into Grace");
    localStorage.setItem(item["Item ID"], JSON.stringify(item));
    setRequestParty({
      partnerId: "recSteppingIntoGrace",
      partnerName: "Stepping into Grace",
      clinicianRequired: true,
      clinicianId: "recClinicianA",
      clinicianName: "Alex Morgan",
    });

    const Harness = () => {
      const [selectedPartner, setSelectedPartner] = useState(
        "Stepping into Grace"
      );
      return (
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner,
            setSelectedPartner,
            setCartCount: vi.fn(),
            fetchTableRecordsWithOffset: vi.fn(async (table) =>
              table === "Partners" ? partnerRecords : clinicianRecords
            ),
          }}
        >
          <Cart />
        </PentaContext.Provider>
      );
    };

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Harness />
      </MemoryRouter>,
      { withProviders: false }
    );

    await user.click(
      screen.getByRole("button", { name: "Change partner clinic" })
    );
    expect(
      await screen.findByRole("heading", { name: "Select partner clinic" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("PartnerDropdown")).toHaveValue(
      "Stepping into Grace"
    );
    expect(screen.getByLabelText("ClinicianDropdown")).toHaveValue(
      "Alex Morgan"
    );

    await user.click(screen.getByLabelText("PartnerDropdown"));
    await user.click(await screen.findByText("2ft Prosthetics"));
    expect(screen.queryByLabelText("ClinicianDropdown")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Save partner clinic" })
    );

    expect(
      screen.queryByRole("heading", { name: "Select partner clinic" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cart" })).toBeInTheDocument();
    expect(screen.getByText("2ft Prosthetics")).toBeInTheDocument();
    expect(screen.queryByText("Alex Morgan")).not.toBeInTheDocument();
    expect(localStorage.getItem(item["Item ID"])).not.toBeNull();
    expect(getRequestParty()).toEqual({
      partnerId: "recF5bBGGYd4Oezt4",
      partnerName: "2ft Prosthetics",
      clinicianRequired: false,
      clinicianId: null,
      clinicianName: null,
    });
  });

  it("shows a focused empty state instead of request controls", () => {
    localStorage.setItem("partner", "Demo Clinic");
    setRequestParty({
      partnerId: "recDemoClinic",
      partnerName: "Demo Clinic",
      clinicianRequired: false,
      clinicianId: null,
      clinicianName: null,
    });

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <PentaContext.Provider
          value={{
            inventoryGroups: [],
            selectedPartner: "Demo Clinic",
            setSelectedPartner: vi.fn(),
            setCartCount: vi.fn(),
          }}
        >
          <Cart />
        </PentaContext.Provider>
      </MemoryRouter>,
      { withProviders: false }
    );

    expect(
      screen.getByRole("heading", { name: "Your cart is empty" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Browse inventory" })
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/How many patients do you plan to help/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ResetCart" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
  });
});