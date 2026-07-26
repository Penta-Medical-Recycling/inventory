// urlCreator (in PentaProvider) builds the Airtable filterByFormula server-side.
// These tests verify the "Limb Guide" part filter is added and mapped correctly.
// A probe reads urlCreator from context, sets a part, and renders the decoded URL.
import { describe, it, expect } from "vitest";
import { useContext, useEffect } from "react";
import { renderWithProviders, screen, waitFor } from "../test/utils";
import PentaContext from "./PentaContext";

function UrlProbe({ part }) {
  const { urlCreator, setSelectedPart } = useContext(PentaContext);
  useEffect(() => {
    setSelectedPart(part);
  }, [part, setSelectedPart]);
  return <div data-testid="url">{decodeURIComponent(urlCreator())}</div>;
}

function GroupUrlProbe() {
  const { urlCreator } = useContext(PentaContext);
  return (
    <div data-testid="group-url">
      {decodeURIComponent(
        urlCreator({
          pageSize: 12,
          includeSkuCodes: ["AAFO", "ABL"],
          excludeSkuCodes: ["ADB-M"],
          maxRecords: 1,
          fields: ["SKU Item Code"],
        })
      )}
    </div>
  );
}

const url = () => screen.getByTestId("url").textContent;

describe("urlCreator Limb Guide part filter", () => {
  it.each([
    ["Feet", 'FIND("Feet", ARRAYJOIN({Limb Guide}))'],
    ["Knees/Hips", 'FIND("Knees/ Hips", ARRAYJOIN({Limb Guide}))'],
    ["Accessories", 'FIND("Accessory/ Misc.", ARRAYJOIN({Limb Guide}))'],
  ])("maps the %s part to its Limb Guide condition", async (part, expected) => {
    renderWithProviders(<UrlProbe part={part} />);
    await waitFor(() => expect(url()).toContain(expected));
  });

  it("applies no Limb Guide filter for 'All' or no selection", async () => {
    renderWithProviders(<UrlProbe part="All" />);
    // Give the effect a tick, then confirm the condition is absent.
    await waitFor(() => expect(url()).toContain("filterByFormula"));
    expect(url()).not.toContain("Limb Guide");
  });
});

describe("urlCreator grouped inventory options", () => {
  it("adds SKU constraints and request sizing", () => {
    renderWithProviders(<GroupUrlProbe />);
    const groupUrl = screen.getByTestId("group-url").textContent;

    expect(groupUrl).toContain("pageSize=12");
    expect(groupUrl).toContain("maxRecords=1");
    expect(groupUrl).toContain("fields[]=SKU Item Code");
    expect(groupUrl).toContain(
      'OR({SKU Item Code}="AAFO",{SKU Item Code}="ABL")'
    );
    expect(groupUrl).toContain('NOT(OR({SKU Item Code}="ADB-M"))');
  });
});
