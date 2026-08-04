import { useContext } from "react";
import PentaContext from "../../context/PentaContext";
import { Slider } from "@/components/ui/slider";
import Stepper from "../ui/Stepper";

// SizeSlider component for selecting size range using sliders and inputs.

const Size = () => {
  const {
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    largestSize,
  } = useContext(PentaContext);

  return (
    <div className="filter-section flex flex-col gap-4">
      <label className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Device size</label>

      <div className="flex items-center gap-3">
        <Stepper
          label="Min"
          value={minValue}
          min={1}
          max={maxValue}
          onValueChange={setMinValue}
          onDecrement={() => {
            if (minValue > 1) setMinValue(minValue - 1);
          }}
          onIncrement={() => {
            if (minValue < maxValue) setMinValue(minValue + 1);
          }}
          canDecrement={minValue > 1}
          canIncrement={minValue < maxValue}
        />

        <Stepper
          label="Max"
          value={maxValue}
          min={minValue}
          max={largestSize}
          onValueChange={setMaxValue}
          onDecrement={() => {
            if (maxValue > minValue) setMaxValue(maxValue - 1);
          }}
          onIncrement={() => {
            if (maxValue < largestSize) setMaxValue(maxValue + 1);
          }}
          canDecrement={maxValue > minValue}
          canIncrement={maxValue < largestSize}
        />
      </div>

      {/* Size Range Slider */}
      <div className="px-1">
        <Slider
          min={1}
          max={largestSize}
          step={1}
          value={[minValue, maxValue]}
          onValueChange={([newMin, newMax]) => {
            setMinValue(newMin);
            setMaxValue(newMax);
          }}
        />
      </div>
    </div>
  );
};

export default Size;