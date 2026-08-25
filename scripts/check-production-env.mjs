import process from "node:process";
import { loadEnv } from "vite";
import { parseSiteStatusRecords } from "../src/lib/siteStatus.js";

const env = {
  ...loadEnv("production", process.cwd(), ""),
  ...process.env,
};
const requiredVariables = [
  "VITE_REACT_APP_API_KEY",
  "VITE_AIRTABLE_BASE_ID",
];
const isPlaceholder = (value) => !value || /^your-/i.test(value.trim());
const missingVariables = requiredVariables.filter((name) =>
  isPlaceholder(env[name])
);

if (missingVariables.length > 0) {
  console.error(
    `Production environment is missing: ${missingVariables.join(", ")}. ` +
      "Set them in the shell or in .env.production before deploying."
  );
  process.exit(1);
}

const statusUrl = new URL(
  `https://api.airtable.com/v0/${env.VITE_AIRTABLE_BASE_ID}/Site-Status`
);
statusUrl.searchParams.set("maxRecords", "100");

try {
  const response = await fetch(statusUrl, {
    headers: {
      Authorization: `Bearer ${env.VITE_REACT_APP_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable returned HTTP ${response.status}`);
  }

  const data = await response.json();
  parseSiteStatusRecords(data.records);
} catch (error) {
  console.error(`Production Airtable contract check failed: ${error.message}`);
  process.exit(1);
}

console.log("Production Airtable environment and read contract are valid.");