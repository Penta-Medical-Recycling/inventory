// Shared FIFO bulk add-to-cart logic used by both the in-cart quantity modal
// (single SKU, prioritising the clicked unit) and the group-level bulk order flow.

// Writes one cart entry (Qty 1) per physical unit into localStorage, keyed by Item ID.
function writeCartEntry(entry, selectedSize) {
  localStorage.setItem(
    entry["Item ID"],
    JSON.stringify({
      ...entry,
      ["Qty."]: 1,
      ...(selectedSize && { ["Selected Size"]: selectedSize }),
    })
  );
}

// Filters `items` down to units that match `matcher`, aren't already in the
// cart, and (when a size is chosen) fall within the selected size.
function filterAvailableItems(items, matcher, selectedSize) {
  if (!Array.isArray(items)) return [];
  return items.filter((entry) => {
    if (!matcher(entry)) return false;
    if (localStorage.getItem(entry["Item ID"])) return false;

    const itemSize = parseFloat(entry?.["Size"]);
    if (selectedSize?.exact) {
      return itemSize === parseFloat(selectedSize.exact);
    }
    if (selectedSize?.range) {
      return itemSize >= selectedSize.range[0] && itemSize <= selectedSize.range[1];
    }
    return true;
  });
}

// Number of units currently addable for `matcher` (and optional size). Lets the
// UI cap a quantity picker instead of validating only after submit.
export function countAvailableUnits({ items, matcher, selectedSize = null }) {
  return filterAvailableItems(items, matcher, selectedSize).length;
}

// Adds `unitsRequested` distinct units matching `matcher` to the cart, filling
// FIFO from `items`. A `priorityItemId` (the clicked unit) is added first.
// Returns { addedCount, availableCount, status } without touching UI state.
export function bulkAddToCart({
  items,
  matcher,
  unitsRequested,
  selectedSize = null,
  priorityItemId = null,
}) {
  const units = parseInt(unitsRequested, 10);
  if (!Number.isFinite(units) || units <= 0) {
    return { addedCount: 0, availableCount: 0, status: "invalid-quantity" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { addedCount: 0, availableCount: 0, status: "inventory-unavailable" };
  }

  const availableItems = filterAvailableItems(items, matcher, selectedSize);

  if (units > availableItems.length) {
    return { addedCount: 0, availableCount: availableItems.length, status: "insufficient-stock" };
  }

  let addedCount = 0;

  const priorityItem = priorityItemId
    ? availableItems.find((entry) => entry["Item ID"] === priorityItemId)
    : null;
  if (priorityItem) {
    writeCartEntry(priorityItem, selectedSize);
    addedCount++;
  }

  for (let i = 0; i < availableItems.length && addedCount < units; i++) {
    const entry = availableItems[i];
    const entryId = entry["Item ID"];
    if (entryId === priorityItemId || localStorage.getItem(entryId)) continue;

    writeCartEntry(entry, selectedSize);
    addedCount++;
  }

  return { addedCount, availableCount: availableItems.length, status: "ok" };
}

// Fallback chain matching how the app derives a display name from a record.
export function getItemDisplayName(entry) {
  return (
    entry?.["Description (from SKU)"]?.[0] ||
    entry?.["Item Name"] ||
    entry?.["Name"] ||
    entry?.["Component"] ||
    entry?.["Model"] ||
    entry?.["SKU"]?.[0] ||
    "Unnamed Item"
  );
}
