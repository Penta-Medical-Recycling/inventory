import MultipleSelect from "./MultipleSelect";
import SizeSlider from "./SizeSlider";
import React, { useEffect, useRef, useContext } from "react";
import PentaContext from "../context/PentaContext";

// SideBar used for advanced filtering

const SideBar = () => {
  const {
    setIsSideBarActive,
    isSideBarActive,
    fetchMaxSize,
    setLargestSize,
    setMaxValue,
    setSelectedManufacturer,
    setSelectedSKU,
    setIsRangeOn,
    setSelectedFilters,
  } = useContext(PentaContext);

  // Function to toggle sidebar visibility
  const activeToggle = () => {
    setIsSideBarActive(!isSideBarActive);
  };

  // Create a ref for the sidebar container
  const sidebarRef = useRef(null);

  // Function to handle clicks outside the sidebar to close it
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSideBarActive(false);
    }
  };

  // Attach and remove event listeners for handling clicks outside the sidebar
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch and set the maximum size for size filtering based on inventory
  useEffect(() => {
    const fetchMax = async () => {
      const max = await fetchMaxSize();
      setLargestSize(max);
      setMaxValue(max);
    };
    fetchMax();
  }, []);

  // Function to remove all applied filters at once
  const removeAllFilters = () => {
    setSelectedManufacturer([]);
    setSelectedSKU([]);
    setIsRangeOn(false);
    setSelectedFilters({
      Prosthesis: false,
      Orthosis: false,
      Pediatric: false,
    });
  };

  return (
    <div
      id="side-bar"
      className={isSideBarActive ? "is-filter-active" : ""}
      ref={sidebarRef}
    >
      {/* Sidebar header */}
      <div id="side-bar-top">
        <h1
          className="is-size-3 mt-3"
          style={{ fontWeight: "650", marginRight: "79px" }}
        >
          Filters
        </h1>
        {/* Close icon */}
        <span
          className="icon is-right is-medium mt-3 mr-5"
          style={{ cursor: "pointer" }}
          onClick={activeToggle}
          id="filter-x"
        >
          <i className="fas fa-times" style={{ fontSize: "1.5rem" }}></i>
        </span>
      </div>
      <hr style={{ width: "80%", margin: "10px auto" }}></hr>
      {/* Component for selecting multiple Manufacturers and Descriptions */}
      <MultipleSelect />
      <hr style={{ width: "80%", margin: "10px auto 0px" }}></hr>
      {/* Component for adjusting size range */}
      <SizeSlider />
      <br></br>
      <div className="is-flex is-justify-content-center">
        {/* Button to reset all filters */}
        <button
          className="button is-rounded removeFilter"
          onClick={removeAllFilters}
          aria-label="FilterReset"
          role="button"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default SideBar;
