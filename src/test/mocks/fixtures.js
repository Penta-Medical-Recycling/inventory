// Test fixtures shaped to match real Airtable responses from base appHFwcwuXLTNCjtN.
// Field shapes intentionally mirror production: many Inventory fields are ARRAYS, some
// records omit fields entirely (Item ID / Size / Manufacturer), and "Softr Search Field"
// can be an error object. Keep these realistic so components are exercised as in production.

// ---- Site-Status (exactly 2 records: [0] = pop-up, [1] = platform online/offline) ----
export const siteStatusRecords = [
  {
    id: "rec8n7UEH2HBlWa6Y",
    createdTime: "2024-05-07T16:37:19.000Z",
    fields: {
      Message: "We have added a bulk order feature!",
      Funciton: "Pop-Up Message",
      Status: "Online",
      ID: "1",
    },
  },
  {
    id: "recOCMd0mn1bAjnkd",
    createdTime: "2024-05-07T16:38:06.000Z",
    fields: {
      Message: "Under repairs. Thanks for your patience!",
      Funciton: "Platform is Online or Offline",
      Status: "Online",
      ID: "2",
    },
  },
];

// A copy of Site-Status with the platform record flipped to Offline (for maintenance tests).
export const siteStatusOfflineRecords = [
  siteStatusRecords[0],
  {
    ...siteStatusRecords[1],
    fields: { ...siteStatusRecords[1].fields, Status: "Offline" },
  },
];

// ---- Inventory ----
// Full, well-populated record.
const inventoryFull = {
  id: "recmCUCTHvzxmzkbH",
  createdTime: "2022-04-05T20:43:50.000Z",
  fields: {
    "Limb Guide": ["Feet"],
    "Description (from SKU)": ["Left Foot Shell"],
    "Name (from Manufacturer)": ["Freedom Innovation"],
    ImageSearch: "Freedom Innovation Prosthetic Component Left Foot Shell dark skin ",
    "Model/Type": "dark skin",
    "Item ID": "22-1287",
    SKU: ["recn9R0hzoRbrMWiE"],
    "Qty.": 1,
    Size: 29,
    Manufacturer: ["recvXIvEENLGSMkcV"],
    "Value (USD)": [1],
    StringSearch: "22-1287 dark skin 29 freedom innovation lshell prosthesis left foot shell",
    Tag: ["Prosthesis"],
  },
};

// Multi-tag (Pediatric + Prosthesis) record, no Manufacturer.
const inventoryMultiTag = {
  id: "recoAeht1CRnvyMJk",
  createdTime: "2023-06-19T17:39:36.000Z",
  fields: {
    "Description (from SKU)": ["Socket, Left leg"],
    ImageSearch: "Orthotic Component Socket, Left leg Pediatric size socket ",
    "Model/Type": "Pediatric size socket",
    "Item ID": "23-1689",
    SKU: ["rec9wTWUdCHKpWM1F"],
    "Qty.": 1,
    StringSearch: "23-1689 pediatric size socket lskt pediatric, prosthesis socket, left leg",
    Tag: ["Pediatric", "Prosthesis"],
  },
};

// Edge-case record: no Item ID, no Tag, no Size, no Manufacturer, and a "Softr Search Field"
// that is an error object. Components must not crash on this.
const inventoryEdgeCase = {
  id: "recjhJFf4MO3CZIbB",
  createdTime: "2026-07-06T12:25:33.000Z",
  fields: {
    "Limb Guide": ["Pylons"],
    "Description (from SKU)": ["Pylon, with Integrated Tube Clamp"],
    ImageSearch: "Orthotic Component Pylon, with Integrated Tube Clamp ",
    SKU: ["recjOpONYGbqtxsuS"],
    "Qty.": 1,
    "Value (USD)": [15],
    StringSearch: "pyic pylon, with integrated tube clamp",
    "Softr Search Field": { error: "#ERROR!" },
  },
};

export const inventoryRecords = [inventoryFull, inventoryMultiTag, inventoryEdgeCase];

// A record shaped for the cart-fulfillment (PATCH) path: includes fields that are absent from the
// normal filtered list response because they are filtered out server-side.
export const inventoryFulfillableRecord = {
  id: "recFulfill000000001",
  createdTime: "2024-01-01T00:00:00.000Z",
  fields: {
    "Item ID": "24-0001",
    "Description (from SKU)": ["Universal Foot"],
    SKU: ["recIpiOGwJ5bH5VYU"],
    Size: 28,
    Tag: ["Prosthesis"],
    "Quantity In Stock": 3,
    "Date Added": "2024-01-01",
  },
};

// ---- Manufacturers (fields.Name is what the app maps) ----
export const manufacturerRecords = [
  { id: "rec6jPnDxJ5O5NfUD", createdTime: "2023-09-06T23:41:06.000Z", fields: { Name: "3M", Count: 1, Inventory: ["recztdcFfmsUqfnD9"] } },
  { id: "recVVEKrqeUjaKZHi", createdTime: "2023-09-06T23:41:06.000Z", fields: { Name: "Ability Dynamics", Count: 57, Inventory: ["recQLx9GkGrUV9vbO"] } },
  { id: "recVGn0USRZuFXNVW", createdTime: "2024-07-01T16:07:28.000Z", fields: { Name: "Advanced", Count: 2, Inventory: ["recRAdVealVc4VLVu"] } },
];

// ---- SKUs (endpoint is NOT used by the app today; kept for completeness/robustness) ----
export const skuRecords = [
  { id: "recpSVXh7I59DgEwC", createdTime: "2021-10-19T14:27:02.000Z", fields: { "Item Code": "AAFO", Description: "Articulated Ankle Foot Orthosis", "In Stock": 4, "$/ Unit": 7.5 } },
  { id: "recT6r77bB283blry", createdTime: "2021-10-14T15:00:46.000Z", fields: { "Item Code": "ABL", Description: "Arm Brace, Left", "In Stock": 1, "$/ Unit": 4.5 } },
];

// ---- Partners (fields.Partner is the display name; Tag here is a STRING status) ----
export const partnerRecords = [
  { id: "rec0rIYuQ4xTb0EVH", createdTime: "2025-02-18T21:03:09.000Z", fields: { Partner: "Mitch Dobson", Tag: "ACTIVE", Email: "mitch.dobson@example.com", "Primary Contact": "Mitch Dobson" } },
  { id: "recF6sdrHbMLH5Ib8", createdTime: "2026-05-26T22:12:09.000Z", fields: { Partner: "Healing Hands for Haiti", Tag: "ACTIVE", "Primary Contact": "Josh Bingham" } },
  // Sparse record: no Email / Primary Contact.
  { id: "rec13uLfkPTu1Lvhm", createdTime: "2021-10-11T15:14:37.000Z", fields: { Partner: "ENAM", Tag: "INACTIVE" } },
  { id: "recF5bBGGYd4Oezt4", createdTime: "2022-08-03T18:43:16.000Z", fields: { Partner: "2ft Prosthetics", Tag: "ACTIVE", "Primary Contact": "Dave Williams" } },
];
