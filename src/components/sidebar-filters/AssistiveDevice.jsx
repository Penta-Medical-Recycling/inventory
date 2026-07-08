import React, { useState, useEffect } from "react";
import PentaContext from "../../context/PentaContext";

const AssistiveDevice = ({ assistiveDevice, setAssistiveDevice, setSelectedFilters }) => {
  const handleClick = (option) => {
    setAssistiveDevice(option);

    const updatedFilters = {
      Prosthesis: false,
      Orthosis: false,
    };

    if (option !== "All") {
      updatedFilters[option] = true;
    }

    setSelectedFilters((prev) => ({ ...prev, ...updatedFilters }));
  };

  return (
    <div className="filter-section flex flex-col gap-3">
      <label className="mb-1 text-[#4A4A4A] text-2xl">
        Select Assistive Device
      </label>
      <div className="is-fullwidth w-100 rounded-xl border flex overflow-hidden">
        {["All", "Prosthesis", "Orthosis"].map((option) => (
          <button
            key={option}
            onClick={() => handleClick(option)}
            className={`flex-1 px-5 py-2 text-xl rounded-3xl border font-normal transition-all
              ${
                assistiveDevice === option
                  ? "bg-[#D9F1FF] text-[#4A4A4A] border-[#64C8FF] font-semibold"
                  : "text-[#4A4A4A] border-transparent"
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssistiveDevice;