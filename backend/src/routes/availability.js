import { errorResponse, json } from "../lib/responses.js";
import { readJsonBody } from "../lib/body.js";
import {
  findAvailableItems,
  parseItemIds,
  MAX_ITEM_IDS_PER_LOOKUP,
} from "../lib/inventoryItems.js";
 
// POST /api/inventory/availability
// Body: { "itemIds": ["26-1813", "26-1595"] }
// Returns: { "unavailableIds": [...] } with the items that can no longer be requested.
export async function handleAvailability(request, env) {
  const body = await readJsonBody(request);
  if (body.error) return errorResponse(body.status, body.error);
 
  if (!Object.keys(body.value).every((key) => key === "itemIds")) {
    return errorResponse(400, "Unknown field");
  }
 
  const { value: itemIds, error } = parseItemIds(body.value.itemIds, MAX_ITEM_IDS_PER_LOOKUP);
  if (error) return errorResponse(400, error);
 
  // If Airtable fails this throws, and index.js answers with a generic 502.
  const available = await findAvailableItems(env, itemIds);
  const unavailableIds = itemIds.filter((id) => !available.has(id));
 
  return json({ unavailableIds });
}