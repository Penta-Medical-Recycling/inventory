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

function MasterUrlProbe() {
  const { urlCreator, setSelectedManufacturer, setSearchInput } =
    useContext(PentaContext);
  useEffect(() => {
    setSelectedManufacturer([
      { label: "Freedom Innovation", value: encodeURIComponent("Freedom Innovation") },
    ]);
    setSearchInput("pylon");
  }, [setSelectedManufacturer, setSearchInput]);
  return (
    <>
      <div data-testid="filtered">{decodeURIComponent(urlCreator())}</div>
      <div data-testid="master">
        {decodeURIComponent(urlCreator({ includeUserFilters: false }))}
      </div>
    </>
  );
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

describe("urlCreator master list (includeUserFilters=false)", () => {
  it("keeps base availability filters but drops user filters/search", async () => {
    renderWithProviders(<MasterUrlProbe />);

    // Wait until the user filters are reflected in the default URL.
    await waitFor(() =>
      expect(screen.getByTestId("filtered").textContent).toContain(
        "{Manufacturer}='Freedom Innovation'"
      )
    );

    const filtered = screen.getByTestId("filtered").textContent;
    const master = screen.getByTestId("master").textContent;

    // The normal URL applies the selected manufacturer and search.
    expect(filtered).toContain("{Manufacturer}='Freedom Innovation'");
    expect(filtered).toContain('SEARCH("pylon"');

    // The master-list URL keeps the base availability filters...
    expect(master).toContain("{Requests}=BLANK()");
    expect(master).toContain("{Shipment Status}=BLANK()");
    // ...but omits the user-selected filters and search.
    expect(master).not.toContain("{Manufacturer}=");
    expect(master).not.toContain('SEARCH("pylon"');
  });
});
