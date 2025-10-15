import { useState, useRef } from "react";

import abutmentScrew from "../../assets/leg-images/AbutmentScrew.svg";
import Socket from "../../assets/leg-images/Socket.svg";
import Knee from "../../assets/leg-images/Knee.svg";
import Calf from "../../assets/leg-images/Calf.svg";
import Pylon from "../../assets/leg-images/Pylon.svg"
import Ankle from "../../assets/leg-images/Ankle.svg"
import Foot from "../../assets/leg-images/Foot.svg";


/*
- Displays all parts of a prosthetic leg.
- Click a part → highlight it with an SVG ellipse behind it.
- Click same part → deselect.
- Click outside (from App.jsx) → all parts grayscale again.
*/

const ProstheticLegGraphic = () => {
  const [selected, setSelected] = useState(null);
  const legRef = useRef(null);


  const handleClick = (part) =>
    setSelected((prev) => (prev === part ? null : part));

  const fade = (part) =>
    selected && selected !== part ? "grayscale opacity-40" : "";
  const highlight = (part) =>
    selected === part ? "grayscale-0 opacity-100" : "";

  return (
    <div
      ref={legRef}
      onClick={(e) => e.stopPropagation()}
      className="relative w-[1400px] h-[1400px] bg-transparent"
      aria-label="Prosthetic leg graphic"
      role="region"
    >
      {/* ───────── Abutment Screw ───────── */}
      <div className="absolute left-[862px] top-[888px]">
        {selected === "screw" && (
          <svg
            className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
            width="98"
            height="139"
          >
            <ellipse
              cx="49"
              cy="69.5"
              rx="69"
              ry="55"
              fill="#64c8ff"
              stroke="#64c8ff"
              strokeWidth="0.8"
              style={{ transition: "all 0.3s ease-in-out" }}
            />
          </svg>
        )}
        <img
          src={abutmentScrew}
          alt="Abutment Screw"
          onClick={() => handleClick("screw")}
          className={`relative w-[58px] h-[99px] cursor-pointer transition-all ${fade(
            "screw"
          )} ${highlight("screw")}`}
          draggable={false}
        />
      </div>

      {/* ───────── Socket ───────── */}
      <div className="absolute left-[887px] top-[984px]">
        {selected === "socket" && (
          <svg
            className="absolute pointer-events-none left-[-25px] top-[-20px] overflow-visible"
            width="100"
            height="142"
          >
            <ellipse
              cx="50"
              cy="75"
              rx="58"
              ry="59"
              fill="#64c8ff"
              stroke="#64c8ff"
              strokeWidth="0.8"
              style={{ transition: "all 0.3s ease-in-out" }}
            />
          </svg>
        )}
        <img
          src={Socket}
          alt="Socket"
          onClick={() => handleClick("socket")}
          className={`relative w-[50px] h-[102px] cursor-pointer transition-all ${fade(
            "socket"
          )} ${highlight("socket")}`}
          draggable={false}
        />
      </div>

      {/* ───────── Knee ───────── */}
      <div className="absolute left-[900px] top-[1092px]">
        {selected === "knee" && (
          <svg
            className="absolute pointer-events-none left-[-20px] top-[-15px] overflow-visible"
            width="63"
            height="42"
          >
            <ellipse
              cx="31.5"
              cy="21"
              rx="31.5"
              ry="21"
             fill="#64c8ff"
              stroke="#64c8ff"
              strokeWidth="0.8"
              style={{ transition: "all 0.3s ease-in-out" }}
            />
          </svg>
        )}
        <img
          src={Knee}
          alt="Knee"
          onClick={() => handleClick("knee")}
          className={`relative w-[23px] h-[12px] cursor-pointer transition-all ${fade(
            "knee"
          )} ${highlight("knee")}`}
          draggable={false}
        />
      </div>

      {/* ───────── Calf ───────── */}
<div className="absolute left-[895px] top-[1106px]">
  {selected === "calf" && (
    <svg
      className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
      width="140"
      height="180"
      viewBox="0 0 140 180"
    >
      <ellipse
        cx="36.5" 
        cy="52"
        rx="40"
        ry="40"
        fill="#64c8ff"
        stroke="#64c8ff"
        strokeWidth="0.8"
        style={{ transition: "all 0.3s ease-in-out" }}
      />
    </svg>
  )}
  <img
    src={Calf}
    alt="Calf"
    onClick={() => handleClick("calf")}
    className={`relative w-[33px] h-[64px] cursor-pointer transition-all ${fade("calf")} ${highlight("calf")}`}
    draggable={false}
  />
</div>


      {/* ───────── Pylon ───────── */}
      <div className="absolute left-[907px] top-[1171px]">
        {selected === "pylon" && (
          <svg
            className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
            width="51"
            height="91"
          >
            <ellipse
              cx="25.5"
              cy="45.5"
              rx="25.5"
              ry="25.5"
              fill="rgba(100, 200, 255, 1)"
              stroke="#2563eb"
              strokeWidth="0.8"
              style={{ transition: "all 0.3s ease-in-out" }}
            />
          </svg>
        )}
        <img
          src={Pylon}
          alt="Pylon"
          onClick={() => handleClick("pylon")}
          className={`relative w-[11px] h-[51px] cursor-pointer transition-all ${fade(
            "pylon"
          )} ${highlight("pylon")}`}
          draggable={false}
        />
      </div>

      {/* ───────── Ankle ───────── */}
      <div className="absolute left-[905px] top-[1220px]">
        {selected === "ankle" && (
          <svg
            className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
            width="52"
            height="53"
          >
            <ellipse
              cx="26"
              cy="26.5"
              rx="26"
              ry="18"
              fill="rgba(100, 200, 255, 1)"
              stroke="#2563eb"
              strokeWidth="0.8"
              style={{ transition: "all 0.3s ease-in-out" }}
            />
          </svg>
        )}
        <img
          src={Ankle}
          alt="Ankle"
          onClick={() => handleClick("ankle")}
          className={`relative w-[12px] h-[13px] cursor-pointer transition-all ${fade(
            "ankle"
          )} ${highlight("ankle")}`}
          draggable={false}
        />
      </div>

      {/* ───────── Foot ───────── */}
      <div className="absolute left-[872px] top-[1233px]">
        {selected === "foot" && (
          <svg
            className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
            width="92"
            height="68"
          >
            <ellipse
              cx="46"
              cy="34"
              rx="45"
              ry="19"
              fill="rgba(100, 200, 255, 1)"
              stroke="#2563eb"
              strokeWidth="0.8"
              style={{ transition: "all 0.3s ease-in-out" }}
            />
          </svg>
        )}
        <img
          src={Foot}
          alt="Foot"
          onClick={() => handleClick("foot")}
          className={`relative w-[52px] h-[28px] cursor-pointer transition-all ${fade(
            "foot"
          )} ${highlight("foot")}`}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ProstheticLegGraphic;