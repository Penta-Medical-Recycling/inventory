import { listPage } from "../lib/airtable.js";
import { errorResponse, json } from "../lib/responses.js";
import { parseInventoryParams } from "../lib/inventoryParams.js";
import { buildInventoryFormula } from "../lib/formula.js";

// GET /api/inventory
// One page of available inventory. The browser sends simple parameters; this
// handler validates them, builds the Airtable formula itself and asks Airtable.
export async function handleInventory(request, env) {
  const { value, error } = parseInventoryParams(new URL(request.url));

  // Bad input from the client is a 400, not a server error.
  if (error) return errorResponse(400, error);

  const page = await listPage(env, "Inventory", {
    pageSize: value.pageSize,
    "sort[0][field]": "Item ID",
    "sort[0][direction]": "asc",
    filterByFormula: buildInventoryFormula(value),
    offset: value.offset ?? undefined,
  });

  // Same shape as Airtable ({ records, offset }) so the frontend keeps working.
  // PHASE 2 (later): return only the fields the screens use, once you have
  // confirmed the list (see the grep in the notes). For now, full records.
  return json({ records: page.records, offset: page.offset });
}