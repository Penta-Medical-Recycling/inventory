// Respuestas uniformes para todos los endpoints.
 
export function json(body, { status = 200, cache = "no-store" } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cache,
    },
  });
}
 
export function errorResponse(status, message) {
  return json({ error: message }, { status });
}
 