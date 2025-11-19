import React, { useContext } from "react";
import PentaContext from "../../context/PentaContext";

const Parts = ({ description, setDescription, selectedPart, onPartSelect }) => {
  const { setSelectedDescriptions, setSearchInput } = useContext(PentaContext);

  const partFilters = {
    All: [],
    Liners: ["liner", "cushion liner", "silicone"],
    Adapters: ["adapter", "rotator"],
    "Knees/Hips": ["knee", "hip", "joint"],
    Pylons: ["pylon", "tube"],
    Feet: ["foot", "feet"],
    Accessories: ["socks", "sleeve", "cover", "cosmetic"],
  };

  const handlePartClick = (option) => {
    setDescription(option);

    const terms = partFilters[option] || [];

    if (option === "All" || terms.length === 0) {
      setSelectedDescriptions([]);
      setSearchInput("");
    } else {
      // convert to normal
      const mapped = terms.map((term) => ({
        label: term,
        value: encodeURIComponent(term),
      }));

      setSelectedDescriptions(mapped);
      setSearchInput(terms.join(" "));
    }
  };

  return (
    <div className="filter-section">
      <div className="flex flex-col w-1/3 items-center gap-5">
        {Object.keys(partFilters).map((option) => (
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
        ))}
      </div>
    </div>
  );
};

export default Parts;
