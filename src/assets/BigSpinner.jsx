import * as React from "react";
import LittleSpinner from "./LittleSpinner";

function BigSpinner({ size }) {
  return (
    <div className="loading-container">
      <LittleSpinner size={size} />
      <br></br>
      <b>Loading ...</b>
    </div>
  );
}

export default BigSpinner;
