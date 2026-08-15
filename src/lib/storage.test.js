import { describe, expect, it } from "vitest";
import {
  ANNOUNCEMENT_DISMISSAL_KEY,
  REQUEST_PARTY_KEY,
  clearCartItems,
  clearRequestParty,
  getCartItemKeys,
  getRequestParty,
  setRequestParty,
} from "./storage";

describe("local storage metadata", () => {
  it("excludes app metadata from cart item keys", () => {
    localStorage.setItem("partner", "Demo Clinic");
    localStorage.setItem("notes", "Urgent");
    localStorage.setItem(
      ANNOUNCEMENT_DISMISSAL_KEY,
      "bulk-order-workflow-v2"
    );
    localStorage.setItem("22-1287", "{}");

    expect(getCartItemKeys()).toEqual(["22-1287"]);
  });

  it("clears cart data while preserving preferences and partner selection", () => {
    localStorage.setItem("partner", "Demo Clinic");
    localStorage.setItem("notes", "Urgent");
    localStorage.setItem(
      ANNOUNCEMENT_DISMISSAL_KEY,
      "bulk-order-workflow-v2"
    );
    localStorage.setItem("22-1287", "{}");

    clearCartItems();

    expect(localStorage.getItem("22-1287")).toBeNull();
    expect(localStorage.getItem("notes")).toBeNull();
    expect(localStorage.getItem("partner")).toBe("Demo Clinic");
    expect(localStorage.getItem(ANNOUNCEMENT_DISMISSAL_KEY)).toBe(
      "bulk-order-workflow-v2"
    );
  });
});

describe("request party storage", () => {
  it("round-trips a partner and required clinician selection", () => {
    const party = {
      partnerId: "recPartner",
      partnerName: "Stepping into Grace",
      clinicianRequired: true,
      clinicianId: "recClinician",
      clinicianName: "Demo Clinician",
    };

    setRequestParty(party);

    expect(getRequestParty()).toEqual(party);
    expect(getCartItemKeys()).toEqual([]);
  });

  it("rejects malformed or incomplete stored selections", () => {
    localStorage.setItem(REQUEST_PARTY_KEY, "not-json");
    expect(getRequestParty()).toBeNull();

    localStorage.setItem(
      REQUEST_PARTY_KEY,
      JSON.stringify({
        partnerId: "recPartner",
        partnerName: "Stepping into Grace",
        clinicianRequired: true,
      })
    );
    expect(getRequestParty()).toBeNull();
  });

  it("clears request-party metadata and its legacy partner label", () => {
    localStorage.setItem("partner", "Demo Clinic");
    setRequestParty({
      partnerId: "recPartner",
      partnerName: "Demo Clinic",
      clinicianRequired: false,
      clinicianId: null,
      clinicianName: null,
    });

    clearRequestParty();

    expect(localStorage.getItem("partner")).toBeNull();
    expect(getRequestParty()).toBeNull();
  });
});