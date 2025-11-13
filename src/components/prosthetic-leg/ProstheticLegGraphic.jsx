import { useState, useRef, useEffect } from "react";

import abutmentScrew from "../../assets/leg-images/AbutmentScrew.svg";
import Socket from "../../assets/leg-images/Socket.svg";
import Knee from "../../assets/leg-images/Knee.svg";
import Calf from "../../assets/leg-images/Calf.svg";
import Pylon from "../../assets/leg-images/Pylon.svg"
import Ankle from "../../assets/leg-images/Ankle.svg"
import Foot from "../../assets/leg-images/Foot.svg";

const BASE_CANVAS_WIDTH = 12.5; // 200px ÷ 16 = 12.5rem
const BASE_CANVAS_HEIGHT = 25.75; // 412px ÷ 16 = 25.75rem

const ProstheticLegGraphic = ({ scale = 0.50 }) => {
  const [selected, setSelected] = useState(null);
  const [allGrey, setAllGrey] = useState(false);
  const legRef = useRef(null);

  // Outside click => deselect + all grey
  useEffect(() => {
    const onDocDown = (e) => {
      const el = legRef.current;
      if (el && !el.contains(e.target)) {
        setSelected(null);
        setAllGrey(true);
      }
    };
    document.addEventListener("mousedown", onDocDown, true);
    document.addEventListener("touchstart", onDocDown, true);
    return () => {
      document.removeEventListener("mousedown", onDocDown, true);
      document.removeEventListener("touchstart", onDocDown, true);
    };
  }, []);

  const handleClick = (part) => {
    setAllGrey(false);
    setSelected((prev) => (prev === part ? null : part));
  };

  const fade = (part) =>
    allGrey || (selected && selected !== part) ? "grayscale opacity-40" : "";

  const highlight = (part) =>
    !allGrey && selected === part ? "grayscale-0 opacity-100" : "";

  return (
    // PAGE WRAPPER - centers the prosthetic leg on the page
    <div 
      className="page-wrapper flex justify-center items-center min-h-1/2 bg-gray-100 p-2"
      data-container="page-wrapper"
      aria-label="Prosthetic leg page wrapper"
    >
      {/* MAIN PROSTHETIC LEG CONTAINER - scaled wrapper */}
      <div
        className="prosthetic-leg-main relative bg-white "
        data-container="prosthetic-leg-main"
        aria-label="Main prosthetic leg container"
        role="region"
        style={{
          width: `${BASE_CANVAS_WIDTH * scale}rem`,
          height: `${BASE_CANVAS_HEIGHT * scale}rem`,
          maxWidth: '100%',
          maxHeight: '90vh',
          overflow: "hidden",
        }}
      >
        {/* Inner canvas keeps the big coordinate space and is visually scaled */}
        <div
          ref={legRef}
          onClick={(e) => e.stopPropagation()}
          className="leg-canvas relative bg-transparent"
          style={{
            width: `${BASE_CANVAS_WIDTH}rem`,
            height: `${BASE_CANVAS_HEIGHT}rem`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* ───────── Abutment Screw ───────── */}
          <div className="leg-part abutment-screw-container absolute left-[3.50rem] top-[1.5rem]">
            {selected === "screw" && !allGrey && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="98"
                height="139"
              >
                <ellipse cx="49" cy="69.5" rx="69" ry="55" fill="#64c8ff" fillOpacity={0.65} />
              </svg>
            )}
            <img
              src={abutmentScrew}
              alt="Abutment Screw"
              onClick={() => handleClick("screw")}
              className={`leg-part-image relative cursor-pointer transition-all ${fade("screw")} ${highlight("screw")}`}
              style={{ width: '3.60394rem', height: ' 6.17075rem' }}
              draggable={false}
            />
          </div>

          {/* ───────── Socket ───────── */}
          <div className="leg-part socket-container absolute left-[5rem] top-[7.5rem]">
            {selected === "socket" && !allGrey && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.5rem] top-[-1.25rem] overflow-visible"
                width="100"
                height="142"
              >
                <ellipse cx="50" cy="75" rx="58" ry="59" fill="#64c8ff" fillOpacity={0.65} />
              </svg>
            )}
            <img
              src={Socket}
              alt="Socket"
              onClick={() => handleClick("socket")}
              className={`leg-part-image relative cursor-pointer transition-all ${fade("socket")} ${highlight("socket")}`}
              style={{ width: '3.11269rem', height: '6.39394rem' }}
              draggable={false}
            />
          </div>

          {/* ───────── Knee ───────── */}
          <div className="leg-part knee-container absolute left-[6rem] top-[14.05rem]">
            {selected === "knee" && !allGrey && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1rem] overflow-visible"
                width="63"
                height="42"
              >
                <ellipse cx="31.5" cy="21" rx="35" ry="30" fill="#64c8ff" fillOpacity={0.65} />
              </svg>
            )}
            <img
              src={Knee}
              alt="Knee"
              onClick={() => handleClick("knee")}
              className={`leg-part-image relative cursor-pointer transition-all ${fade("knee")} ${highlight("knee")} pointer-events-auto`}
              style={{ width: '1.45813rem', height: '0.75438rem' }}
              draggable={false}
            />
          </div>

          {/* ───────── Calf ───────── */}
          <div className="leg-part calf-container absolute left-[5.8rem] top-[15rem]">
            {selected === "calf" && !allGrey && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="140"
                height="180"
                viewBox="0 0 140 180"
              >
                <ellipse cx="36.5" cy="52" rx="50" ry="48" fill="#64c8ff" fillOpacity={0.65} />
              </svg>
            )}
            <img
              src={Calf}
              alt="Calf"
              onClick={() => handleClick("calf")}
              className={`leg-part-image relative cursor-pointer transition-all ${fade("calf")} ${highlight("calf")}`}
              style={{ width: '2.04694rem', height: '4.02338rem' }}
              draggable={false}
            />
          </div>

          {/* ───────── Pylon ───────── */}
          <div className="leg-part pylon-container absolute left-[6.5rem] top-[19rem]">
            {selected === "pylon" && !allGrey && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="51"
                height="91"
              >
                <ellipse cx="25.5" cy="45.5" rx="40" ry="38" fill="#64c8ff" fillOpacity={0.65} />
              </svg>
            )}
            <img
              src={Pylon}
              alt="Pylon"
              onClick={() => handleClick("pylon")}
              className={`leg-part-image relative cursor-pointer transition-all ${fade("pylon")} ${highlight("pylon")}`}
              style={{ width: '0.6885rem', height: '3.20113rem' }}
              draggable={false}
            />
          </div>

          {/* ───────── Ankle ───────── */}
          <div className="leg-part ankle-container absolute left-[6.45rem] top-[22.25rem]">
            {selected === "ankle" && !allGrey && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="52"
                height="53"
              >
                <ellipse cx="26" cy="26.5" rx="30" ry="30" fill="#64c8ff" fillOpacity={0.65} />
              </svg>
            )}
            <img
              src={Ankle}
              alt="Ankle"
              onClick={() => handleClick("ankle")}
              className={`leg-part-image relative cursor-pointer transition-all ${fade("ankle")} ${highlight("ankle")}`}
              style={{ width: '0.76731rem', height: '0.82775rem' }}
              draggable={false}
            />
          </div>

          {/* ───────── Foot ───────── */}
          <div className="leg-part foot-container absolute left-[4.5rem] top-[23.2rem]">
            {selected === "foot" && !allGrey && (
              <svg
                className="highlight-overlay absolute pointer-events-none left-[-1.25rem] top-[-1.25rem] overflow-visible"
                width="92"
                height="68"
              >
                <ellipse cx="46" cy="35" rx="45" ry="38" fill="#64c8ff" fillOpacity={0.65} />
              </svg>
            )}
            <img
              src={Foot}
              alt="Foot"
              onClick={() => handleClick("foot")}
              className={`leg-part-image relative cursor-pointer transition-all ${fade("foot")} ${highlight("foot")}`}
              style={{ width: '3.26869rem', height: '1.72906rem' }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProstheticLegGraphic;