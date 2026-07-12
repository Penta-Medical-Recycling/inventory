import React from "react";

import { Switch } from "@/components/ui/switch";

const Pediatric = ({ pediatric, setPediatric }) => {
  return (
    <div className="filter-section flex flex-col gap-2">
      <label className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Patient Type</label>

      <div
        role="switch"
        aria-checked={pediatric}
        tabIndex={0}
        onClick={() => setPediatric(!pediatric)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPediatric(!pediatric);
          }
        }}
        className={`flex cursor-pointer items-center justify-between rounded-3xl border px-4 py-2.5 transition-all ${
          pediatric
            ? "border-[#64C8FF] bg-[#D9F1FF]"
            : "border-[#E5E7EB] bg-transparent"
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`text-base text-[#4A4A4A] transition-all ${
              pediatric ? "font-semibold" : "font-normal"
            }`}
          >
            Pediatric
          </span>
          <span className="text-xs text-[#8A8A8A]">
            Show pediatric-sized products
          </span>
        </div>

        <Switch
          checked={pediatric}
          onCheckedChange={setPediatric}
          tabIndex={-1}
          className="pointer-events-none"
        />
      </div>
    </div>
  );
};

export default Pediatric;
