import React, { useEffect, useRef, useContext, useState } from "react";
import PentaContext from "../context/PentaContext";
import AssistiveDevice from "./sidebar-filters/AssistiveDevice";
import Extremity from "./sidebar-filters/Extremity";
import Parts from "./sidebar-filters/Parts";
import Pediatric from "./sidebar-filters/Pediatric";
import Manufacturer from "./sidebar-filters/Manufacturer";
import Size from "./sidebar-filters/Size";
import ResetFilters from "./sidebar-filters/ResetFilters";
import ProstheticLegGraphic from "./prosthetic-leg/ProstheticLegGraphic";

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
      className={
        isSideBarActive ? "is-filter-active flex flex-col sm:flex-col" : ""
      }
      ref={sidebarRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between mx-3 py-3">
        <label className="is-size-3 text-center flex-1 font-bold">
          Filters
        </label>
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <hr
        style={{
          width: "70%",
          margin: "20px auto",
          backgroundColor: "#F5F5F5",
        }}
      />
      <div className="flex flex-col gap-8 mx-5 sm:flex-col sm:gap-8 sm:mx-5">
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
            {extremity === "Lower" && (
              <div
                className="
      flex w-full items-start justify-between
      gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-1      /* closer spacing */
      
      px-3 md:px-4 lg:px-5 xl:px-6 2xl:px-7                        /* padding INSIDE container */
      py-4 md:py-5 lg:py-6 xl:py-7 2xl:py-8                      /* padding top/bottom */
      
      mb-4 md:mb-6 lg:mb-8                       /* margin BELOW section */
    "
              >
                {/* Parts — LEFT */}
                <div
                  className="
        flex-1 flex items-center justify-ce
        max-w-[50%]
        sm:max-w-[48%]
        md:max-w-[45%]
        lg:max-w-[40%]
        xl:max-w-[38%]
        2xl:max-w-[35%]
        
        pl-2 sm:pl-3 md:pl-4 lg:pl-5 xl:pl-6 2xl:pl-7
        "
                >
                  <Parts
                    description={description}
                    setDescription={setDescription}
                  />
                </div>

                {/* Leg Graphic — RIGHT */}
                <div
                  className="
        flex-1 flex items-center justify-start
        max-w-[50%]
        sm:max-w-[52%]
        md:max-w-[55%]
        lg:max-w-[60%]
        xl:max-w-[62%]
        2xl:max-w-[65%]
        pl-2 sm:pl- md:pl-6 lg:pl-10 xl:pl-12 2xl:pl-10
      "
                >
                  <div
                    className="
          relative w-full
          
          /* leg graphic sizing based on screen */
          max-w-[120px] aspect-[3/5]
          sm:max-w-[160px]
          md:max-w-[200px]
          lg:max-w-[240px]
          xl:max-w-[280px]
          2xl:max-w-[320px]
          
          /* margin around leg so it doesn't feel glued to edges */
          mx-auto my-1
        "
                  >
                    <ProstheticLegGraphic
                      selectedPart={description}
                      scale={window.innerWidth < 640 ? 0.8 : 1}
                    />
                  </div>
                </div>
              </div>
            )}

            <Pediatric
              pediatric={pediatric}
              setPediatric={setPediatric}
              setSelectedFilters={setSelectedFilters}
            />
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
