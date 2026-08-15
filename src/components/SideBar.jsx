import { useEffect, useContext } from "react";
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
    setMaxValue,
    selectedFilter,
    setSelectedFilters,
    selectedPart,
    setSelectedPart,
    extremity,
    setExtremity,
    clearFilters,
  } = useContext(PentaContext);

  const assistiveDevice = selectedFilter.Prosthesis
    ? "Prosthesis"
    : selectedFilter.Orthosis
      ? "Orthosis"
      : "All";
  const setAssistiveDevice = (value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      Prosthesis: value === "Prosthesis",
      Orthosis: value === "Orthosis",
    }));
  };
  const pediatric = selectedFilter.Pediatric;
  const setPediatric = (value) => {
    setSelectedFilters((prev) => ({ ...prev, Pediatric: value }));
  };

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

  // Orthosis items aren't split by extremity, so the Extremity filter is hidden
  // and treated as a no-op. Force it back to "All" so any prior Upper/Lower
  // selection stops filtering while Orthosis is active.
  useEffect(() => {
    if (assistiveDevice === "Orthosis") setExtremity("All");
  }, [assistiveDevice, setExtremity]);

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
            className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full p-0 transition-all hover:scale-110 hover:bg-[#F3F4F6]"
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

            {assistiveDevice && assistiveDevice !== "Orthosis" && (
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
          <ResetFilters removeAllFilters={clearFilters} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SideBar;
