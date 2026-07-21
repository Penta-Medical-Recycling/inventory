import { useEffect, useContext, useState } from "react";
import { X } from "lucide-react";
import PentaContext from "../context/PentaContext";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";
import AssistiveDevice from "./sidebar-filters/AssistiveDevice";
import Extremity from "./sidebar-filters/Extremity";
import Parts from "./sidebar-filters/Parts";
import LegDiagram from "./sidebar-filters/LegDiagram";
import Pediatric from "./sidebar-filters/Pediatric";
import Description from "./sidebar-filters/Description";
import Manufacturer from "./sidebar-filters/Manufacturer";
import Size from "./sidebar-filters/Size";
import ResetFilters from "./sidebar-filters/ResetFilters";

const SideBar = () => {
  const {
    setIsSideBarActive,
    isSideBarActive,
    fetchMaxSize,
    setLargestSize,
    setMinValue,
    setMaxValue,
    largestSize,
    setSelectedManufacturer,
    setSelectedSKU,
    setSelectedDescriptions,
    setSelectedFilters,
    selectedPart,
    setSelectedPart,
    extremity,
    setExtremity,
  } = useContext(PentaContext);

  const [assistiveDevice, setAssistiveDevice] = useState("All");
  const [pediatric, setPediatric] = useState(false);

  // Fetch max size once
  useEffect(() => {
    const fetchMax = async () => {
      const max = await fetchMaxSize();
      setLargestSize(max);
      setMaxValue(max);
    };
    fetchMax();
    // Only run on mount. `fetchMaxSize` is recreated every render, so including
    // it here would re-run this effect and reset `maxValue` on every render,
    // fighting the size slider's user-selected max.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The Parts filter (and leg diagram) is only shown for the Lower extremity.
  // Default its selection to "All" on entering Lower, and clear it otherwise.
  useEffect(() => {
    setSelectedPart(extremity === "Lower" ? "All" : "");
  }, [extremity, setSelectedPart]);

  // Sync the Assistive Device selection to the Tag filter. "All"/none clears it.
  useEffect(() => {
    setSelectedFilters((prev) => ({
      ...prev,
      Prosthesis: assistiveDevice === "Prosthesis",
      Orthosis: assistiveDevice === "Orthosis",
    }));
  }, [assistiveDevice, setSelectedFilters]);

  // Sync the Pediatric toggle to the Tag filter.
  useEffect(() => {
    setSelectedFilters((prev) =>
      prev.Pediatric === pediatric ? prev : { ...prev, Pediatric: pediatric }
    );
  }, [pediatric, setSelectedFilters]);

  // Reset all filters
  const removeAllFilters = () => {
    setSelectedManufacturer([]);
    setSelectedSKU([]);
    setSelectedDescriptions([]);
    setMinValue(1);
    setMaxValue(largestSize);
    setSelectedFilters({
      Prosthesis: false,
      Orthosis: false,
      Pediatric: false,
    });
    setAssistiveDevice("All");
    setExtremity("All");
    setSelectedPart("");
    setPediatric(false);
  };

  return (
    <Drawer
      open={isSideBarActive}
      onOpenChange={setIsSideBarActive}
      swipeDirection="left"
    >
      <DrawerContent className="w-[min(550px,92vw)] rounded-l-none border-white/40 bg-white/85 backdrop-blur-xl sm:w-[550px]">
        <DrawerHeader className="relative flex flex-row items-center justify-center">
          <DrawerTitle className="text-center text-lg">
            Filters
          </DrawerTitle>
          <DrawerClose
            aria-label="Close filters"
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-2 transition-transform hover:scale-110"
          >
            <X className="h-5 w-5 text-[#4A4A4A]" />
          </DrawerClose>
        </DrawerHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-7 px-5 pb-8">
            <AssistiveDevice
              assistiveDevice={assistiveDevice}
              setAssistiveDevice={setAssistiveDevice}
            />

            {assistiveDevice && (
              <Extremity extremity={extremity} setExtremity={setExtremity} />
            )}

            {extremity && (
              <>
                {extremity === "Lower" && (
                  <div className="flex items-center gap-2">
                    <div className="w-2/5 shrink-0">
                      <Parts
                        description={selectedPart}
                        setDescription={setSelectedPart}
                      />
                    </div>
                    <LegDiagram
                      description={selectedPart}
                      setDescription={setSelectedPart}
                    />
                  </div>
                )}
                <Description />
                <Manufacturer />
                <Pediatric pediatric={pediatric} setPediatric={setPediatric} />
                <Size />
              </>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-black/5 pt-4">
          <ResetFilters removeAllFilters={removeAllFilters} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SideBar;
