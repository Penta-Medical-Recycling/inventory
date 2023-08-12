import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import NavBar from "./Components/NavBar";
import { useState } from "react";
import SideBar from "./Components/SideBar";
import Partner from "./pages/Partner";

function App() {
  const [cartCount, setCartCount] = useState(
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
      .length
  ); // can be simplified if we create a local storage array called items, and checked its length
  const [isActive, setIsActive] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );
  return (
    <>
      <SideBar
        isActive={isActive}
        setIsActive={setIsActive}
        selectedManufacturer={selectedManufacturer}
        setSelectedManufacturer={setSelectedManufacturer}
        selectedSKU={selectedSKU}
        setSelectedSKU={setSelectedSKU}
      />
      <main>
        <NavBar cartCount={cartCount} selectedPartner={selectedPartner} />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                cartCount={cartCount}
                setCartCount={setCartCount}
                isActive={isActive}
                setIsActive={setIsActive}
                selectedManufacturer={selectedManufacturer}
                setSelectedManufacturer={setSelectedManufacturer}
                selectedSKU={selectedSKU}
                setSelectedSKU={setSelectedSKU}
              />
            }
          ></Route>
          <Route
            path="/cart"
            element={
              <Cart
                cartCount={cartCount}
                setCartCount={setCartCount}
                selectedPartner={selectedPartner}
              />
            }
          ></Route>
          <Route
            path="/partner"
            element={<Partner setSelectedPartner={setSelectedPartner} />}
          ></Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
