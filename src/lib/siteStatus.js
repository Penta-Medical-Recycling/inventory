const VALID_STATUSES = new Set(["Online", "Offline"]);

const functionName = (record) =>
  String(record?.fields?.Function ?? record?.fields?.Funciton ?? "").trim();

const findRecord = (records, id, functionPattern) =>
  records.find((record) => String(record?.fields?.ID ?? "") === id) ||
  records.find((record) => functionPattern.test(functionName(record)));

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

export function parseSiteStatusRecords(records) {
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