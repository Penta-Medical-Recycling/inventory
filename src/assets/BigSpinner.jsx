import * as React from "react";
import LittleSpinner from "./LittleSpinner";

// extends LittleSpinner for homepage loading with fading animations

function BigSpinner({ size }) {
  return (
    <div className="loading-container fade-in-out-Spin">
      <div className="logo-container">
        <LittleSpinner size={size} />
        <p className="loading-text">Loading ...</p>
      </div>
    </div>
  );
}

export default BigSpinner;
