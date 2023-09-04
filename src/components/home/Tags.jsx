import React, { useContext, useState, useEffect } from "react";
import PentaContext from "../../context/PentaContext";

const Tags = ({}) => {
  const {
    selectedFilter,
    setSelectedFilters,
    isOn,
    selectedManufacturer,
    selectedSKU,
    isActive,
    setIsActive,
  } = useContext(PentaContext);

  const [count, setCount] = useState(0);

  useEffect(() => {
    let c = 0;
    c += isOn ? 1 : 0;
    c += selectedManufacturer.length || 0;
    c += selectedSKU.length || 0;
    c += selectedFilter["Prosthesis"] ? 1 : 0;
    c += selectedFilter["Orthosis"] ? 1 : 0;
    c += selectedFilter["Pediatric"] ? 1 : 0;
    setCount(c);
  }, [selectedFilter, selectedManufacturer, selectedSKU, isOn]);

  const activeToggle = () => {
    setIsActive(!isActive);
  };

  const filterClick = (key) => {
    const newObj = { ...selectedFilter };
    newObj[key] = !selectedFilter[key];
    setSelectedFilters(newObj);
  };

  return (
    <div
      id="filter-buttons"
      className="loading-effect"
      style={{ animationDelay: "0.535s" }}
    >
      <div
        className={
          selectedFilter["Prosthesis"] ? "filter-selected filter-3" : "filter-3"
        }
        onClick={() => filterClick("Prosthesis")}
      >
        <p>Prosthesis</p>
      </div>
      <div
        className={
          selectedFilter["Orthosis"] ? "filter-selected filter-3" : "filter-3"
        }
        onClick={() => filterClick("Orthosis")}
      >
        <p>Orthosis</p>
      </div>
      <div
        className={
          selectedFilter["Pediatric"] ? "filter-selected filter-3" : "filter-3"
        }
        onClick={() => filterClick("Pediatric")}
      >
        <p>Pediatric</p>
      </div>
      <div
        id="filter-button"
        onClick={activeToggle}
        className={
          isOn ||
          selectedManufacturer.length ||
          selectedSKU.length ||
          selectedFilter["Prosthesis"] ||
          selectedFilter["Orthosis"] ||
          selectedFilter["Pediatric"]
            ? "filter-button-active"
            : ""
        }
      >
        <p className="filterCount">{`${count > 0 ? count + " " : ""}`}</p>
        <p>{`${count !== 1 ? "Filters" : "Filter"}`}</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height=".65em"
          viewBox="0 0 512 512"
        >
          <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" />
        </svg>
      </div>
    </div>
  );
};

export default Tags;
