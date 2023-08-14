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
  const [minValue, setMinValue] = useState(5);
  const [maxValue, setMaxValue] = useState(15);
  const [isOn, setIsOn] = useState(false);
  return (
    <>
      <SideBar
        isActive={isActive}
        setIsActive={setIsActive}
        selectedManufacturer={selectedManufacturer}
        setSelectedManufacturer={setSelectedManufacturer}
        selectedSKU={selectedSKU}
        setSelectedSKU={setSelectedSKU}
        minValue={minValue}
        setMinValue={setMinValue}
        maxValue={maxValue}
        setMaxValue={setMaxValue}
        isOn={isOn}
        setIsOn={setIsOn}
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
                minValue={minValue}
                maxValue={maxValue}
                isOn={isOn}
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
