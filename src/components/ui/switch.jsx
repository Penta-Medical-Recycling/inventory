import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all outline-none hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-[#64C8FF] data-[unchecked]:bg-gray-300 data-[checked]:hover:bg-[#45b8f5] data-[unchecked]:hover:bg-gray-400",
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-6 rounded-full bg-white shadow-md ring-0 transition-transform data-[checked]:translate-x-7 data-[unchecked]:translate-x-1"
        )} />
    </SwitchPrimitive.Root>
  );
}

export { Switch }
