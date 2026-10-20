import { getCorsHeaders, withCors } from "./lib/cors.js";
import { errorResponse } from "./lib/responses.js";
import { handleSiteStatus } from "./routes/siteStatus.js";
import { handleSkuGroups } from "./routes/skuGroups.js";
import { listRoutes } from "./routes/lists.js";

const routes = {
  "GET /api/site-status": handleSiteStatus,
  "GET /api/sku-groups": handleSkuGroups,
  ...listRoutes,
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