import { getCorsHeaders, withCors } from "./lib/cors.js";
import { errorResponse } from "./lib/responses.js";
import { handleSiteStatus } from "./routes/siteStatus.js";
import { handleSkuGroups } from "./routes/skuGroups.js";
import { listRoutes } from "./routes/lists.js";
import { handleInventory } from "./routes/inventory.js";
import { handleMaxSize } from "./routes/maxSize.js";
import { handleAvailability } from "./routes/availability.js";
import { handleRequests } from "./routes/requests.js";

const routes = {
  // GET ENDPOINTS
  "GET /api/site-status": handleSiteStatus,
  "GET /api/sku-groups": handleSkuGroups,
  ...listRoutes,
  "GET /api/inventory": handleInventory,
  "GET /api/inventory/max-size": handleMaxSize,

  // POST ENDPOINTS
  "POST /api/inventory/availability": handleAvailability,
  "POST /api/requests": handleRequests
};

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { pathname } = new URL(request.url);
    const routeKey = `${request.method} ${pathname}`;

    const handler = Object.hasOwn(routes, routeKey) ? routes[routeKey] : undefined;

    if (!handler) {
      return withCors(errorResponse(404, "Not found"), corsHeaders);
    }

    try {
      const response = await handler(request, env, ctx);
      return withCors(response, corsHeaders);
    } catch (error) {
      console.error(`Error in ${routeKey}:`, error);
      return withCors(errorResponse(502, "Upstream service unavailable"), corsHeaders);
    }
  },
};