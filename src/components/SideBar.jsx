import MultipleSelect from "./MultipleSelect";
import SizeSlider from "./SizeSlider";
import React, { useEffect, useRef, useContext, useState } from "react";
import PentaContext from "../context/PentaContext";

const SideBar = () => {

  // Context? 
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

  // States for each Filter in the sidebar
  const [assistiveDevice, setAssistiveDevice] = useState("");
  const [extremity, setExtremity] = useState("")
  const [description, setDescription] = useState("")
  const [pediatric, setPediatric] = useState(false)

  // Function to handle clicks outside the sidebar to close it
  const sidebarRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = e => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSideBarActive(false);
      }
    };
    // Attach and remove event listeners for handling clicks outside the sidebar
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSideBarActive]);

  // Fetch and set the maximum size for size filtering based on inventory, use only once
  useEffect(() => {
    const fetchMax = async () => {
      const max = await fetchMaxSize();
      setLargestSize(max);
      setMaxValue(max);
    };
    fetchMax();
  }, [fetchMaxSize, setLargestSize, setMaxValue]);

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
    // Reset State: needs to be added 
    setAssistiveDevice("");
    setExtremity("");
    setPediatric(false);
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
        <span
          className="icon is-right is-medium mt-3 mr-5"
          style={{ cursor: "pointer" }}
          onClick={activeToggle}
          id="filter-x"
        >
          <i className="fas fa-times" style={{ fontSize: "1.5rem" }}></i>
        </span>
      </div>
      <hr style={{ width: "80%", margin: "10px auto" }} />

      {/* Assistive Device Section */}
      <div className="filter-section px-4 py-2">
        <label className="label mb-1 block text-gray-700 font-medium">Assistive Device</label>
        <div className="is-fullwidth">
          {["All", "Prothesis", "Orthosis"].map((option) =>
            <button
              key={option}
              onClick={() => setAssistiveDevice(option)}
              className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors
                        ${assistiveDevice === option
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white-500 text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {option}
            </button>
          )}

        </div>
      </div>

      {/* Extremity Section (visible only if assistiveDevice chosen)*/}
      {assistiveDevice && (
        <div className="filter-section px-4 py-2">
          <label className="label mb-1 block text-gray-700 font-medium">Select Extremity</label>
          <div className="flex space-x-2 mt-1">
            {["All", "Lower", "Upper"].map((option) => (
              <button
                key={option}
                onClick={() => setExtremity(option)}
                className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors
                        ${extremity === option
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white-500 text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>


      )}

      {/* Remaining filters (visible only if extremity chosen) */}
      {extremity && (
        <>


          <div className="filter-section px-4 py-2">
            <div className="flex flex-col w-fit space-x-2 mt-1">
              {["All", "Liners", "Adapters", "Knees/Hips", "Pylons", "Feet", "Accessories"].map((option) => (
                <button
                  key={option}
                  onClick={() => setExtremity(option)}
                  className={`px-4 py-1 border-b text-sm font-medium transition-colors
                        ${extremity === option
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white-500 text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>



          <div className="filter-section px-4 py-2">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={pediatric}
                onChange={() => setPediatric(!pediatric)}
              />{" "}
              Pediatric
            </label>
          </div>

          {/* Multi-select component */}
          <MultipleSelect />

          {/* Size Slider */}
          <hr style={{ width: "80%", margin: "10px auto 0px" }} />
          <SizeSlider />
        </>
      )}

      <br />
      <div className="is-flex is-justify-content-center">
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




}

export default SideBar;