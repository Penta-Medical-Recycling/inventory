import React, { useEffect, useRef, useContext, useState } from "react";
import PentaContext from "../context/PentaContext";
import AssistiveDevice from "./sidebar-filters/AssistiveDevice";
import Extremity from "./sidebar-filters/Extremity";
import Parts from "./sidebar-filters/Parts";
import Pediatric from "./sidebar-filters/Pediatric";
import Manufacturer from "./sidebar-filters/Manufacturer";
import Size from "./sidebar-filters/Size";
import ResetFilters from "./sidebar-filters/ResetFilters";

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

  const [assistiveDevice, setAssistiveDevice] = useState("");
  const [extremity, setExtremity] = useState("");
  const [description, setDescription] = useState("");
  const [pediatric, setPediatric] = useState(false);

  const activeToggle = () => setIsSideBarActive(!isSideBarActive);

  // Sidebar ref for outside click
  const sidebarRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSideBarActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSideBarActive]);

  // Fetch max size once
  useEffect(() => {
    const fetchMax = async () => {
      const max = await fetchMaxSize();
      setLargestSize(max);
      setMaxValue(max);
    };
    fetchMax();
  }, [fetchMaxSize, setLargestSize, setMaxValue]);

  // Reset all filters
  const removeAllFilters = () => {
    setSelectedManufacturer([]);
    setSelectedSKU([]);
    setIsRangeOn(false);
    setSelectedFilters({
      Prosthesis: false,
      Orthosis: false,
      Pediatric: false,
    });
    setAssistiveDevice("");
    setExtremity("");
    setDescription("");
    setPediatric(false);
  };

  return (
    <div
      id="side-bar"
      className={isSideBarActive ? "is-filter-active flex flex-col" : ""}
      ref={sidebarRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between mx-3">
        <label className="is-size-3 text-center flex-1 font-bold">Filters</label>
        <button
          onClick={activeToggle}
          className="p-2 rounded-full hover:scale-120"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="m-1 h-5 w-5 text-[#4A4A4A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <hr style={{ width: "70%", margin: "20px auto", backgroundColor: "#F5F5F5" }} />
      <div className="flex flex-col gap-8 mx-5">
        <AssistiveDevice
          assistiveDevice={assistiveDevice}
          setAssistiveDevice={setAssistiveDevice}
          setSelectedFilters={setSelectedFilters}
        />


        {assistiveDevice && (
          <Extremity extremity={extremity} setExtremity={setExtremity} />
        )}

        {extremity && (
          <>
            <Parts description={description} setDescription={setDescription} />
            <Pediatric pediatric={pediatric} setPediatric={setPediatric} />
            <Manufacturer />
            <Size />
          </>
        )}

        <ResetFilters removeAllFilters={removeAllFilters} />
      </div>
    </div>
  );
};

export default SideBar;
