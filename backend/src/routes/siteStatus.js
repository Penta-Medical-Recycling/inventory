import { listRecords } from "../lib/airtable.js";
import { json } from "../lib/responses.js";
 
const VALID_STATUSES = new Set(["Online", "Offline"]);

// Pega aquí tu función tal cual la tienes en el frontend.
const normalizeRecord = (record, role) => {
  if (!record) throw new Error(`Site-Status is missing the ${role} record`);

  const status = String(record.fields?.Status ?? "").trim();
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`Site-Status ${role} record has an invalid Status`);
  }

  return {
    status,
    message:
      typeof record.fields?.Message === "string" ? record.fields.Message : "",
  };
};

const findRecord = (records, id, functionPattern) =>
  records.find((record) => String(record?.fields?.ID ?? "") === id) ||
  records.find((record) => functionPattern.test(functionName(record)));

function parseSiteStatusRecords(records) {
  if (!Array.isArray(records)) {
    throw new Error("Site-Status response did not contain a records array");
  }

  return {
    announcement: normalizeRecord(
      findRecord(records, "1", /pop[- ]?up|announcement/i),
      "announcement"
    ),
    platform: normalizeRecord(
      findRecord(records, "2", /platform/i),
      "platform"
    ),
  };
}
 
export async function handleSiteStatus(request, env) {
  const records = await listRecords(env, "Site-Status");
  const status = parseSiteStatusRecords(records);
 
  return json(status, { cache: "public, max-age=10" });
}
 