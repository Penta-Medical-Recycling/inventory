import React from "react";

const ResetFilters = ({ removeAllFilters }) => {
  return (
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
  );
};

export default ResetFilters;