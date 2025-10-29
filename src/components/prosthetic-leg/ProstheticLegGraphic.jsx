import { useState, useRef, useEffect } from "react";

import abutmentScrew from "../../assets/leg-images/AbutmentScrew.svg";
import Socket from "../../assets/leg-images/Socket.svg";
import Knee from "../../assets/leg-images/Knee.svg";
import Calf from "../../assets/leg-images/Calf.svg";
import Pylon from "../../assets/leg-images/Pylon.svg"
import Ankle from "../../assets/leg-images/Ankle.svg"
import Foot from "../../assets/leg-images/Foot.svg";


/*
- Global expand on hover (desktop) via group-hover, and lock on click (expanded=true).
- Click a part -> select it (blue halo + part stays in color, others grey).
- Click the same part -> deselect (labels remain tied to expand state).
- Click outside -> deselect, all grey, collapse.
*/

/*
- Responsive shell scales the 1400x1400 canvas:
  sm ≈ 0.37x, md ≈ 0.6x, lg ≈ 0.79x, xl = 1x
- Hover expand (desktop) and click to lock expand.
- Each part positioned absolutely within the canvas.
- Each part has its own hover and click handlers to manage selection and highlighting.
- Labels appear next to parts when selected or on hover (desktop).
*/

const ProstheticLegGraphic = () => {
  const [selected, setSelected] = useState(null);
  const [allGrey, setAllGrey] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const onDocDown = (e) => {
      const el = wrapperRef.current;
      if (el && !el.contains(e.target)) {
        setSelected(null);
        setAllGrey(true);
        setExpanded(false);
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
    setExpanded(true);
    setSelected((prev) => (prev === part ? null : part));
  };

  const fade = (part) =>
    allGrey || (selected && selected !== part) ? "grayscale opacity-40" : "";

  const highlight = (part) =>
    !allGrey && selected === part ? "grayscale-0 opacity-100" : "";

const labelBase =
  "pointer-events-none px-2 py-0.5 rounded-md font-normal text-slate-800 bg-white/80 border border-slate-300 shadow-sm transition-all duration-300 " +
  "text-[10px] sm:text-xs md:text-sm lg:text-base";

  return (
    <div
      ref={wrapperRef}
      className={[
        "relative mx-auto aspect-square",
        // Width steps by common devices and breakpoints
        "w-[300px]",               // tiny phones
        "min-[375px]:w-[320px]",   // iPhone mini / small Android
        "min-[430px]:w-[400px]",   // big phones (Pro Max / Pixel XL)
        "sm:w-[520px]",            // ≥640
        "md:w-[720px]",            // ≥768
        "lg:w-[980px]",            // ≥1024
        "xl:w-[1200px]",           // ≥1280
        "2xl:w-[1400px]",          // ≥1536
        "portrait:max-w-[92vw] landscape:max-w-[88vw]",
      ].join(" ")}
      aria-label="Prosthetic leg graphic"
      role="region"
      onClick={(e) => {
        if (e.target === e.currentTarget) setExpanded((v) => !v);
      }}
    >
      {/* Scaled 1400x1400 canvas */}
      <div
        className={[
          "group absolute top-0 left-0 w-[1400px] h-[1400px] bg-transparent",
          "origin-top-left transform-gpu",
          "[transform:scale(0.215)]",
          "min-[375px]:[transform:scale(0.23)]",
          "min-[430px]:[transform:scale(0.285)]",
          "sm:[transform:scale(0.37)]",
          "md:[transform:scale(0.51)]",
          "lg:[transform:scale(0.7)]",
          "xl:[transform:scale(0.86)]",
          "2xl:[transform:scale(1)]",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ───────── Abutment Screw ───────── */}
        <div
          className={[
            "absolute left-[862px] top-[888px]",
            "transition-transform duration-500 ease-out",
            "md:group-hover:translate-x-[2px] md:group-hover:-translate-y-[16px]",
            expanded ? "translate-x-[2px] -translate-y-[16px]" : "",
          ].join(" ")}
        >
          {selected === "screw" && !allGrey && (
            <svg
              className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
              width="98"
              height="139"
            >
              <ellipse cx="49" cy="69.5" rx="69" ry="55" fill="#64c8ff" fillOpacity={0.65} />
            </svg>
          )}
          <div
            className={[
              "absolute top-1/2 -translate-y-1/5 -left-39",
              labelBase,
              expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              "md:group-hover:opacity-100 md:group-hover:translate-x-0",
            ].join(" ")}
          >
            Abutment Screw
          </div>
          <img
            src={abutmentScrew}
            alt="Abutment Screw"
            onClick={() => handleClick("screw")}
            className={`relative w-[58px] h-[99px] cursor-pointer transition-all ${fade("screw")} ${highlight("screw")}`}
            draggable={false}
          />
        </div>

        {/* ───────── Socket ───────── */}
        <div
          className={[
            "absolute left-[887px] top-[984px]",
            "transition-transform duration-500 ease-out",
            "md:group-hover:translate-x-[-1px] md:group-hover:-translate-y-[10px]",
            expanded ? "translate-x-[-1px] -translate-y-[10px]" : "",
          ].join(" ")}
        >
          {selected === "socket" && !allGrey && (
            <svg
              className="absolute pointer-events-none left-[-25px] top-[-20px] overflow-visible"
              width="100"
              height="142"
            >
              <ellipse cx="50" cy="75" rx="58" ry="59" fill="#64c8ff" fillOpacity={0.65} />
            </svg>
          )}
          <div
            className={[
              "absolute top-1/2 -translate-y-1/2 -left-20",
              labelBase,
              "shadow-lg bg-white",
              expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              "md:group-hover:opacity-100 md:group-hover:translate-x-0",
            ].join(" ")}
          >
            Socket
          </div>
          <img
            src={Socket}
            alt="Socket"
            onClick={() => handleClick("socket")}
            className={`relative w-[50px] h-[102px] cursor-pointer transition-all ${fade("socket")} ${highlight("socket")}`}
            draggable={false}
          />
        </div>

        {/* ───────── Knee ───────── */}
        <div
          className={[
            "absolute left-[900px] top-[1092px]",
            "transition-transform duration-500 ease-out",
            "md:group-hover:-translate-y-[8px]",
            expanded ? "translate-x-[4px] -translate-y-[8px]" : "",
          ].join(" ")}
        >
          {selected === "knee" && !allGrey && (
            <svg
              className="absolute pointer-events-none left-[-20px] top-[-15px] overflow-visible"
              width="63"
              height="42"
            >
              <ellipse cx="31.5" cy="21" rx="35" ry="30" fill="#64c8ff" fillOpacity={0.65} />
            </svg>
          )}
          <div
            className={[
              "absolute top-1/2 -translate-y-1/2 -left-18",
              labelBase,
              expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              "md:group-hover:opacity-100 md:group-hover:translate-x-0",
            ].join(" ")}
          >
            Knee
          </div>
          <img
            src={Knee}
            alt="Knee"
            onClick={() => handleClick("knee")}
            className={`relative w-[23px] h-[12px] cursor-pointer transition-all ${fade("knee")} ${highlight("knee")}`}
            draggable={false}
          />
        </div>

        {/* ───────── Calf ───────── */}
        <div
          className={[
            "absolute left-[895px] top-[1106px]",
            "transition-transform duration-500 ease-out",
            "md:group-hover:translate-x-[2px] md:group-hover:-translate-y-[2px]",
            expanded ? "translate-x-[5px] -translate-y-[5px]" : "",
          ].join(" ")}
        >
          {selected === "calf" && !allGrey && (
            <svg
              className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
              width="140"
              height="180"
              viewBox="0 0 140 180"
            >
              <ellipse cx="36.5" cy="52" rx="50" ry="48" fill="#64c8ff" fillOpacity={0.65} />
            </svg>
          )}
          <div
            className={[
              "absolute top-1/2 -translate-y-1/2 -left-15",
              labelBase,
              expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              "md:group-hover:opacity-100 md:group-hover:translate-x-0",
            ].join(" ")}
          >
            Calf
          </div>
          <img
            src={Calf}
            alt="Calf"
            onClick={() => handleClick("calf")}
            className={`relative w-[33px] h-[64px] cursor-pointer transition-all ${fade("calf")} ${highlight("calf")}`}
            draggable={false}
          />
        </div>

        {/* ───────── Pylon ───────── */}
        <div
          className={[
            "absolute left-[907px] top-[1171px]",
            "transition-transform duration-500 ease-out",
            "md:group-hover:translate-x-[4px] md:group-hover:translate-y-[2px]",
            expanded ? "translate-x-[4px] translate-y-[2px]" : "",
          ].join(" ")}
        >
          {selected === "pylon" && !allGrey && (
            <svg
              className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
              width="51"
              height="91"
            >
              <ellipse cx="25.5" cy="45.5" rx="40" ry="38" fill="#64c8ff" fillOpacity={0.65} />
            </svg>
          )}
          <div
            className={[
              "absolute top-1/2 -translate-y-1/2 -left-20",
              labelBase,
              expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              "md:group-hover:opacity-100 md:group-hover:translate-x-0",
            ].join(" ")}
          >
            Pylon
          </div>
          <img
            src={Pylon}
            alt="Pylon"
            onClick={() => handleClick("pylon")}
            className={`relative w-[11px] h-[51px] cursor-pointer transition-all ${fade("pylon")} ${highlight("pylon")}`}
            draggable={false}
          />
        </div>

        {/* ───────── Ankle ───────── */}
        <div
          className={[
            "absolute left-[906px] top-[1220px]",
            "transition-transform duration-500 ease-out",
            "md:group-hover:translate-x-[4px] md:group-hover:translate-y-[10px]",
            expanded ? "translate-x-[4px] translate-y-[10px]" : "",
          ].join(" ")}
        >
          {selected === "ankle" && !allGrey && (
            <svg
              className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
              width="52"
              height="53"
            >
              <ellipse cx="26" cy="26.5" rx="30" ry="30" fill="#64c8ff" fillOpacity={0.65} />
            </svg>
          )}
          <div
            className={[
              "absolute top-1/3 -translate-y-1/2 -left-[80px]",
              labelBase,
              expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              "md:group-hover:opacity-100 md:group-hover:translate-x-0",
            ].join(" ")}
          >
            Ankle
          </div>
          <img
            src={Ankle}
            alt="Ankle"
            onClick={() => handleClick("ankle")}
            className={`relative w-[12px] h-[13px] cursor-pointer transition-all ${fade("ankle")} ${highlight("ankle")}`}
            draggable={false}
          />
        </div>

        {/* ───────── Foot ───────── */}
        <div
          className={[
            "absolute left-[872px] top-[1235px]",
            "transition-transform duration-500 ease-out",
            "md:group-hover:translate-x-[5px] md:group-hover:translate-y-[15px]",
            expanded ? "translate-x-[5px] translate-y-[15px]" : "",
          ].join(" ")}
        >
          {selected === "foot" && !allGrey && (
            <svg
              className="absolute pointer-events-none left-[-20px] top-[-20px] overflow-visible"
              width="92"
              height="68"
            >
              <ellipse cx="46" cy="35" rx="45" ry="38" fill="#64c8ff" fillOpacity={0.65} />
            </svg>
          )}
          <div
            className={[
              "absolute top-1/2 -translate-y-1 -left-15",
              labelBase,
              expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
              "md:group-hover:opacity-100 md:group-hover:translate-x-0",
            ].join(" ")}
          >
            Foot
          </div>
          <img
            src={Foot}
            alt="Foot"
            onClick={() => handleClick("foot")}
            className={`relative w-[52px] h-[28px] cursor-pointer transition-all ${fade("foot")} ${highlight("foot")}`}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ProstheticLegGraphic;