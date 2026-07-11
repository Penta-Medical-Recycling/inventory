// MSW node server used by Vitest. Import `server` in tests to add per-test overrides via
// server.use(...). Lifecycle (listen/reset/close) is wired in src/test/setup.js.
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
