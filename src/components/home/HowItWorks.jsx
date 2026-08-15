import { HelpCircle, ShoppingCart, ClipboardList, PackageCheck } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// Steps describing the general flow of submitting an inventory request.
const STEPS = [
  {
    icon: ShoppingCart,
    title: "Add items to your cart",
    description: "Click 'Add to Cart' on any item's card.",
  },
  {
    icon: ClipboardList,
    title: "Open your cart",
    description: "Use the cart icon in the top-right corner.",
  },
  {
    icon: PackageCheck,
    title: "Request items",
    description: "Select your partner affiliation, then click 'Request Items.'",
  },
];

// A subtle, on-demand explanation of how to use the system. Keeps the home
// page clean while still guiding first-time users through the request flow.
const HowItWorks = () => {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="How it works"
        className="how-it-works-trigger inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#4b5563] shadow-xs transition-colors hover:bg-[#f7fafc] hover:text-[#1679ad] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35b0fb] data-[popup-open]:border-[#64C8FF] data-[popup-open]:bg-[#D9F1FF] data-[popup-open]:text-[#1a9fe0]"
      >
        <HelpCircle className="how-it-works-icon shrink-0" aria-hidden="true" />
        <span className="how-it-works-label">How it works</span>
      </PopoverTrigger>
      <PopoverContent
        className="how-it-works-content w-[min(24rem,calc(100vw-2rem))]"
        positionerClassName="how-it-works-positioner"
        align="end"
      >
        <p className="mb-3 text-base font-semibold text-[#1f2937]">
          Submitting a request
        </p>
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#D9F1FF] text-[#1a9fe0]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2937]">
                    {index + 1}. {step.title}
                  </p>
                  <p className="text-sm leading-snug text-[#6b7280]">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 border-t border-[#F3F4F6] pt-3">
          <p className="mb-1 text-base font-semibold text-[#1f2937]">
            Exporting
          </p>
          <p className="text-sm leading-snug text-[#6b7280]">
            Export this page as CSV or Excel with the download button next to
            the search bar.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HowItWorks;
