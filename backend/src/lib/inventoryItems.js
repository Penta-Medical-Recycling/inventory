import { listRecords } from "./airtable.js";
import { escapeFormulaString } from "./formula.js";

// Most Item IDs asked about in one Airtable formula. Same as the frontend's
// AVAILABILITY_BATCH_SIZE.
export const MAX_ITEM_IDS_PER_LOOKUP = 100;

const MAX_ITEM_ID_LENGTH = 40;

const quoted = (value) => `"${escapeFormulaString(value)}"`;

// Validates a list of Item IDs coming from a request body.
// Returns { value: [ids] } or { error }. Escaping (not a strict character set)
// is what keeps the formula safe, so unusual-but-real IDs are not rejected.
export function parseItemIds(raw, maxItems) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "itemIds must be a non-empty list" };
  }
  if (raw.length > maxItems) {
    return { error: `itemIds can have at most ${maxItems} items` };
  }

  const ids = [];
  for (const id of raw) {
    if (typeof id !== "string" || id.trim() === "" || id.length > MAX_ITEM_ID_LENGTH) {
      return { error: `Each item ID must be text of 1 to ${MAX_ITEM_ID_LENGTH} characters` };
    }
    ids.push(id.trim());
  }

  if (new Set(ids).size !== ids.length) {
    return { error: "itemIds must not contain duplicates" };
  }
  return { value: ids };
}

// Finds which of the given Item IDs are still available: not part of a request,
// not shipped, and with a SKU (the same base filter as the inventory list).
// Returns a Map of Item ID -> Airtable record ID, with ONLY the available items.
export async function findAvailableItems(env, itemIds) {
  const available = new Map();

  for (let start = 0; start < itemIds.length; start += MAX_ITEM_IDS_PER_LOOKUP) {
    const batch = itemIds.slice(start, start + MAX_ITEM_IDS_PER_LOOKUP);
    const matches = batch.map((id) => `{Item ID}=${quoted(id)}`);

    const records = await listRecords(env, "Inventory", {
      filterByFormula: `AND({Requests}=BLANK(),{Shipment Status}=BLANK(),NOT({SKU}=""),OR(${matches.join(",")}))`,
      pageSize: MAX_ITEM_IDS_PER_LOOKUP,
      "fields[]": "Item ID",
    });

    for (const record of records) {
      const raw = record.fields?.["Item ID"];
      const itemId = Array.isArray(raw) ? raw[0] : raw;
      if (itemId !== undefined && itemId !== null && itemId !== "") {
        available.set(String(itemId), record.id);
      }
    }
  }

  return available;
}