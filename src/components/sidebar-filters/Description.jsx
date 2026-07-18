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

const Description = () => {
  const { selectedDescriptions, setSelectedDescriptions } =
    useContext(PentaContext);

  const [descOptions, setDescOptions] = useState([]);
  const anchor = useComboboxAnchor();

  // Build the option list from the cached master inventory list. Each record's
  // "Description (from SKU)" is an array field, so pull the first value, then
  // dedupe and sort alphabetically to mirror the Manufacturer options.
  useEffect(() => {
    let records = [];
    try {
      records = JSON.parse(
        sessionStorage.getItem("allInventoryItems") || "[]"
      );
    } catch {
      records = [];
    }

    const descriptions = new Set();
    records.forEach((r) => {
      const desc = Array.isArray(r?.["Description (from SKU)"])
        ? r["Description (from SKU)"][0]
        : r?.["Description (from SKU)"];
      if (desc && String(desc).trim()) descriptions.add(String(desc).trim());
    });

    const opts = Array.from(descriptions)
      .sort((a, b) => a.localeCompare(b))
      .map((desc) => ({ label: desc, value: encodeURIComponent(desc) }));

    setDescOptions(opts);
  }, []);

  return (
    <div className="filter-section flex flex-col gap-2">
      <label className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Description</label>
      <Combobox
        items={descOptions}
        multiple
        value={selectedDescriptions}
        onValueChange={setSelectedDescriptions}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        isItemEqualToValue={(a, b) => a.value === b.value}
      >
        <ComboboxChips ref={anchor} className="bg-white">
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
        <ComboboxContent anchor={anchor}>
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
  );
};

export default Description;
