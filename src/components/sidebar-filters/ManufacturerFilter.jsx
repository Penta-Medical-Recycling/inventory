import { useState, useEffect, useContext, useMemo } from "react";
import PentaContext from "../../context/PentaContext";
import { MultiSelect } from "react-multi-select-component";

// helpers
const norm = (s = "") =>
  s
    .toLowerCase()
    .replace(/["'’`]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleize = (s = "") =>
  s.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

const Manufacturer = () => {
  const {
    selectedManufacturer,
    setSelectedManufacturer,
    selectedSKU,
    setSelectedSKU,
    selectedFilter,
    fetchSelectOptions,
    setSearchInput,
    selectedDescriptions,
    setSelectedDescriptions,
  } = useContext(PentaContext);

  const [manuOptions, setManu] = useState([]);
  const [descOptions, setDescOptions] = useState([]);

  // load manufacturers (unchanged)
  useEffect(() => {
    (async () => {
      const manufacturersOptions = await fetchSelectOptions("Manufacturers");
      setManu(manufacturersOptions || []);
    })();
  }, [fetchSelectOptions]);

  return (
    <>
      {/* Manufacturer (unchanged) */}
      <div className="filter-section flex flex-col gap-3">
        <label className="mb-1 text-[#4A4A4A] text-2xl">Select Manufacturer</label>
        <MultiSelect
          options={manuOptions}
          value={selectedManufacturer}
          onChange={setSelectedManufacturer}
          labelledBy="Select..."
          hasSelectAll
          ClearSelectedIcon={null}
        />
      </div>
    </>
  );

};

export default Manufacturer;