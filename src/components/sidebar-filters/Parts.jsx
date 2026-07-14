import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const PARTS_OPTIONS = [
  "All",
  "Liners",
  "Adapters",
  "Knees/Hips",
  "Pylons",
  "Feet",
  "Accessories",
];

const itemClass =
  "h-auto w-fit cursor-pointer rounded-3xl border border-transparent px-4 py-1.5 text-base font-normal text-[#4A4A4A] transition-all duration-200 hover:bg-transparent hover:text-[#4A4A4A] aria-pressed:border-[#64C8FF] aria-pressed:bg-[#D9F1FF] aria-pressed:font-semibold aria-pressed:text-[#4A4A4A]";

const Parts = ({ description, setDescription }) => {
  return (
    <div className="filter-section">
      <ToggleGroup
        orientation="vertical"
        value={description ? [description] : []}
        onValueChange={(value) => {
          if (value.length) setDescription(value[value.length - 1]);
        }}
        className="w-full gap-3 data-vertical:items-center"
      >
        {PARTS_OPTIONS.map((option) => (
          <ToggleGroupItem key={option} value={option} className={itemClass}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default Parts;
