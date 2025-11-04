import React from "react";

const Extremity = ({ extremity, setExtremity }) => {
  return (
    <div className="filter-section flex flex-col gap-3">
      <label className="mb-1 text-[#4A4A4A] text-2xl">Select Extremity</label>
      <div className="is-fullwidth w-100 rounded-xl border flex overflow-hidden">
        {["All", "Lower", "Upper"].map((option) => (
          <button
            key={option}
            onClick={() => setExtremity(option)}
            className={`flex-1 px-5 py-2 text-xl rounded-3xl border font-normal transition-all
              ${extremity === option
                ? "bg-[#D9F1FF] text-[#4A4A4A] border-[#64C8FF] font-semibold"
                : "text-[#4A4A4A] border-transparent"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Extremity;