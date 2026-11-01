import { AirtableError, createRecord, getRecord } from "../lib/airtable.js";
import { errorResponse } from "../lib/responses.js";
import { readJsonBody } from "../lib/body.js";
import { findAvailableItems, parseItemIds } from "../lib/inventoryItems.js";

// Limits. PLACEHOLDERS: confirm the real values with the nonprofit.
const MAX_ITEMS_PER_REQUEST = 200;
const MAX_NOTES_LENGTH = 2000;
const MAX_PEOPLE_COUNT = 10000;

const ALLOWED_FIELDS = new Set([
  "partnerId",
  "clinicianId",
  "itemIds",
  "notes",
  "numOfPatients",
  "numOfChildren",
]);

// Airtable record IDs look like "rec" followed by letters and numbers.
const RECORD_ID_PATTERN = /^rec[A-Za-z0-9]{10,20}$/;

const linkedRecordIds = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

// A whole number from 0 up. Empty or missing means 0, as the app does today.
function parseCount(raw, name) {
  if (raw === undefined || raw === null || raw === "") return { value: 0 };
  const count = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : raw;
  if (!Number.isInteger(count) || count < 0 || count > MAX_PEOPLE_COUNT) {
    return { error: `${name} must be a whole number from 0 to ${MAX_PEOPLE_COUNT}` };
  }
  return { value: count };
}

// "#" plus 6 random hex characters, like the request names used so far.
// Match this to the app's generateRandomHexadecimal if it differs.
function generateRequestName() {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return "#" + [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Returns the record, or null if Airtable says it does not exist.
// Any other failure is thrown (it becomes a generic 502 in index.js).
async function findRecord(env, table, recordId) {
  try {
    return await getRecord(env, table, recordId);
  } catch (error) {
    if (error instanceof AirtableError && error.status === 404) return null;
    throw error;
  }
}

// POST /api/requests
// Body: { partnerId, clinicianId?, itemIds, notes?, numOfPatients?, numOfChildren? }
// Returns 201 { ok: true } when the request was created.
export async function handleRequests(request, env) {
  const body = await readJsonBody(request);
  if (body.error) return errorResponse(body.status, body.error);
  const data = body.value;

  if (!Object.keys(data).every((key) => ALLOWED_FIELDS.has(key))) {
    return errorResponse(400, "Unknown field");
  }

  // 1. Validate the shape of every field. Nothing touches Airtable until all of
  //    this passes.
  const { partnerId } = data;
  const clinicianId = data.clinicianId ?? null;
  if (typeof partnerId !== "string" || !RECORD_ID_PATTERN.test(partnerId)) {
    return errorResponse(400, "partnerId is not valid");
  }
  if (clinicianId !== null && (typeof clinicianId !== "string" || !RECORD_ID_PATTERN.test(clinicianId))) {
    return errorResponse(400, "clinicianId is not valid");
  }

  const { value: itemIds, error: itemsError } = parseItemIds(data.itemIds, MAX_ITEMS_PER_REQUEST);
  if (itemsError) return errorResponse(400, itemsError);

  const notes = data.notes ?? "";
  if (typeof notes !== "string" || notes.length > MAX_NOTES_LENGTH) {
    return errorResponse(400, `notes must be text of at most ${MAX_NOTES_LENGTH} characters`);
  }

  const patients = parseCount(data.numOfPatients, "numOfPatients");
  if (patients.error) return errorResponse(400, patients.error);
  const children = parseCount(data.numOfChildren, "numOfChildren");
  if (children.error) return errorResponse(400, children.error);

  // 2. The partner must exist, and the clinician must exist AND belong to it.
  const partner = await findRecord(env, "Partners", partnerId);
  if (!partner) return errorResponse(400, "partnerId does not match a partner");

  if (clinicianId !== null) {
    const clinician = await findRecord(env, "Clinicians", clinicianId);
    const partnerIds = linkedRecordIds(clinician?.fields?.Partner ?? clinician?.fields?.Partners);
    if (!clinician || !partnerIds.includes(partnerId)) {
      return errorResponse(400, "clinicianId does not match a clinician of this partner");
    }
  }

  // 3. Check again that every item is still available and get Airtable's own
  //    record IDs for them. The browser's cart is never trusted.
  const available = await findAvailableItems(env, itemIds);
  if (itemIds.some((id) => !available.has(id))) {
    return errorResponse(409, "Some items are no longer available");
  }

  // 4. Create the request. No typecast on purpose: links use real record IDs,
  //    so a wrong value is rejected instead of creating stray records.
  await createRecord(env, "Requests", {
    Name: generateRequestName(),
    Partner: [partnerId],
    "Additional Notes": notes,
    "Items You Would Like": itemIds.map((id) => available.get(id)),
    "Number of patients helped": patients.value,
    "Number of children helped": children.value,
    ...(clinicianId ? { Clinician: [clinicianId] } : {}),
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}