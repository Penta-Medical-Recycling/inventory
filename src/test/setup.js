// Global test setup (referenced by vite.config.js -> test.setupFiles).
import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./mocks/server";

// The app reads import.meta.env.VITE_REACT_APP_API_KEY at module load; provide a stub so the
// Bearer header is well-formed in tests.
vi.stubEnv("VITE_REACT_APP_API_KEY", "test-api-key");

// Start MSW. Fail on any request that isn't explicitly handled so missed endpoints surface.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Testing Library auto-cleans the DOM after each test when globals are enabled; we only reset
// MSW handlers and storage here.
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => server.close());
