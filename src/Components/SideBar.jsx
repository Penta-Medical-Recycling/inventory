import MultipleSelect from "./MultipleSelect";
import SizeSlider from "./SizeSlider";
import React, { useEffect, useRef } from "react";

const SideBar = ({
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
  isOn,
  setIsOn,
  largestSize,
}) => {
  const activeToggle = () => {
    setIsActive(!isActive);
  };

  const sidebarRef = useRef(null);

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      id="side-bar"
      className={isActive ? "is-filter-active" : ""}
      ref={sidebarRef}
    >
      <div id="side-bar-top">
        <h1
          className="is-size-3 mt-3"
          style={{ fontWeight: "650", marginRight: "79px" }}
        >
          Filters
        </h1>
        {/* <p className="is-size-3 mx-4" onClick={activeToggle}>
          &#10006;
        </p> */}
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
      <MultipleSelect
        selectedManufacturer={selectedManufacturer}
        setSelectedManufacturer={setSelectedManufacturer}
        selectedSKU={selectedSKU}
        setSelectedSKU={setSelectedSKU}
      />
      <hr style={{ width: "80%", margin: "10px auto 0px" }}></hr>
      <SizeSlider
        minValue={minValue}
        setMinValue={setMinValue}
        maxValue={maxValue}
        setMaxValue={setMaxValue}
        isOn={isOn}
        setIsOn={setIsOn}
        largestSize={largestSize}
      />
    </div>
  );
};

export default SideBar;
