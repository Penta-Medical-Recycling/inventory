// MSW request handlers for the Airtable REST API (base appHFwcwuXLTNCjtN).
// Handlers are permissive on query params (filterByFormula / sort / offset) and key off the
// table path segment. Pagination: an `offset` query param causes the handler to return a page
// WITHOUT a further `offset` (i.e. one extra page then stop), so paginating loops terminate.
import { http, HttpResponse } from "msw";
import {
  siteStatusRecords,
  inventoryRecords,
  manufacturerRecords,
  skuRecords,
  partnerRecords,
} from "./fixtures";

const BASE = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN";

// Airtable envelopes a list response as { records, offset? }.
const list = (records, { offset } = {}) =>
  HttpResponse.json(offset ? { records, offset } : { records });

export const handlers = [
  // Site-Status: platform + pop-up message records.
  http.get(`${BASE}/Site-Status`, () => list(siteStatusRecords)),

  // Inventory (single record fetch, e.g. cart validation PATCH target lookups by id).
  http.get(`${BASE}/Inventory/:recordId`, ({ params }) => {
    const record = inventoryRecords.find((r) => r.id === params.recordId);
    return record ? HttpResponse.json(record) : new HttpResponse(null, { status: 404 });
  }),

  // Inventory list. If the request already carries an `offset`, return the page with no further
  // offset so pagination loops finish; otherwise expose one `offset` to exercise the loop.
  http.get(`${BASE}/Inventory`, ({ request }) => {
    const url = new URL(request.url);
    const hasOffset = url.searchParams.has("offset");
    return list(inventoryRecords, hasOffset ? {} : { offset: "mockOffsetPage2" });
  }),

  // Cart fulfillment PATCH: echo back the patched record.
  http.patch(`${BASE}/Inventory/:recordId`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.recordId,
      createdTime: "2024-01-01T00:00:00.000Z",
      fields: body.fields ?? {},
    });
  }),

  // Manufacturers, SKUs, Partners select-option sources.
  http.get(`${BASE}/Manufacturers`, () => list(manufacturerRecords)),
  http.get(`${BASE}/SKUs`, () => list(skuRecords)),
  http.get(`${BASE}/Partners`, () => list(partnerRecords)),
];
