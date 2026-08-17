import { expect } from "@playwright/test";
import {
  clinicians,
  inventoryItems,
  partners,
  siteStatus,
} from "./airtable-fixtures";

const AIRTABLE_PATTERN = "https://api.airtable.com/v0/**";

export async function installAirtableMocks(
  page,
  {
    inventory = inventoryItems,
    groups = [],
    partnerRecords = partners,
    clinicianRecords = clinicians,
    availableItemIds,
  } = {}
) {
  const state = {
    availableItemIds: new Set(
      availableItemIds || inventory.map((item) => item.fields["Item ID"])
    ),
    inventoryRequests: [],
  };

  await page.route(AIRTABLE_PATTERN, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const table = decodeURIComponent(url.pathname.split("/").pop());

    if (request.method() === "POST" && table === "Requests") {
      await route.fallback();
      return;
    }

    if (table === "Site-Status") {
      await route.fulfill({ json: { records: siteStatus } });
      return;
    }

    if (table === "SKU Groups") {
      await route.fulfill({ json: { records: groups } });
      return;
    }

    if (table === "Partners") {
      await route.fulfill({ json: { records: partnerRecords } });
      return;
    }

    if (table === "Clinicians") {
      await route.fulfill({ json: { records: clinicianRecords } });
      return;
    }

    if (table === "Inventory") {
      const formula = url.searchParams.get("filterByFormula") || "";
      const isAvailabilityCheck = formula.includes("{Item ID}=");
      let records = inventory;
      state.inventoryRequests.push(url.href);

      if (isAvailabilityCheck) {
        records = inventory.filter(
          (item) =>
            formula.includes(item.fields["Item ID"]) &&
            state.availableItemIds.has(item.fields["Item ID"])
        );
      } else {
        const searchTerms = [...formula.matchAll(/SEARCH\("([^"]+)"/g)].map(
          (match) => match[1].toLowerCase()
        );
        if (searchTerms.length > 0) {
          records = inventory.filter((item) =>
            searchTerms.every((term) =>
              String(item.fields.StringSearch || "")
                .toLowerCase()
                .includes(term)
            )
          );
        }
      }

      await route.fulfill({ json: { records } });
      return;
    }

    await route.abort();
  });

  await page.addInitScript(() => {
    if (!sessionStorage.getItem("e2e-initialized")) {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("e2e-initialized", "true");
      localStorage.setItem(
        "penta:announcement-dismissed",
        "bulk-order-workflow-v2"
      );
    }
  });

  return state;
}

export async function captureSuccessfulRequest(page) {
  let requestPayload;
  await page.route("https://api.airtable.com/v0/**/Requests", async (route) => {
    requestPayload = route.request().postDataJSON();
    await route.fulfill({
      json: {
        records: [
          {
            id: "recRequestE2E",
            fields: requestPayload.records[0].fields,
          },
        ],
      },
    });
  });
  return () => requestPayload;
}

export async function addItem(page, name) {
  await page.getByRole("button", { name: `Add ${name} to cart` }).click();
}

export async function choosePartner(page, partnerName, clinicianName) {
  await page.getByLabel("PartnerDropdown").click();
  await page.getByRole("option", { name: partnerName }).click();

  if (clinicianName) {
    await expect(page.getByRole("button", { name: "SubmitPartner" })).toBeDisabled();
    await page.getByLabel("ClinicianDropdown").click();
    await page.getByRole("option", { name: clinicianName }).click();
  }

  await page.getByRole("button", { name: "SubmitPartner" }).click();
  await expect(page).toHaveURL(/#\/cart$/);
}

export async function submitRequest(page) {
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Confirm" }).click();
}
