export class AirtableError extends Error {
  constructor(status) {
    super(`Airtable request failed with status ${status}`);
    this.name = "AirtableError";
    this.status = status;
  }
}
 
async function airtableFetch(env, path, { method = "GET", query, body } = {}) {
  const url = new URL(`${env.AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${path}`);
 
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
  }
 
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
 
  if (!res.ok) throw new AirtableError(res.status);
  return res.json();
}


export async function listRecords(env, table, query = {}) {
  const records = [];
  let offset;
 
  do {
    const page = await airtableFetch(env, encodeURIComponent(table), {
      query: { ...query, offset },
    });
    records.push(...page.records);
    offset = page.offset;
  } while (offset);
 
  return records;
}