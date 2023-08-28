import { useState, useEffect } from "react";
import PentaContext from "./PentaContext";

function PentaProvider({ children }) {
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );
  const [cartCount, setCartCount] = useState(
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
      .length
  );
  const [isCartPressed, setIsCartPressed] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState([]);
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(55);
  const [largestSize, setLargestSize] = useState(60);
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    const fetchMax = async () => {
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
      setLargestSize(data.records[0].fields.Size);
      setMaxValue(data.records[0].fields.Size);
    };

    fetchMax();
  }, []);

  let contextValues = {
    selectedPartner,
    setSelectedPartner,
    cartCount,
    setCartCount,
    isCartPressed,
    setIsCartPressed,
    isActive,
    setIsActive,
    selectedManufacturer,
    setSelectedManufacturer,
    selectedSKU,
    setSelectedSKU,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    largestSize,
    setLargestSize,
    isOn,
    setIsOn,
  };

  return (
    <PentaContext.Provider value={contextValues}>
      {children}
    </PentaContext.Provider>
  );
}

export default PentaProvider;
