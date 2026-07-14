import AbutmentScrew from "../../assets/leg-images/AbutmentScrew.svg";
import Socket from "../../assets/leg-images/Socket.svg";
import Knee from "../../assets/leg-images/Knee.svg";
import Calf from "../../assets/leg-images/Calf.svg";
import Pylon from "../../assets/leg-images/Pylon.svg";
import Ankle from "../../assets/leg-images/Ankle.svg";
import Foot from "../../assets/leg-images/Foot.svg";

// Parts rendered top-to-bottom to compose a lower-extremity prosthetic leg.
// `width` is the SVG's intrinsic width; heights follow automatically so each
// part stays proportional. `offsetX` (intrinsic px, optional) nudges a part
// horizontally when its visual attachment point isn't at its bounding-box
// center. Tune SCALE to resize the whole diagram.
const SCALE = 0.75;
// Diameter (before SCALE) of the glow shown behind a specifically-selected part.
const GLOW_BASE = 95;
// Height-to-width ratio of the glow; < 1 squishes it into a wide ellipse so it
// emphasizes a specific horizontal region rather than a general circular area.
// A part may override this with `glowAspect` when it's taller/shorter than most.
const GLOW_ASPECT = 0.8;
const PARTS = [
  {
    key: "AbutmentScrew",
    src: AbutmentScrew,
    label: "Abutment screw",
    width: 58,
    glowAspect: 1.3,
  },
  { key: "Socket", src: Socket, label: "Socket", width: 50 },
  { key: "Knee", src: Knee, label: "Knee", width: 24, glowAspect: 0.6 },
  { key: "Calf", src: Calf, label: "Calf", width: 33 },
  { key: "Pylon", src: Pylon, label: "Pylon", width: 12 },
  { key: "Ankle", src: Ankle, label: "Ankle", width: 13, glowAspect: 0.6 },
  { key: "Foot", src: Foot, label: "Foot", width: 53, offsetX: -13 },
];

// Maps the selected Parts filter to the leg part(s) shown in full color. Any
// part not listed for the current selection is rendered grayscale + dimmed.
// "All" (and no selection) colors everything; "Accessories" grays everything.
const HIGHLIGHT_BY_PART = {
  Liners: ["AbutmentScrew"],
  Adapters: ["Knee", "Ankle"],
  "Knees/Hips": ["Calf"],
  Pylons: ["Pylon"],
  Feet: ["Foot"],
  Accessories: [],
};

// Reverse of HIGHLIGHT_BY_PART: clicking a leg part selects its Parts filter.
// Socket has no corresponding Parts option, so it isn't clickable.
const PART_TO_FILTER = {
  AbutmentScrew: "Liners",
  Knee: "Adapters",
  Ankle: "Adapters",
  Calf: "Knees/Hips",
  Pylon: "Pylons",
  Foot: "Feet",
};

const LegDiagram = ({ description, setDescription }) => {
  const colored =
    !description || description === "All"
      ? new Set(PARTS.map((p) => p.key))
      : new Set(HIGHLIGHT_BY_PART[description] ?? []);

  // A specific part filter (not "All") emphasizes its part(s) with a glow.
  const isSpecific = Boolean(description) && description !== "All";

  const highlightLabel =
    description && description !== "All" ? `, highlighting ${description}` : "";

  return (
    <div
      className="flex flex-1 flex-col items-center gap-1"
      role="group"
      aria-label={`Lower extremity prosthetic diagram${highlightLabel}`}
    >
      {PARTS.map(({ key, src, label, width, offsetX, glowAspect }) => {
        const isColored = colored.has(key);
        const showGlow = isSpecific && isColored;
        const filter = PART_TO_FILTER[key];
        const clickable = Boolean(filter) && typeof setDescription === "function";

        const image = (
          <img
            src={src}
            alt={label}
            draggable={false}
            className={`relative block w-full transition-all duration-200 ${
              isColored ? "" : "grayscale opacity-40"
            }`}
          />
        );

        return (
          <div
            key={key}
            className="relative flex items-center justify-center"
            style={{
              width: width * SCALE,
              ...(offsetX
                ? { transform: `translateX(${offsetX * SCALE}px)` }
                : {}),
            }}
          >
            {showGlow && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: GLOW_BASE * SCALE,
                  height: GLOW_BASE * SCALE * (glowAspect ?? GLOW_ASPECT),
                  backgroundColor: "rgba(100,200,255,0.55)",
                }}
              />
            )}
            {clickable ? (
              <button
                type="button"
                onClick={() => setDescription(filter)}
                aria-label={`Select ${filter}`}
                aria-pressed={showGlow}
                className="relative block w-full cursor-pointer appearance-none border-0 bg-transparent p-0 transition-transform hover:scale-105"
              >
                {image}
                {/* Invisible, widened hit target so narrow parts (knee, ankle)
                    are easy to click. Only widens horizontally (no vertical
                    growth) so stacked parts' hitboxes don't overlap. */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-full w-full min-w-[44px] -translate-x-1/2 -translate-y-1/2"
                />
              </button>
            ) : (
              image
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LegDiagram;
