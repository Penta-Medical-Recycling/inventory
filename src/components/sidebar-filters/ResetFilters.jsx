import React from "react";
import { Button } from "@/components/ui/button";

const ResetFilters = ({ removeAllFilters }) => {
  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        size="lg"
        className="rounded-full"
        onClick={removeAllFilters}
        aria-label="FilterReset"
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default ResetFilters;