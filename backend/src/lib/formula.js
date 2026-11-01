// Escapes a value so it can sit inside a double-quoted Airtable formula string.
// Without this, a quote typed by a user could change the logic of the formula.
export function escapeFormulaString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const quoted = (value) => `"${escapeFormulaString(value)}"`;

// The Parts filter options do not match the Airtable "Limb Guide" values 1:1,
// so they are translated here. "All" (or empty) means no filter.
export const LIMB_GUIDE_BY_PART = {
  Liners: "Liners",
  Adapters: "Adapters",
  "Knees/Hips": "Knees/ Hips",
  Pylons: "Pylons",
  Feet: "Feet",
  Accessories: "Accessory/ Misc.",
};

// Builds the filterByFormula for GET /api/inventory from ALREADY VALIDATED
// filters (see parseInventoryParams). Never call it with raw user input.
export function buildInventoryFormula(filters) {
  // Base filters: only items that are available (not in a request, not shipped)
  // and that have a SKU. The browser cannot remove these.
  const conditions = [
    "{Requests}=BLANK()",
    "{Shipment Status}=BLANK()",
    'NOT({SKU}="")',
  ];

  const codeCondition = (code) => `{SKU Item Code}=${quoted(code)}`;
  if (filters.includeSku.length > 0) {
    conditions.push(`OR(${filters.includeSku.map(codeCondition).join(",")})`);
  }
  if (filters.excludeSku.length > 0) {
    conditions.push(`NOT(OR(${filters.excludeSku.map(codeCondition).join(",")}))`);
  }

  // Any of the selected descriptions.
  if (filters.descriptions.length > 0) {
    const matches = filters.descriptions.map((term) => `SEARCH(${quoted(term)},{StringSearch})`);
    conditions.push(`OR(${matches.join(",")})`);
  }

  // Any of the selected manufacturers.
  if (filters.manufacturers.length > 0) {
    const matches = filters.manufacturers.map((name) => `{Manufacturer}=${quoted(name)}`);
    conditions.push(`OR(${matches.join(",")})`);
  }

  // Tag is a multi-value field: every selected tag must be present.
  for (const tag of filters.tags) {
    conditions.push(`FIND(${quoted(tag)},ARRAYJOIN({Tag}))`);
  }

  // minSize and maxSize were validated as numbers, so they are safe to insert.
  if (filters.minSize !== null) {
    conditions.push(`AND({Size}>=${filters.minSize},{Size}<=${filters.maxSize})`);
  }

  // Every word of the search text must appear.
  if (filters.searchTerms.length > 0) {
    const matches = filters.searchTerms.map((term) => `SEARCH(${quoted(term)},{StringSearch})`);
    conditions.push(`AND(${matches.join(",")})`);
  }

  if (filters.part !== null) {
    conditions.push(`FIND(${quoted(LIMB_GUIDE_BY_PART[filters.part])},ARRAYJOIN({Limb Guide}))`);
  }

  // Upper keeps only "Arms/ Hands" items; Lower excludes them.
  if (filters.extremity === "Upper") {
    conditions.push('FIND("Arms/ Hands",ARRAYJOIN({Limb Guide}))');
  } else if (filters.extremity === "Lower") {
    conditions.push('NOT(FIND("Arms/ Hands",ARRAYJOIN({Limb Guide})))');
  }

  return `AND(${conditions.join(",")})`;
}