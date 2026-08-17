export const siteStatus = [
  {
    id: "recPopup",
    fields: { Message: "E2E announcement", Status: "Offline" },
  },
  {
    id: "recPlatform",
    fields: { Message: "", Status: "Online" },
  },
];

export const partners = [
  {
    id: "recPartnerE2E",
    fields: { Partner: "E2E Partner", Tag: "ACTIVE" },
  },
  {
    id: "recClinicianPartnerE2E",
    fields: { Partner: "E2E Clinician Partner", Tag: "ACTIVE" },
  },
];

export const clinicians = [
  {
    id: "recClinicianE2E",
    fields: {
      Name: "E2E Clinician",
      Partners: ["recClinicianPartnerE2E"],
      "Partner (from Partners)": ["E2E Clinician Partner"],
    },
  },
];

export const inventoryItems = [
  {
    id: "recItemOne",
    fields: {
      "Item ID": "E2E-001",
      "Description (from SKU)": ["Test Foot Shell"],
      "Name (from Manufacturer)": ["Test Manufacturer"],
      "Model/Type": "Model One",
      "SKU Item Code": ["TEST-SHELL"],
      SKU: ["recSkuOne"],
      Size: 26,
      Tag: ["Prosthesis"],
      "Qty.": 1,
      StringSearch: "test foot shell model one",
      "Date Added": "2024-01-01",
    },
  },
  {
    id: "recItemTwo",
    fields: {
      "Item ID": "E2E-002",
      "Description (from SKU)": ["Test Knee"],
      "Name (from Manufacturer)": ["Test Manufacturer"],
      "Model/Type": "Model Two",
      "SKU Item Code": ["TEST-KNEE"],
      SKU: ["recSkuTwo"],
      Size: 28,
      Tag: ["Prosthesis"],
      "Qty.": 1,
      StringSearch: "test knee model two",
      "Date Added": "2024-01-02",
    },
  },
  {
    id: "recItemThree",
    fields: {
      "Item ID": "E2E-003",
      "Description (from SKU)": ["Test Pylon"],
      "Name (from Manufacturer)": ["Test Manufacturer"],
      "Model/Type": "Model Three",
      "SKU Item Code": ["TEST-PYLON"],
      SKU: ["recSkuThree"],
      Size: 30,
      Tag: ["Prosthesis"],
      "Qty.": 1,
      StringSearch: "test pylon model three",
      "Date Added": "2024-01-03",
    },
  },
];

export const bulkItems = [
  {
    id: "recBulkOne",
    fields: {
      "Item ID": "BULK-001",
      "Description (from SKU)": ["Test Bulk Socket"],
      "Name (from Manufacturer)": ["Test Manufacturer"],
      "Model/Type": "Bulk One",
      "SKU Item Code": ["TEST-BULK"],
      SKU: ["recSkuBulk"],
      Size: 26,
      Tag: ["Prosthesis"],
      "Qty.": 1,
      StringSearch: "test bulk socket",
      "Date Added": "2024-01-01",
    },
  },
  {
    id: "recBulkTwo",
    fields: {
      "Item ID": "BULK-002",
      "Description (from SKU)": ["Test Bulk Socket"],
      "Name (from Manufacturer)": ["Test Manufacturer"],
      "Model/Type": "Bulk Two",
      "SKU Item Code": ["TEST-BULK"],
      SKU: ["recSkuBulk"],
      Size: 26,
      Tag: ["Prosthesis"],
      "Qty.": 1,
      StringSearch: "test bulk socket",
      "Date Added": "2024-01-02",
    },
  },
  {
    id: "recBulkThree",
    fields: {
      "Item ID": "BULK-003",
      "Description (from SKU)": ["Test Bulk Socket"],
      "Name (from Manufacturer)": ["Test Manufacturer"],
      "Model/Type": "Bulk Three",
      "SKU Item Code": ["TEST-BULK"],
      SKU: ["recSkuBulk"],
      Size: 28,
      Tag: ["Prosthesis"],
      "Qty.": 1,
      StringSearch: "test bulk socket",
      "Date Added": "2024-01-03",
    },
  },
];

export const bulkGroup = {
  id: "recBulkGroup",
  fields: {
    Name: "Test Bulk Socket",
    Key: "test-bulk",
    SKUs: ["recSkuBulk"],
    "SKU Item Codes": ["TEST-BULK"],
    Active: true,
  },
};
