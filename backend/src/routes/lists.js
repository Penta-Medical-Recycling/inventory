import { listRecords } from "../lib/airtable.js";
import { json } from "../lib/responses.js";

const LISTS = {
  manufacturers: { table: "Manufacturers", fields: ["Name"] },
  partners: { table: "Partners", fields: ["Partner", "Tag"] },
  clinicians: { table: "Clinicians", fields: ["Name", "Partners", "Partner (from Partners)"] },
};

const cleanLabel = (value) => String(value ?? "").trim();
const byLabel = (a, b) => a.label.localeCompare(b.label);

function pickFields(record, allowedFields) {
  const source = record?.fields || {};
  const fields = {};
  for (const name of allowedFields) {
    if (Object.hasOwn(source, name)) fields[name] = source[name];
  }
  return { id: record.id, fields };
}

function makeListHandler(listName) {
  const { table, fields } = LISTS[listName];

  return async function handleList(request, env) {
    const records = await listRecords(env, table);
    return json(records.map((record) => pickFields(record, fields)));
  };
}

// Partners come back with their clinicians already attached, so the frontend
// can use the response as-is: { id, fields, label, clinicians: [{ id, label }] }
async function handlePartners(request, env) {
  const [partnerRecords, clinicianRecords] = await Promise.all([
    listRecords(env, LISTS.partners.table),
    listRecords(env, LISTS.clinicians.table),
  ]);

  const cliniciansByPartner = new Map();
  for (const record of clinicianRecords) {
    const label = cleanLabel(record.fields?.Name);
    if (!label) continue;
    for (const partnerId of record.fields?.Partners ?? []) {
      if (!cliniciansByPartner.has(partnerId)) cliniciansByPartner.set(partnerId, []);
      cliniciansByPartner.get(partnerId).push({ id: record.id, label });
    }
  }

  const partners = partnerRecords
    .map((record) => ({
      ...pickFields(record, LISTS.partners.fields),
      label: cleanLabel(record.fields?.Partner),
      clinicians: (cliniciansByPartner.get(record.id) ?? []).sort(byLabel),
    }))
    .filter((partner) => partner.label)
    .sort(byLabel);

  return json(partners);
}

export const listRoutes = {
  ...Object.fromEntries(
    Object.keys(LISTS).map((name) => [`GET /api/lists/${name}`, makeListHandler(name)])
  ),
  "GET /api/lists/partners": handlePartners,
};