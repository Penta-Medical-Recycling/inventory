import { listPage } from "../lib/airtable.js";
import { json } from "../lib/responses.js";
 
const AVAILABLE_ITEMS_FORMULA =
  'AND(AND({Requests}="",{Shipment Status}=""),NOT({SKU}=""))';
 
export async function handleMaxSize(request, env) {
  const page = await listPage(env, "Inventory", {
    pageSize: 1,
    "sort[0][field]": "Size",
    "sort[0][direction]": "desc",
    filterByFormula: AVAILABLE_ITEMS_FORMULA,
  });
 
  const maxSize = page.records?.[0]?.fields?.Size ?? null;
  return json({ maxSize });
}
 