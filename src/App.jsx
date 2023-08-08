import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import NavBar from "./Components/NavBar";
import { useState } from "react";
import SideBar from "./Components/SideBar";

function App() {
  const [cartCount, setCartCount] = useState(localStorage.length);
  const [isActive, setIsActive] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState([]);
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
      <NavBar cartCount={cartCount} />
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
          element={<Cart cartCount={cartCount} setCartCount={setCartCount} />}
        ></Route>
      </Routes>
    </>
  );
}

export default App;
