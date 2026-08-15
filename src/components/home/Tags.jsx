import { useContext } from "react";
import PentaContext from "../../context/PentaContext";
import FilterLogo from "../../assets/FilterLogo";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Controls the filters on the front page.

const Tags = () => {
  const {
    selectedFilter,
    isRangeOn,
    selectedManufacturer,
    selectedDescriptions,
    selectedPart,
    extremity,
    isSideBarActive,
    setIsSideBarActive,
    clearFilters,
  } = useContext(PentaContext);

  // Count each visible filter category that differs from its default.
  const count = [
    selectedFilter.Prosthesis || selectedFilter.Orthosis, // Assistive Device
    extremity === "Upper" || extremity === "Lower", // Extremity
    selectedPart && selectedPart !== "All", // Part
    selectedDescriptions.length > 0, // Description
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
    <div id="filter-buttons" className="gap-2">
      {/* Filter button to toggle sidebar */}
      <Button
        variant="outline"
        size="lg"
        onClick={activeToggle}
        aria-pressed={Boolean(isActive)}
        className={`h-11 gap-2.5 rounded-full px-5 text-base ${
          isActive
            ? "border-[#64C8FF] bg-[#D9F1FF] text-[#1679AD] hover:bg-[#C9EAFF] hover:text-[#1679AD] [&_svg]:fill-current"
            : ""
        }`}
      >
        <FilterLogo />
        <span>
          {count > 0 ? `${count} ` : ""}
          {count !== 1 ? "Filters" : "Filter"}
        </span>
      </Button>
      {isActive && (
        <Button
          variant="ghost"
          size="lg"
          onClick={clearFilters}
          aria-label="Clear all filters"
          className="h-11 gap-1.5 rounded-full px-3 text-base text-[#4A4A4A] hover:px-4 hover:bg-[#FFF0EE] hover:text-[#D63F2E]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span>Clear</span>
        </Button>
      )}
    </div>
  );
};

export default Tags;
