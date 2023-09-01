import MultipleSelect from "./MultipleSelect";
import SizeSlider from "./SizeSlider";
import React, { useEffect, useRef, useContext } from "react";
import PentaContext from "../context/PentaContext";

const SideBar = () => {
  const { setIsActive, isActive, fetchMaxSize, setLargestSize, setMaxValue } =
    useContext(PentaContext);

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

  useEffect(() => {
    const fetchMax = async () => {
      const max = await fetchMaxSize();
      setLargestSize(max);
      setMaxValue(max);
    };
    fetchMax();
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
      <MultipleSelect />
      <hr style={{ width: "80%", margin: "10px auto 0px" }}></hr>
      <SizeSlider />
    </div>
  );
};

export default SideBar;
