import React, { useContext } from "react";
import PentaContext from "../../context/PentaContext";
import FilterLogo from "../../assets/FilterLogo";
import { Button } from "@/components/ui/button";

// Controls the filters on the front page.

const Tags = ({}) => {
  const {
    selectedFilter,
    isRangeOn,
    selectedManufacturer,
    extremity,
    isSideBarActive,
    setIsSideBarActive,
  } = useContext(PentaContext);

  // How many of the 5 filters are set to something other than their default.
  const count = [
    selectedFilter.Prosthesis || selectedFilter.Orthosis, // Assistive Device
    extremity === "Upper" || extremity === "Lower", // Extremity
    selectedManufacturer.length > 0, // Manufacturer
    selectedFilter.Pediatric, // Pediatric
    isRangeOn, // Size Range
  ].filter(Boolean).length;

  // Toggle the sidebar's active state.
  const activeToggle = () => {
    setIsSideBarActive(!isSideBarActive);
  };

  const isActive = count > 0;

  return (
    <div
      id="filter-buttons"
    >
      {/* Filter button to toggle sidebar */}
      <Button
        variant="outline"
        size="lg"
        onClick={activeToggle}
        aria-pressed={Boolean(isActive)}
        className={`gap-2.5 rounded-full px-4 [&_svg]:fill-current ${
          isActive
            ? "border-[#ff5c48] bg-[#ff5c48] text-white hover:bg-[#ff5c48]/90 hover:text-white"
            : ""
        }`}
      >
        <FilterLogo />
        <span>
          {count > 0 ? `${count} ` : ""}
          {count !== 1 ? "Filters" : "Filter"}
        </span>
      </Button>
    </div>
  );
};

export default Tags;
