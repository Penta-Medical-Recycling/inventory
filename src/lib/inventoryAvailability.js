const normalizedText = (value) => String(value || "").toLowerCase();
const firstArrayValue = (value) => (Array.isArray(value) ? value[0] : value);

// Builds a predicate that reports whether a single inventory item passes the
// currently active user filters. Shared by getAvailableSkuCodes (group
// availability) and the group-level bulk add flow, so bulk selection is scoped
// to the same visible stock the shopper sees rather than the whole master list.
export function createInventoryFilterPredicate(filters) {
  const descriptionTerms = filters.selectedDescriptions
    .map((option) => option.label.toLowerCase().replace(/[^a-z0-9\s]/gi, ""))
    .filter(Boolean);
  const skuLabels = filters.selectedSKU
    .map((option) => option.label.toLowerCase().replace(/[^a-z0-9\s]/gi, ""))
    .filter(Boolean);
  const skuValues = filters.selectedSKU.map((option) => decodeURIComponent(option.value));
  // Manufacturer options carry the (URL-encoded) manufacturer NAME as their value,
  // which is what the Airtable query matches against {Manufacturer}. Locally we must
  // therefore compare against the item's "Name (from Manufacturer)" lookup - NOT the
  // "Manufacturer" field, which holds opaque Airtable record IDs.
  const manufacturerValues = filters.selectedManufacturer.map((option) =>
    decodeURIComponent(option.value).trim().toLowerCase()
  );
  const selectedTags = Object.keys(filters.selectedFilter).filter(
    (key) => filters.selectedFilter[key]
  );
  const searchTerms = normalizedText(filters.searchInput)
    .split(" ")
    .filter((term) => term && term !== "size");
  const limbGuide = {
    Liners: "Liners",
    Adapters: "Adapters",
    "Knees/Hips": "Knees/ Hips",
    Pylons: "Pylons",
    Feet: "Feet",
    Accessories: "Accessory/ Misc.",
  }[filters.selectedPart];

  return (item) => {
    const stringSearch = normalizedText(item.StringSearch);
    const itemSkus = Array.isArray(item.SKU) ? item.SKU : [];
    const manufacturerField = item["Name (from Manufacturer)"];
    const manufacturerNames = (
      Array.isArray(manufacturerField)
        ? manufacturerField
        : manufacturerField
        ? [manufacturerField]
        : []
    ).map((name) => String(name).trim().toLowerCase());
    const tags = Array.isArray(item.Tag) ? item.Tag : [];
    const limbGuides = Array.isArray(item["Limb Guide"]) ? item["Limb Guide"] : [];
    const size = Number(item.Size);

    if (
      skuValues.length &&
      (!skuValues.some((value) => itemSkus.includes(value)) ||
        !skuLabels.some((term) => stringSearch.includes(term)))
    ) {
      return false;
    }
    if (descriptionTerms.length && !descriptionTerms.some((term) => stringSearch.includes(term))) {
      return false;
    }
    if (
      manufacturerValues.length &&
      !manufacturerValues.some((value) => manufacturerNames.includes(value))
    ) {
      return false;
    }
    if (selectedTags.some((tag) => !tags.includes(tag))) return false;
    // A blank size becomes NaN. The Airtable range query excludes blank sizes, so
    // exclude them locally too - otherwise the group shows but opens to no results.
    if (
      filters.isRangeOn &&
      (Number.isNaN(size) || size < filters.minValue || size > filters.maxValue)
    ) {
      return false;
    }
    if (searchTerms.some((term) => !stringSearch.includes(term))) return false;
    if (limbGuide && !limbGuides.includes(limbGuide)) return false;
    if (filters.extremity === "Upper" && !limbGuides.includes("Arms/ Hands")) return false;
    if (filters.extremity === "Lower" && limbGuides.includes("Arms/ Hands")) return false;

    return true;
  };
}

export function getAvailableSkuCodes(items, filters) {
  const matchesFilters = createInventoryFilterPredicate(filters);
  const matchingCodes = new Set();

  for (const item of items) {
    if (!matchesFilters(item)) continue;
    const code = firstArrayValue(item["SKU Item Code"]);
    if (code) matchingCodes.add(code);
  }

  return matchingCodes;
}
