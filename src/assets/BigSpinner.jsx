import * as React from "react";
import LittleSpinner from "./LittleSpinner";

function BigSpinner({ size }) {
  return (
    <div
      className="loading-container fade-out"
      style={{
        animationDelay: "0.5s",
      }}
    >
      <div className="logo-container">
        <LittleSpinner size={size} />
        <p className="loading-text">Loading ...</p>
      </div>
    </div>
  );
}

export default BigSpinner;
