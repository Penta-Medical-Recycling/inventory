import React from "react";
import "../LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
      {/* <img src="src/assets/PentaGif.gif"></img> */}
    </div>
  );
};

export default LoadingScreen;
