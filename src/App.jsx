import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import Partner from "./pages/Partner";
import Maintenance from "./pages/Maintenance";
import { Toaster } from "./components/ui/sonner";
import { useContext } from "react";
import PentaContext from "./context/PentaContext";
import BigSpinner from "./assets/BigSpinner";

/**
 * Main application component.
 *
 * This component serves as the main structure of the application, including the sidebar,
 * navigation bar, and routing for different pages.
 *
 * Due to how GitHub Pages URL end in the repository name, a Hash Router is used for routing.
 *
 * @returns {JSX.Element} The main application component.
 */

function App() {

  const { serverStatus, serverMessage, serverError } = useContext(PentaContext)

  // The /Site-Status fetch failed (Airtable host issue) - show an error rather
  // than blocking the whole app.
  if (serverError) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>{serverError}</p>
      </div>
    );
  }

  // Intentional maintenance toggle from the Site-Status record.
  if (serverStatus === "Offline") {
    return (
      <Routes>
        <Route path="*" element={<Maintenance message={serverMessage} />}></Route>
      </Routes>
    );
  }

  // While the status is still unresolved (serverStatus === null), hold a loading
  // screen instead of rendering the full app. Otherwise users could browse
  // inventory and start a request in the brief window before an eventual
  // "Offline" response would have replaced the UI.
  if (serverStatus === null) {
    return (
      <div className="initial-loading-screen">
        <BigSpinner size={75} />
      </div>
    );
  }

  return (
    <>
      <SideBar />
      <main className="app-shell">
        <NavBar />
        <div className="app-scroll-region">
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/cart" element={<Cart />}></Route>
            <Route path="/partner" element={<Partner />}></Route>
          </Routes>
        </div>
      </main>
      <Toaster
        position="top-center"
        mobileOffset={{ top: 16, right: 16, bottom: 24, left: 16 }}
        richColors
        closeButton
      />
    </>
  );
}

export default App;
