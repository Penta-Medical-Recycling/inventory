import React, { useContext, useState, useEffect } from "react";
import PentaContext from "../../context/PentaContext";
import FilterLogo from "../../assets/FilterLogo";

// Controls the filters on the front page.

const Tags = ({}) => {
  const {
    selectedFilter,
    setSelectedFilters,
    isRangeOn,
    selectedManufacturer,
    selectedSKU,
    isSideBarActive,
    setIsSideBarActive,
  } = useContext(PentaContext);

  const [count, setCount] = useState(0);

  // Update the count of active filters whenever filter selections change, filter count is displayed on frontend if greater than 0.
  useEffect(() => {
    let num = 0;
    num += isRangeOn ? 1 : 0;
    num += selectedManufacturer.length || 0;
    num += selectedSKU.length || 0;
    num += selectedFilter["Prosthesis"] ? 1 : 0;
    num += selectedFilter["Orthosis"] ? 1 : 0;
    num += selectedFilter["Pediatric"] ? 1 : 0;
    setCount(num);
  }, [selectedFilter, selectedManufacturer, selectedSKU, isRangeOn]);

  // Toggle the sidebar's active state.
  const activeToggle = () => {
    setIsSideBarActive(!isSideBarActive);
  };

  // Handle clicks on filter buttons by updating the selected filter state.
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
      {/* Filter buttons for different prosthetic categories */}
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

      {/* Filter button to toggle sidebar */}
      <div
        id="filter-button"
        onClick={activeToggle}
        className={
          isRangeOn ||
          selectedManufacturer.length ||
          selectedSKU.length ||
          selectedFilter["Prosthesis"] ||
          selectedFilter["Orthosis"] ||
          selectedFilter["Pediatric"]
            ? "filter-button-active"
            : ""
        }
      >
        {/* Display the count of active filters */}
        <p className="filterCount">{`${count > 0 ? count + " " : ""}`}</p>
        {/* Display "Filter" or "Filters" based on the count */}
        <p>{`${count !== 1 ? "Filters" : "Filter"}`}</p>
        {/* Component for the filter icon */}
        <FilterLogo></FilterLogo>
      </div>
    </div>
  );
};

export default Tags;
