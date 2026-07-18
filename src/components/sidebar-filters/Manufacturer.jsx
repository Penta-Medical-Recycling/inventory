import { useState, useEffect, useContext } from "react";
import PentaContext from "../../context/PentaContext";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

const Manufacturer = () => {
  const { selectedManufacturer, setSelectedManufacturer, fetchSelectOptions } =
    useContext(PentaContext);

  const [manuOptions, setManu] = useState([]);
  const manuAnchor = useComboboxAnchor();

  // load manufacturers (unchanged)
  useEffect(() => {
    (async () => {
      const manufacturersOptions = await fetchSelectOptions("Manufacturers");
      setManu(manufacturersOptions || []);
    })();
  }, [fetchSelectOptions]);

  return (
    <>
      {/* Manufacturer (unchanged) */}
      <div className="filter-section flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Manufacturer</label>
        <Combobox
          items={manuOptions}
          multiple
          value={selectedManufacturer}
          onValueChange={setSelectedManufacturer}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.value}
          isItemEqualToValue={(a, b) => a.value === b.value}
        >
          <ComboboxChips ref={manuAnchor} className="bg-white">
            <ComboboxValue>
              {(selected) => (
                <>
                  {selected.map((item) => (
                    <ComboboxChip key={item.value} aria-label={item.label}>
                      {item.label}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={selected.length > 0 ? "" : "Select..."}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={manuAnchor}>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </>
  );

};

export default Manufacturer;