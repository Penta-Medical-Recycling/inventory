import { expect, test } from "@playwright/test";
import { bulkGroup, bulkItems } from "./airtable-fixtures";
import {
  addItem,
  captureSuccessfulRequest,
  choosePartner,
  installAirtableMocks,
  submitRequest,
} from "./helpers";

async function openHome(page) {
  await page.goto("./#/");
  await expect(
    page.getByRole("heading", { name: "Penta Medical Recycling Inventory" })
  ).toBeVisible();
}

test("adds multiple items, removes items, selects a partner, and checks out", async ({
  page,
}) => {
  await installAirtableMocks(page);
  const getRequestPayload = await captureSuccessfulRequest(page);
  await openHome(page);

  await addItem(page, "Test Foot Shell");
  await addItem(page, "Test Knee");
  await addItem(page, "Test Pylon");
  await expect(page.locator("#shopping-cart .badge")).toHaveText("3");

  await page.getByRole("button", { name: "Remove Test Knee from cart" }).click();
  await expect(page.locator("#shopping-cart .badge")).toHaveText("2");

  await page.locator("#shopping-cart").click();
  await expect(page).toHaveURL(/#\/partner$/);
  await choosePartner(page, "E2E Partner");

  await page.getByRole("button", { name: /Expand Test Foot Shell/ }).click();
  await page
    .getByRole("button", { name: "Remove Test Foot Shell E2E-001 from cart" })
    .click();
  await expect(page.locator("#shopping-cart .badge")).toHaveText("1");

  await submitRequest(page);
  await expect.poll(getRequestPayload).toBeTruthy();

  const fields = getRequestPayload().records[0].fields;
  expect(fields.Partner).toEqual(["recPartnerE2E"]);
  expect(fields["Items You Would Like"]).toEqual(["E2E-003"]);
  expect(fields).not.toHaveProperty("Clinicians");
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.locator("#shopping-cart .badge")).toHaveText("0");
});

test("requires a clinician and persists checkout context across reload", async ({
  page,
}) => {
  await installAirtableMocks(page);
  const getRequestPayload = await captureSuccessfulRequest(page);
  await openHome(page);

  await addItem(page, "Test Foot Shell");
  await page.locator("#shopping-cart").click();
  await choosePartner(page, "E2E Clinician Partner", "E2E Clinician");

  await expect(page.getByText("E2E Clinician", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/#\/cart$/);
  await expect(page.getByRole("heading", { name: "E2E Clinician Partner" })).toBeVisible();
  await expect(page.getByText("E2E Clinician", { exact: true })).toBeVisible();
  await expect(page.locator("#shopping-cart .badge")).toHaveText("1");

  await submitRequest(page);
  await expect.poll(getRequestPayload).toBeTruthy();
  const fields = getRequestPayload().records[0].fields;
  expect(fields.Partner).toEqual(["recClinicianPartnerE2E"]);
  expect(fields.Clinicians).toEqual(["recClinicianE2E"]);
});

test("blocks unavailable inventory, lets the user remove it, then checks out", async ({
  page,
}) => {
  const state = await installAirtableMocks(page);
  const getRequestPayload = await captureSuccessfulRequest(page);
  await openHome(page);

  await addItem(page, "Test Foot Shell");
  await addItem(page, "Test Knee");
  await page.locator("#shopping-cart").click();
  await choosePartner(page, "E2E Partner");

  state.availableItemIds.delete("E2E-002");
  await submitRequest(page);

  await expect(page).toHaveURL(/#\/cart$/);
  await expect(page.getByText("1 unavailable")).toBeVisible();
  expect(getRequestPayload()).toBeUndefined();

  await page.getByRole("button", { name: /Expand Test Knee/ }).click();
  await page
    .getByRole("button", { name: "Remove Test Knee E2E-002 from cart" })
    .click();
  await submitRequest(page);

  await expect.poll(getRequestPayload).toBeTruthy();
  expect(getRequestPayload().records[0].fields["Items You Would Like"]).toEqual([
    "E2E-001",
  ]);
});

test("preserves checkout work after a failed request and succeeds on retry", async ({
  page,
}) => {
  await installAirtableMocks(page);
  let attempts = 0;
  let successfulPayload;
  await page.route("https://api.airtable.com/v0/**/Requests", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 500, json: { error: { type: "SERVER_ERROR" } } });
      return;
    }
    successfulPayload = route.request().postDataJSON();
    await route.fulfill({ json: { records: [{ id: "recRetriedRequest" }] } });
  });

  await openHome(page);
  await addItem(page, "Test Pylon");
  await page.locator("#shopping-cart").click();
  await choosePartner(page, "E2E Partner");
  await page.getByLabel(/How many patients do you plan to help/i).fill("4");
  await page.getByLabel(/How many of the patients are children/i).fill("2");
  await page.getByLabel(/Additional notes/i).fill("Keep this work");

  await submitRequest(page);
  await expect(page.getByText(/couldn't submit your request/i)).toBeVisible();
  await expect(page.getByLabel(/How many patients do you plan to help/i)).toHaveValue("4");
  await expect(page.getByLabel(/How many of the patients are children/i)).toHaveValue("2");
  await expect(page.getByLabel(/Additional notes/i)).toHaveValue("Keep this work");
  await expect(page.locator("#shopping-cart .badge")).toHaveText("1");

  await submitRequest(page);
  await expect.poll(() => successfulPayload).toBeTruthy();
  expect(successfulPayload.records[0].fields["Items You Would Like"]).toEqual([
    "E2E-003",
  ]);
  expect(attempts).toBe(2);
});

test("bulk adds sized physical units, removes one, and checks out", async ({ page }) => {
  await installAirtableMocks(page, {
    inventory: bulkItems,
    groups: [bulkGroup],
  });
  const getRequestPayload = await captureSuccessfulRequest(page);
  await openHome(page);

  await page.getByRole("button", { name: "Browse Test Bulk Socket" }).click();
  await page.getByRole("button", { name: /Add multiple Test Bulk Socket items to cart/ }).click();
  await page.getByRole("tab", { name: "Exact size" }).click();
  await page.getByPlaceholder("e.g. 26.5").fill("26");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Increase Quantity" }).click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator("#shopping-cart .badge")).toHaveText("2");

  await page.locator("#shopping-cart").click();
  await choosePartner(page, "E2E Partner");
  await page.getByRole("button", { name: /Expand Test Bulk Socket/ }).click();
  await page
    .getByRole("button", { name: "Remove Test Bulk Socket BULK-001 from cart" })
    .click();

  await submitRequest(page);
  await expect.poll(getRequestPayload).toBeTruthy();
  expect(getRequestPayload().records[0].fields["Items You Would Like"]).toEqual([
    "BULK-002",
  ]);
});

test("searches for inventory and adds the matching product to the cart", async ({
  page,
}) => {
  const state = await installAirtableMocks(page);
  await openHome(page);

  await page
    .getByPlaceholder("Search by keyword, matches all terms")
    .fill("test knee");

  await expect(page.getByRole("button", { name: "Add Test Knee to cart" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Test Foot Shell to cart" })).toHaveCount(0);
  await expect
    .poll(() =>
      state.inventoryRequests.some((url) => {
        const decoded = decodeURIComponent(url);
        return decoded.includes('SEARCH("test"') && decoded.includes('SEARCH("knee"');
      })
    )
    .toBe(true);

  await addItem(page, "Test Knee");
  await expect(page.locator("#shopping-cart .badge")).toHaveText("1");
  await page.locator("#shopping-cart").click();
  await expect(page).toHaveURL(/#\/partner$/);
});
