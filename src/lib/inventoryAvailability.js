const normalizedText = (value) => String(value || "").toLowerCase();
const firstArrayValue = (value) => (Array.isArray(value) ? value[0] : value);

export function getAvailableSkuCodes(items, filters) {
  const descriptionTerms = filters.selectedDescriptions
    .map((option) => option.label.toLowerCase().replace(/[^a-z0-9\s]/gi, ""))
    .filter(Boolean);
  const skuLabels = filters.selectedSKU
    .map((option) => option.label.toLowerCase().replace(/[^a-z0-9\s]/gi, ""))
    .filter(Boolean);
  const skuValues = filters.selectedSKU.map((option) => decodeURIComponent(option.value));
  const manufacturerValues = filters.selectedManufacturer.map((option) =>
    decodeURIComponent(option.value)
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

  const matchingCodes = new Set();

  for (const item of items) {
    const stringSearch = normalizedText(item.StringSearch);
    const itemSkus = Array.isArray(item.SKU) ? item.SKU : [];
    const manufacturers = Array.isArray(item.Manufacturer) ? item.Manufacturer : [];
    const tags = Array.isArray(item.Tag) ? item.Tag : [];
    const limbGuides = Array.isArray(item["Limb Guide"]) ? item["Limb Guide"] : [];
    const size = Number(item.Size);

    if (
      skuValues.length &&
      (!skuValues.some((value) => itemSkus.includes(value)) ||
        !skuLabels.some((term) => stringSearch.includes(term)))
    ) {
      continue;
    }
    if (descriptionTerms.length && !descriptionTerms.some((term) => stringSearch.includes(term))) {
      continue;
    }
    if (
      manufacturerValues.length &&
      !manufacturerValues.some((value) => manufacturers.includes(value))
    ) {
      continue;
    }
    if (selectedTags.some((tag) => !tags.includes(tag))) continue;
    if (filters.isRangeOn && (size < filters.minValue || size > filters.maxValue)) continue;
    if (searchTerms.some((term) => !stringSearch.includes(term))) continue;
    if (limbGuide && !limbGuides.includes(limbGuide)) continue;
    if (filters.extremity === "Upper" && !limbGuides.includes("Arms/ Hands")) continue;
    if (filters.extremity === "Lower" && limbGuides.includes("Arms/ Hands")) continue;

    const code = firstArrayValue(item["SKU Item Code"]);
    if (code) matchingCodes.add(code);
  }

  return matchingCodes;
}
