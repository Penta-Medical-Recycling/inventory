# Penta Medical Inventory Request System — Agent Instructions

Trust these instructions. Only search the codebase if the information here is incomplete or
proven wrong by what you observe. Searching wastes time that these notes are designed to save.

## What this repository is

A **client-side-only React single-page application (SPA)** that lets Penta Medical Recycling
partners browse, search, filter, and request medical/prosthetic inventory items. There is **no
custom backend**: data is read directly from **Airtable's REST API** from the browser. The app is
built as static files and deployed to **GitHub Pages**.

- **Size:** Small (~40 source files, all under `inventory/src/`).
- **Language:** JavaScript + JSX (NOT TypeScript, though `@types/react` are installed for editor hints).
- **Framework/runtime:** React 18, Vite 4 (dev server + bundler), targets modern browsers.
- **Routing:** `react-router-dom` v6 using a **HashRouter** (required because GitHub Pages serves
  under a subpath). Routes live in `src/App.jsx`.
- **State:** React Context API only (no Redux/Zustand). Global state is in
  `src/context/PentaProvider.jsx`, consumed via `src/context/PentaContext.jsx`.
- **Styling:** Tailwind CSS v4 (utility classes). Some Bulma CSS + Font Awesome are loaded via CDN
  in `index.html`. `bulma-toast` is used for toast notifications. There is **no** full UI component
  library (no MUI/Chakra/AntD); components are hand-built.

## CRITICAL: project root is a subfolder

The npm project lives in **`inventory/`**, NOT the repository root. The repo root has no
`package.json`. **Always `cd inventory` first**, or every npm command fails with
`ENOENT ... could not read package.json`.

## Build, run, lint, deploy

Validated with **Node v24.16.0** and **npm 11.13.0** on Windows. Node 18+ works.

Always run these from inside `inventory/`:

1. **Bootstrap (always do this first after cloning or changing dependencies):**
   ```
   cd inventory
   npm install
   ```
2. **Dev server:** `npm run dev` → serves at `http://localhost:5173/inventory/` (note the
   `/inventory/` base path from `vite.config.js`; the bare root path 404s).
3. **Production build:** `npm run build` → outputs to `inventory/dist/`. Takes ~2s. **This
   succeeds even when lint fails** (build does not run ESLint). A "chunks larger than 500 kB"
   warning is expected and harmless.
4. **Preview a build:** `npm run preview`.
5. **Deploy:** `npm run deploy` (runs build, then `gh-pages -d dist` to push `dist/` to the
   `gh-pages` branch). Only run this when the user explicitly asks to deploy — it publishes live.

### Linting — read this before "fixing lint"

`npm run lint` runs `eslint . --ext js,jsx --max-warnings 0`. **The existing codebase does NOT
pass lint** — a clean checkout reports ~152 problems (~145 errors, mostly `no-unused-vars`,
`react/prop-types`, and `react/no-unescaped-entities`, plus `react-hooks/exhaustive-deps`
warnings). Because of `--max-warnings 0`, the command exits non-zero.

- Do **not** try to fix all pre-existing lint errors — that is out of scope and will bloat a PR.
- Only ensure **files you change** do not introduce *new* lint errors.
- Do not treat a failing `npm run lint` as a regression you caused; verify against baseline first.

### Tests

Testing uses **Vitest** + **React Testing Library** + **MSW** (jsdom environment). Run from
`inventory/`:

- `npm run test` — run the suite once (`vitest run`).
- `npm run test:watch` — watch mode.
- `npm run coverage` — run with V8 coverage.

Layout and conventions:
- Config lives in the `test` block of [vite.config.js](../vite.config.js) (`environment: "jsdom"`,
  `setupFiles: "./src/test/setup.js"`, `globals: true`).
- `src/test/setup.js` wires MSW lifecycle, clears `localStorage`/`sessionStorage` between tests,
  and stubs `VITE_REACT_APP_API_KEY`. MSW uses `onUnhandledRequest: "error"`, so any Airtable call
  a test makes must have a handler.
- `src/test/mocks/` holds `fixtures.js` (Airtable-shaped sample data), `handlers.js` (MSW handlers
  for the base `appHFwcwuXLTNCjtN`), and `server.js` (`setupServer`). Add per-test overrides with
  `server.use(...)`.
- `src/test/utils.jsx` exports `renderWithProviders` (wraps in `HashRouter` + `PentaProvider`) and
  re-exports Testing Library + `userEvent`. Use `{ withProviders: false }` for pure components.
- Test files are colocated as `*.test.jsx`. ESLint has an `overrides` block for `**/*.test.{js,jsx}`
  and `src/test/**` that enables test best-practice plugins (`eslint-plugin-vitest` via
  `plugin:vitest/legacy-recommended`, `eslint-plugin-testing-library`, `eslint-plugin-jest-dom`)
  and disables `react-refresh`/`react/prop-types` there. Note: use the `legacy-*` vitest configs —
  the flat `plugin:vitest/recommended` throws a circular-JSON error under this ESLint 8 setup.
- Many Airtable fields are **arrays** (`Tag`, `SKU`, `Description (from SKU)`,
  `Name (from Manufacturer)`, `Value (USD)`); fixtures reflect this. `Partners.Tag` is a string.
- Gotcha: `PentaProvider.fetchStatus` and most fetch call sites are **unguarded** (no try/catch, and
  they destructure results). Do NOT write error-path tests that force network failures on
  `Site-Status`/`Partners`/`Manufacturers` — they cause unhandled rejections that fail the run.
  Demonstrate resilience with empty (`{ records: [] }`) responses instead.
