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