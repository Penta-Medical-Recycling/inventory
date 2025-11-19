import React, { useRef } from "react";

import abutmentScrew from "../../assets/leg-images/AbutmentScrew.svg";
import Socket from "../../assets/leg-images/Socket.svg";
import Knee from "../../assets/leg-images/Knee.svg";
import Calf from "../../assets/leg-images/Calf.svg";
import Pylon from "../../assets/leg-images/Pylon.svg";
import Ankle from "../../assets/leg-images/Ankle.svg";
import Foot from "../../assets/leg-images/Foot.svg";

const BASE_CANVAS_WIDTH = 12;
const BASE_CANVAS_HEIGHT = 27;

// Map Parts.jsx categories to leg parts
const CATEGORY_TO_PARTS = {
  Liners: ["screw"],
  Adapters: ["knee", "ankle"],
  "Knees/Hips": ["calf"],
  Pylons: ["pylon"],
  Feet: ["foot"],
  Accessories: [], // Empty array - all parts turn gray
  All: null, // null means show all parts
};

const ProstheticLegGraphic = ({ scale = 0.5, selectedPart }) => {
  const legRef = useRef(null);

  const fade = (part) => {
    // If "Accessories" is selected, fade everything
    if (selectedPart === "Accessories") {
      return "grayscale opacity-40";
    }

    // If a category is selected, only fade parts not in that category
    if (selectedPart && selectedPart !== "All") {
      const partsToShow = CATEGORY_TO_PARTS[selectedPart];
      if (partsToShow && !partsToShow.includes(part)) {
        return "grayscale opacity-40";
      }
    }

    return "";
  };

  const highlight = (part) => {
    // No highlighting when "Accessories" is selected
    if (selectedPart === "Accessories") {
      return "";
    }

    if (selectedPart && selectedPart !== "All") {
      const partsToShow = CATEGORY_TO_PARTS[selectedPart];
      if (partsToShow && partsToShow.includes(part)) {
        return "grayscale-0 opacity-100";
      }
    }
    return "";
  };

  const shouldShowHighlight = (part) => {
    // Never show highlight for "Accessories"
    if (selectedPart === "Accessories") {
      return false;
    }

    // Show highlight for all parts in the selected category
    if (selectedPart && selectedPart !== "All") {
      const partsToShow = CATEGORY_TO_PARTS[selectedPart];
      if (partsToShow && partsToShow.includes(part)) {
        return true;
      }
    }

    return false;
  };

  return (
    <div
      className="page-wrapper flex justify-center items-center min-h-1/2 bg-transparent p-2"
      data-container="page-wrapper"
      aria-label="Prosthetic leg page wrapper"
    >
      <div
        className="prosthetic-leg-main relative bg-transparent"
        data-container="prosthetic-leg-main"
        aria-label="Main prosthetic leg container"
        role="region"
        style={{
          width: `${BASE_CANVAS_WIDTH * scale}rem`,
          height: `${BASE_CANVAS_HEIGHT * scale}rem`,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <div
          ref={legRef}
          className="leg-canvas relative bg-transparent"
          style={{
            width: `${BASE_CANVAS_WIDTH}rem`,
            height: `${BASE_CANVAS_HEIGHT}rem`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Abutment Screw */}
          <div className="leg-part abutment-screw-container absolute left-[3.50rem] top-[1.5rem]">
            {shouldShowHighlight("screw") && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="98"
                height="139"
              >
                <ellipse
                  cx="49"
                  cy="75.5"
                  rx="69"
                  ry="61"
                  fill="#64c8ff"
                  fillOpacity={0.65}
                />
              </svg>
            )}
            <img
              src={abutmentScrew}
              alt="Abutment Screw"
              className={`leg-part-image relative transition-all ${fade(
                "screw"
              )} ${highlight("screw")}`}
              style={{ width: "3.60394rem", height: " 6.17075rem" }}
              draggable={false}
            />
          </div>

          {/* Socket */}
          <div className="leg-part socket-container absolute left-[5rem] top-[7.5rem]">
            {shouldShowHighlight("socket") && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.5rem] top-[-1.25rem] overflow-visible"
                width="100"
                height="142"
              >
                <ellipse
                  cx="50"
                  cy="75"
                  rx="58"
                  ry="59"
                  fill="#64c8ff"
                  fillOpacity={0.65}
                />
              </svg>
            )}
            <img
              src={Socket}
              alt="Socket"
              className={`leg-part-image relative transition-all ${fade(
                "socket"
              )} ${highlight("socket")}`}
              style={{ width: "3.11269rem", height: "6.39394rem" }}
              draggable={false}
            />
          </div>

          {/* Knee */}
          <div className="leg-part knee-container absolute left-[6rem] top-[14.05rem]">
            {shouldShowHighlight("knee") && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1rem] overflow-visible"
                width="63"
                height="42"
              >
                <ellipse
                  cx="33"
                  cy="21"
                  rx="45"
                  ry="40"
                  fill="#64c8ff"
                  fillOpacity={0.65}
                />
              </svg>
            )}
            <img
              src={Knee}
              alt="Knee"
              className={`leg-part-image relative transition-all ${fade(
                "knee"
              )} ${highlight("knee")}`}
              style={{ width: "1.45813rem", height: "0.75438rem" }}
              draggable={false}
            />
          </div>

          {/* Calf */}
          <div className="leg-part calf-container absolute left-[5.8rem] top-[15rem]">
            {shouldShowHighlight("calf") && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="140"
                height="180"
                viewBox="0 0 140 180"
              >
                <ellipse
                  cx="40.5"
                  cy="55"
                  rx="65"
                  ry="55"
                  fill="#64c8ff"
                  fillOpacity={0.7}
                />
              </svg>
            )}
            <img
              src={Calf}
              alt="Calf"
              className={`leg-part-image relative transition-all ${fade(
                "calf"
              )} ${highlight("calf")}`}
              style={{ width: "2.04694rem", height: "4.02338rem" }}
              draggable={false}
            />
          </div>

          {/* Pylon */}
          <div className="leg-part pylon-container absolute left-[6.5rem] top-[19rem]">
            {shouldShowHighlight("pylon") && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="51"
                height="91"
              >
                <ellipse
                  cx="25.5"
                  cy="58.5"
                  rx="60"
                  ry="50"
                  fill="#64c8ff"
                  fillOpacity={0.7}
                />
              </svg>
            )}
            <img
              src={Pylon}
              alt="Pylon"
              className={`leg-part-image relative transition-all ${fade(
                "pylon"
              )} ${highlight("pylon")}`}
              style={{ width: "0.6885rem", height: "3.20113rem" }}
              draggable={false}
            />
          </div>

          {/* Ankle */}
          <div className="leg-part ankle-container absolute left-[6.45rem] top-[22.25rem]">
            {shouldShowHighlight("ankle") && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="52"
                height="53"
              >
                <ellipse
                  cx="30"
                  cy="25"
                  rx="40"
                  ry="35"
                  fill="#64c8ff"
                  fillOpacity={0.65}
                />
              </svg>
            )}
            <img
              src={Ankle}
              alt="Ankle"
              className={`leg-part-image relative transition-all ${fade(
                "ankle"
              )} ${highlight("ankle")}`}
              style={{ width: "0.76731rem", height: "0.82775rem" }}
              draggable={false}
            />
          </div>

          {/* Foot */}
          <div className="leg-part foot-container absolute left-[4.5rem] top-[23.2rem]">
            {shouldShowHighlight("foot") && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="92"
                height="68"
              >
                <ellipse
                  cx="50"
                  cy="35"
                  rx="45"
                  ry="35"
                  fill="#64c8ff"
                  fillOpacity={0.65}
                />
              </svg>
            )}
            <img
              src={Foot}
              alt="Foot"
              className={`leg-part-image relative transition-all ${fade(
                "foot"
              )} ${highlight("foot")}`}
              style={{ width: "3.26869rem", height: "1.72906rem" }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProstheticLegGraphic;
