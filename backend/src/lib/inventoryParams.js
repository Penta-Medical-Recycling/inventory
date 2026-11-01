import { LIMB_GUIDE_BY_PART } from "./formula.js";

// The ONLY parameters GET /api/inventory accepts. Anything else is rejected.
const ALLOWED_PARAMS = new Set([
  "pageSize",
  "offset",
  "includeSku",
  "excludeSku",
  "manufacturers",
  "descriptions",
  "tags",
  "minSize",
  "maxSize",
  "search",
  "part",
  "extremity",
]);

const ALLOWED_TAGS = ["Prosthesis", "Orthosis", "Pediatric"];
const ALLOWED_EXTREMITIES = ["Upper", "Lower"]; // "All" or empty means no filter

const isValidCode = (code) => code.length >= 1 && code.length <= 60;
const OFFSET_PATTERN = /^[A-Za-z0-9/_.-]{1,200}$/;

const DEFAULT_PAGE_SIZE = 36;
const MAX_PAGE_SIZE = 100; // Airtable's maximum
const MAX_CODES = 400;
const MAX_FILTER_VALUES = 20;
const MAX_TEXT_LENGTH = 100;
const MAX_SEARCH_TERMS = 8;
const MAX_SIZE_VALUE = 1000;

const fail = (error) => ({ error });
const toNumber = (raw) => (raw === null || raw.trim() === "" ? NaN : Number(raw));

// Reads and validates the query string of GET /api/inventory.
// Returns { value } with clean, typed filters, or { error } with a short message
// that is safe to send back to the browser (a 400 response).
//
// List parameters are sent as REPEATED parameters (tags=A&tags=B), not separated
// by commas, because names such as "Knee, Hydraulic" contain commas.
export function parseInventoryParams(url) {
  const query = url.searchParams;

  for (const name of query.keys()) {
    if (!ALLOWED_PARAMS.has(name)) return fail("Unknown parameter");
  }

  // pageSize: whole number from 1 to 100
  let pageSize = DEFAULT_PAGE_SIZE;
  if (query.has("pageSize")) {
    const raw = query.get("pageSize");
    pageSize = /^\d+$/.test(raw) ? Number(raw) : NaN;
    if (!(pageSize >= 1 && pageSize <= MAX_PAGE_SIZE)) {
      return fail(`pageSize must be a whole number from 1 to ${MAX_PAGE_SIZE}`);
    }
  }

  // offset: opaque text that Airtable gave us in the previous page
  const offset = query.get("offset");
  if (offset !== null && !OFFSET_PATTERN.test(offset)) {
    return fail("offset is not valid");
  }

  // SKU code lists (group codes)
  const includeSku = [...new Set(query.getAll("includeSku"))];
  const excludeSku = [...new Set(query.getAll("excludeSku"))];
  for (const [name, codes] of [
    ["includeSku", includeSku],
    ["excludeSku", excludeSku],
  ]) {
    if (codes.length > MAX_CODES || !codes.every(isValidCode)) {
      return fail(`${name} must be a list of valid SKU codes`);
    }
  }

  // Free-text lists. Descriptions are normalized like the app does today:
  // lowercase, letters, numbers and spaces only.
  const manufacturers = [
    ...new Set(
      query
        .getAll("manufacturers")
        .map((name) => name.trim())
        .filter(Boolean)
    ),
  ];
  const descriptions = [
    ...new Set(
      query
        .getAll("descriptions")
        .map((label) => label.toLowerCase().replace(/[^a-z0-9\s]/gi, "").trim())
        .filter(Boolean)
    ),
  ];
  for (const [name, values] of [
    ["manufacturers", manufacturers],
    ["descriptions", descriptions],
  ]) {
    if (values.length > MAX_FILTER_VALUES || values.some((value) => value.length > MAX_TEXT_LENGTH)) {
      return fail(`${name} has too many values or a value that is too long`);
    }
  }

  // tags: only the known values
  const tags = [...new Set(query.getAll("tags"))];
  if (!tags.every((tag) => ALLOWED_TAGS.includes(tag))) {
    return fail(`tags must be among: ${ALLOWED_TAGS.join(", ")}`);
  }

  // Size range: both numbers or neither, minimum not above maximum
  let minSize = null;
  let maxSize = null;
  const rawMin = query.get("minSize");
  const rawMax = query.get("maxSize");
  if (rawMin !== null || rawMax !== null) {
    minSize = toNumber(rawMin);
    maxSize = toNumber(rawMax);
    if (
      !Number.isFinite(minSize) ||
      !Number.isFinite(maxSize) ||
      minSize < 0 ||
      maxSize > MAX_SIZE_VALUE ||
      minSize > maxSize
    ) {
      return fail("minSize and maxSize must be sent together, as numbers, with minSize not above maxSize");
    }
  }

  // search: up to 100 characters; the word "size" is ignored, as it is today
  const rawSearch = (query.get("search") ?? "").trim();
  if (rawSearch.length > MAX_TEXT_LENGTH) {
    return fail(`search must be at most ${MAX_TEXT_LENGTH} characters`);
  }
  const searchTerms = rawSearch
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term && term !== "size");
  if (searchTerms.length > MAX_SEARCH_TERMS) {
    return fail("search has too many words");
  }

  // part: only the known values ("All" or empty means no filter)
  const rawPart = query.get("part");
  const part = !rawPart || rawPart === "All" ? null : rawPart;
  if (part !== null && !Object.hasOwn(LIMB_GUIDE_BY_PART, part)) {
    return fail(`part must be one of: ${Object.keys(LIMB_GUIDE_BY_PART).join(", ")}`);
  }

  // extremity: Upper or Lower ("All" or empty means no filter)
  const rawExtremity = query.get("extremity");
  const extremity = !rawExtremity || rawExtremity === "All" ? null : rawExtremity;
  if (extremity !== null && !ALLOWED_EXTREMITIES.includes(extremity)) {
    return fail("extremity must be All, Upper or Lower");
  }

  return {
    value: {
      pageSize,
      offset,
      includeSku,
      excludeSku,
      manufacturers,
      descriptions,
      tags,
      minSize,
      maxSize,
      searchTerms,
      part,
      extremity,
    },
  };
}