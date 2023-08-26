import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import NavBar from "./Components/NavBar";
import { useEffect, useState } from "react";
import SideBar from "./Components/SideBar";
import Partner from "./pages/Partner";

function App() {
  const [cartCount, setCartCount] = useState(
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
      .length
  ); // can be simplified if we create a local storage array called items, and checked its length
  const [isCartPressed, setIsCartPressed] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );
  const [minValue, setMinValue] = useState(1);
  const [largestSize, setLargestSize] = useState(55);
  const [maxValue, setMaxValue] = useState(55);

  const [isOn, setIsOn] = useState(false);

  useEffect(async () => {
    const baseId = "appnx8gtnlQx5b7nI";
    const patKey = import.meta.env.VITE_REACT_APP_API_KEY;
    const encodedTableName = encodeURIComponent("Inventory");
    const url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}?pageSize=1&sort%5B0%5D%5Bfield%5D=Size&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=AND(AND({Requests}=%22%22,{Shipment%20Status}=%22%22),NOT({SKU}=%22%22))`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${patKey}`,
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    setLargestSize(data.records[0].fields.Size);
    setMaxValue(data.records[0].fields.Size);
  }, []);

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
        largestSize={largestSize}
      />
      <main>
        <NavBar
          cartCount={cartCount}
          selectedPartner={selectedPartner}
          isActive={isActive}
          isCartPressed={isCartPressed}
          setIsCartPressed={setIsCartPressed}
        />
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
                isCartPressed={isCartPressed}
                setIsCartPressed={setIsCartPressed}
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
