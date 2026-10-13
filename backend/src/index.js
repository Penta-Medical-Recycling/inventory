import { getCorsHeaders, withCors } from "./lib/cors.js";
import { errorResponse } from "./lib/responses.js";
import { handleSiteStatus } from "./routes/siteStatus.js";
 
const routes = {
  "GET /api/site-status": handleSiteStatus,
};
 
export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCorsHeaders(request, env);
 
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
 
    const { pathname } = new URL(request.url);
    const handler = routes[`${request.method} ${pathname}`];
 
    if (!handler) {
      return withCors(errorResponse(404, "Not found"), corsHeaders);
    }
 
    try {
      const response = await handler(request, env, ctx);
      return withCors(response, corsHeaders);
    } catch (error) {
      console.error(`Error in ${request.method} ${pathname}:`, error);
      return withCors(errorResponse(502, "Upstream service unavailable"), corsHeaders);
    }
  },
};
 
 