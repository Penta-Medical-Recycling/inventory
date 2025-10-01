import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import Partner from "./pages/Partner";
import Maintenance from "./pages/Maintenance";
import { useContext } from "react";
import PentaContext from "./context/PentaContext";
import Card from "./components/cards/CardComponent";

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

  const { serverStatus, serverMessage } = useContext(PentaContext)
// return (
//   <Routes>
//     <Route path="/" element={<Card />}></Route>
//     </Routes>
// )

  return serverStatus ===  "Offline" ? (
    <Routes>
      <Route path="*" element={<Maintenance message = {serverMessage} />}></Route>
    </Routes>
  ) : 
  (
    <>
      <SideBar />
      <main>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/cart" element={<Cart />}></Route>
          <Route path="/card" element={<Card />}></Route>
          <Route path="/partner" element={<Partner />}></Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
