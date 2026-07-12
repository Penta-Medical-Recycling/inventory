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
