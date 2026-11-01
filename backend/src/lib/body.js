// Largest JSON body a route will read. Plenty for a cart; blocks absurd payloads.
const MAX_BODY_CHARS = 20000;

// Reads the JSON body of a request.
// Returns { value } with a plain object, or { error, status } that is safe to
// send back to the browser. Bad input is the client's fault (400/413), so this
// never throws for it.
export async function readJsonBody(request) {
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) {
    return { error: "Body is too large", status: 413 };
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return { error: "Body must be valid JSON", status: 400 };
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "Body must be a JSON object", status: 400 };
  }

  return { value: body };
}