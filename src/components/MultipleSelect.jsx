import { useState, useEffect, useContext } from "react";
import PentaContext from "../context/PentaContext";
import { MultiSelect } from "react-multi-select-component";

const MultipleSelect = () => {
  const {
    selectedManufacturer,
    setSelectedManufacturer,
    selectedSKU,
    setSelectedSKU,
    fetchSelectOptions,
  } = useContext(PentaContext);

  // State variables to store formatted options
  const [manuOptions, setManu] = useState([]);
  const [SKUOptions, setSKUs] = useState([]);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      // Fetch Manufacturers and SKUs options from airTable
      const manufacturersOptions = await fetchSelectOptions("Manufacturers");
      const skuOptions = await fetchSelectOptions("SKUs");

      // Update state with fetched options
      setManu(manufacturersOptions);
      setSKUs(skuOptions);
    };
    fetchFilters();
  }, []);

  return (
    <>
      {/* Select Manufacturer */}
      <div style={{ width: "80%", margin: "0 auto 20px auto" }}>
        <h1
          style={{
            fontSize: "23px",
            fontWeight: "600",
          }}
        >
          Select Manufacturer
        </h1>
        <MultiSelect
          options={manuOptions} // Options for all manufacturers from AirTable
          value={selectedManufacturer} // Currently selected manufacturers
          onChange={setSelectedManufacturer} // Function to update selected manufacturers as filters
        />
      </div>
      <hr style={{ width: "80%", margin: "10px auto" }}></hr>

      {/* Select Description from SKU*/}
      <div style={{ width: "80%", margin: "0 auto 20px auto" }}>
        <h1
          style={{
            fontSize: "23px",
            fontWeight: "600",
          }}
        >
          Select Description
        </h1>
        <MultiSelect
          options={SKUOptions} // Options for all descriptions from AirTable
          value={selectedSKU} // Currently selected descriptions (SKUs)
          onChange={setSelectedSKU} // Function to update selected descriptions as filters
        />
      </div>
    </>
  );
};

export default MultipleSelect;
