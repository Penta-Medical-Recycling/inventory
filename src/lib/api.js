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