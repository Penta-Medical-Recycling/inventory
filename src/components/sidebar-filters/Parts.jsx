import React from "react";

const Parts = ({ description, setDescription, selectedPart, onPartSelect }) => {
  const handlePartClick = (option) => {
    setDescription(option);
    // Also update the selected part for the graphic
    if (onPartSelect) {
      onPartSelect(option);
    }
  };

  return (
    <div className="filter-section">
      <div className="flex flex-col w-1/3 items-center gap-5">
        {["All", "Liners", "Adapters", "Knees/Hips", "Pylons", "Feet", "Accessories"].map(
          (option) => (
            <button
              key={option}
              onClick={() => handlePartClick(option)}
              className={`w-fit px-5 py-2 text-xl rounded-3xl border font-normal transition-all duration-200
                ${description === option || selectedPart === option
                  ? "bg-[#D9F1FF] text-[#4A4A4A] border-[#64C8FF] font-semibold"
                  : "text-[#4A4A4A] border-transparent"}`}
            >
              {option}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Parts;