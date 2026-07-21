import { useContext } from "react";
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
  const {
    selectedDescriptions,
    setSelectedDescriptions,
    allInventoryItems,
  } = useContext(PentaContext);
  const anchor = useComboboxAnchor();

  const descriptions = new Set();
  allInventoryItems.forEach((record) => {
    const description = Array.isArray(record?.["Description (from SKU)"])
      ? record["Description (from SKU)"][0]
      : record?.["Description (from SKU)"];
    if (description && String(description).trim()) {
      descriptions.add(String(description).trim());
    }
  });
  const descOptions = Array.from(descriptions)
    .sort((first, second) => first.localeCompare(second))
    .map((description) => ({
      label: description,
      value: encodeURIComponent(description),
    }));

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
        <ComboboxChips ref={anchor} className="bg-white [--ring:#64C8FF]">
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