- Always run `npm run test` before finishing test changes; the suite is fast (~3s).


## Environment / secrets

Data fetching requires an Airtable Personal Access Token exposed to Vite as
`VITE_REACT_APP_API_KEY` in a `.env` file at `inventory/.env`. `.env` is git-ignored and is NOT
present in fresh clones. Without it:

- `npm install`, `npm run build`, and `npm run dev` all still **succeed**.
- The running app cannot load inventory/status data (Airtable calls fail); the app may show the
  Maintenance page because `serverStatus` defaults to `"Offline"` until the status fetch resolves.

Never commit `.env` or hardcode the token. The Airtable base id (`appHFwcwuXLTNCjtN`) is used in
fetch URLs in the context/provider and page components.

## CI / checks before check-in

- **No GitHub Actions CI workflows exist** (`.github/` contains only `dependabot.yml` for the
  `github-actions` ecosystem). Nothing runs build/lint/tests on push or PR automatically.
- Because there is no CI gate, self-validate: `npm install` → `npm run build` must pass, and the
  app must run via `npm run dev` without new console errors.
- README documents a manual flow: commit → `git push origin master` → `npm run build` →
  `npm run deploy`. The default branch is `master`.

## Project layout

Repository root (`inventory/` is the working project):
```
inventory/
  .env                 # git-ignored; VITE_REACT_APP_API_KEY (Airtable PAT)
  .eslintrc.cjs        # ESLint config (react, react-hooks, react-refresh; ignores dist)
  .gitignore
  .github/dependabot.yml
  deploy.sh            # alternative manual gh-pages deploy script
  index.html           # Vite entry HTML; loads Bulma + Font Awesome + GA via CDN
  package.json         # scripts: dev, build, lint, preview, test, test:watch, coverage, deploy
  package-lock.json
  postcss.config.js    # uses @tailwindcss/postcss
  tailwind.config.js   # content globs: index.html + src/**
  vite.config.js       # react plugin; base: "/inventory/"
  src/
    main.jsx           # entry: mounts <App> inside <HashRouter> + <PentaProvider>
    App.jsx            # routes: "/" Home, "/cart" Cart, "/partner" Partner; Maintenance if offline
    App.css
    assets/            # SVG icon components + images (leg-images/)
    components/        # NavBar, SideBar, Toast, CartLister + subfolders:
      cards/           # Card, CardBody, CardGrid, In/OutOfStockCard, modals
      home/            # HomeLister, Pagination, Search, Tags, DownloadButton
      sidebar-filters/ # Manufacturer, Parts, Size, SizeSlider, MultipleSelect, etc.
      leg/, prosthetic-leg/  # ProstheticLegGraphic
    context/
      PentaContext.jsx   # createContext
      PentaProvider.jsx  # ALL global state + Airtable fetch logic lives here
    pages/
      Home.jsx  Cart.jsx  Partner.jsx  Maintenance.jsx
    test/
      setup.js           # MSW lifecycle + localStorage/env stubs (Vitest setupFiles)
      utils.jsx          # renderWithProviders + Testing Library re-exports
      mocks/             # fixtures.js, handlers.js, server.js (MSW)
    **/*.test.jsx        # example tests colocated next to components/pages
```

### Where to make common changes

- **Global state, Airtable fetches, localStorage logic:** `src/context/PentaProvider.jsx`.
- **Routing / top-level page structure:** `src/App.jsx`.
- **Item display / cards / modals:** `src/components/cards/`.
- **Search, pagination, tags, CSV/XLSX download:** `src/components/home/`.
- **Filter sidebar (manufacturer, size, parts, etc.):** `src/components/sidebar-filters/`.
- **Page-level views:** `src/pages/`.

### Notable dependencies (not obvious from layout)

- `fuse.js` + `fuzzysort`: client-side fuzzy search.
- `xlsx`, `json2csv`, `papaparse`, `file-saver`: inventory export to CSV/XLSX.
- `react-multi-select-component`: multi-select filter dropdowns.
- `react-range`: the size range slider.
- `js-cookie`: cookie storage; cart items/notes/partner are persisted in `localStorage`.

## Conventions

- Files are `.jsx`; components use function components with hooks and default exports.
- Consume global state with `useContext(PentaContext)`; add new shared state in `PentaProvider.jsx`
  and expose it through the provider's context value.
- Keep the Vite `base: "/inventory/"` — changing it breaks GitHub Pages asset paths.
- A few pre-existing `// TODO:` markers exist (e.g. `Card.jsx`, `CardGrid.jsx`, `Cart.jsx`); they
  are not blocking.

### Comments

Write comments sparingly. Most code should be self-explanatory through clear naming and structure;
prefer improving names over adding a comment. When you do add one, follow these rules:

- **Never restate what the code does.** If a comment just re-describes the mechanics that the code
  already makes obvious, delete it. Comments should explain *why* (intent, trade-offs, non-obvious
  constraints, edge cases, links to external context), not *what*.
- **Never reference planning or conversational context the reader cannot see.** Do not mention
  "Example A", "Example B + E", step numbers, task/PR descriptions, prompts, or any artifact from
  the process that produced the code. Assume the reader has zero knowledge of how or why the code
  was written — a comment that points to something they cannot access is noise. Write every comment
  so it stands on its own for a developer seeing the file for the first time.
