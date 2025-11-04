import React from "react";

const Pediatric = ({ pediatric, setPediatric }) => {
  return (
    <div className="filter-section">
      <label className="mr-3 font-bold text-[#4A4A4A] text-2xl">Pediatric</label>

      <label className="cursor-pointer">
        <div
          onClick={() => setPediatric(!pediatric)}
          className={`relative w-14 h-8 rounded-full float-right bg-gray-300`}
        >
          <div
            className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-all duration-300
              ${pediatric ? "translate-x-6 bg-[#64C8FF]" : "translate-x-0 bg-white"}`}
          />
        </div>
      </label>
    </div>
  );
};

export default Pediatric;
