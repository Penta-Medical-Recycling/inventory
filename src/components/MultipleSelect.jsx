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
  const [manuOptions, setManu] = useState([]);
  const [SKUOptions, setSKUs] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      const manufacturersOptions = await fetchSelectOptions("Manufacturers");
      const skuOptions = await fetchSelectOptions("SKUs");
      setManu(manufacturersOptions);
      setSKUs(skuOptions);
    };
    fetchFilters();
  }, []);

  return (
    <>
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
          options={manuOptions}
          value={selectedManufacturer}
          onChange={setSelectedManufacturer}
          // labelledBy="Select"
        />
      </div>
      <hr style={{ width: "80%", margin: "10px auto" }}></hr>
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
          options={SKUOptions}
          value={selectedSKU}
          onChange={setSelectedSKU}
          // labelledBy="Select"
        />
      </div>
    </>
  );
};

export default MultipleSelect;
