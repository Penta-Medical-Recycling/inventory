// Shared test render helper: wraps a component in the app's providers (HashRouter + PentaProvider)
// so components that consume PentaContext or use routing work as they do in the app.
// Re-exports Testing Library so tests can `import { render, screen, ... } from "../test/utils"`.
import { render } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import PentaProvider from "../context/PentaProvider";

function AllProviders({ children }) {
  return (
    <HashRouter>
      <PentaProvider>{children}</PentaProvider>
    </HashRouter>
  );
}

// Render with app providers. Pass { withProviders: false } for pure components that need none.
export function renderWithProviders(ui, { withProviders = true, ...options } = {}) {
  return render(ui, { wrapper: withProviders ? AllProviders : undefined, ...options });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
