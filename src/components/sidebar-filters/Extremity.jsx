import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const itemClass =
  "h-auto flex-1 cursor-pointer rounded-3xl border border-transparent px-4 py-1.5 text-base font-normal text-[#4A4A4A] transition-all hover:bg-transparent hover:text-[#4A4A4A] aria-pressed:border-[#64C8FF] aria-pressed:bg-[#D9F1FF] aria-pressed:font-semibold aria-pressed:text-[#4A4A4A]";

const EXTREMITY_OPTIONS = ["All", "Lower", "Upper"];

const Extremity = ({ extremity, setExtremity }) => {
  return (
    <div className="filter-section flex flex-col gap-2">
      <label className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Extremity</label>
      <ToggleGroup
        value={extremity ? [extremity] : []}
        onValueChange={(value) => {
          if (value.length) setExtremity(value[value.length - 1]);
        }}
        className="w-full gap-0 overflow-hidden rounded-3xl border"
      >
        {EXTREMITY_OPTIONS.map((option) => (
          <ToggleGroupItem key={option} value={option} className={itemClass}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default Extremity;