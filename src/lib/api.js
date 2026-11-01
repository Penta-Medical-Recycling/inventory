import { API_URL } from "../config/api";

// Get Site-Status
export async function getSiteStatus() {
    try {
        const response = await fetch(`${API_URL}/api/site-status`);

        if (!response.ok) throw new Error(`Error fetching site status: ${response.statusText}`);

        return await response.json();
    } catch (error) {
        console.error("Error in calling /api/site-status:", error);
        return null
    }
}

// Get SKU Groups
export async function getSKUGroups(){
    try{
        const response = await fetch(`${API_URL}/api/sku-groups`);

        if (!response.ok) throw new Error(`Error fetching SKU Groups: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error in calling /api/sku-groups:", error);
        return null;
    }
}


// Get Table Lists
export async function getRequestParties(listName) {
    try {
        const response = await fetch(`${API_URL}/api/lists/${listName}`);
        if (!response.ok) throw new Error(`Error fetching request parties: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error in calling /api/lists:", error);
        return null;
    }
}

// Get Max Size

export async function getMaxSize() {
  try {
    const response = await fetch(`${API_URL}/api/inventory/max-size`);
    if (!response.ok) throw new Error(`Error fetching max size: ${response.statusText}`);
    const data = await response.json();
    return Number.isFinite(data?.maxSize) ? data.maxSize : null;
  } catch (error) {
    console.error("Error in calling /api/inventory/max-size:", error);
    return null;
  }
}

export async function getInventoryPage(params = {}) {
  try {
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(name, item));
      } else {
        query.set(name, value);
      }
    }
 
    const response = await fetch(`${API_URL}/api/inventory?${query}`);
    if (!response.ok) throw new Error(`Error fetching inventory: ${response.statusText}`);
 
    const data = await response.json();
    if (!Array.isArray(data?.records)) return null;
    return { records: data.records, offset: data.offset ?? null };
  } catch (error) {
    console.error("Error in calling /api/inventory:", error);
    return null;
  }
}
 
// Reads EVERY page for the given params, 100 records at a time. Returns all the
// records, or null if any page fails (never a partial list). Used by the master
// list in the provider and by the download button.
export async function getAllInventory(params = {}) {
  const records = [];
  let offset;
 
  for (let pageCount = 0; pageCount < 1000; pageCount++) {
    const page = await getInventoryPage({ ...params, pageSize: 100, offset });
    if (page === null) return null;
 
    records.push(...page.records);
    if (!page.offset) return records;
    offset = page.offset;
  }
  return null; // safety bound: something is wrong if we get here
}




// Which of these Item IDs can no longer be requested? Returns an array of IDs
// (empty if all are available), or null if the check failed.
export async function checkAvailability(itemIds) {
  try {
    const response = await fetch(`${API_URL}/api/inventory/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    });
    if (!response.ok) throw new Error(`Error checking availability: ${response.statusText}`);
 
    const data = await response.json();
    return Array.isArray(data?.unavailableIds) ? data.unavailableIds : null;
  } catch (error) {
    console.error("Error in calling /api/inventory/availability:", error);
    return null;
  }
}
 
// Creates a request. Returns { ok, status }: ok is true on success. A 409 status
// means some items stopped being available while the user was checking out.
export async function createRequest(data) {
  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    console.error("Error in calling /api/requests:", error);
    return { ok: false, status: 0 };
  }
}
 