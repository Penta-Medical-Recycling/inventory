import { useState, useEffect, useContext, useMemo } from "react";
import PentaContext from "../context/PentaContext";
import { MultiSelect } from "react-multi-select-component";

// helpers
const norm = (s = "") =>
  s
    .toLowerCase()
    .replace(/["'’`]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleize = (s = "") =>
  s.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

/**
 * Extract search-friendly phrases from a record:
 * - Prefer Item Name / Model / Description (from SKU)
 * - Also split on commas / pipes to get base phrases like "Left Foot"
 */
function phrasesFromRecord(r) {
  const parts = new Set();
  const desc =
    Array.isArray(r?.["Description (from SKU)"])
      ? r["Description (from SKU)"][0]
      : r?.["Description (from SKU)"];
  const name =
    r?.["Item Name"] || r?.Name || r?.Component || r?.Model || r?.["Model/Type"];

  [name, desc].forEach((p) => {
    if (!p) return;
    const whole = norm(p);
    if (whole.length > 1 && /[a-z]/.test(whole)) {
      parts.add(whole);
    }

    String(p)
      .split(/[|,/]/)
      .map((s) => norm(s))
      .filter((s) => s.length > 1 && /[a-z]/.test(s))
      .forEach((s) => parts.add(s));
  });

  return Array.from(parts);
}

const MultipleSelect = () => {
  const {
    selectedManufacturer,
    setSelectedManufacturer,
    selectedSKU,
    setSelectedSKU,
    selectedFilter,
    fetchSelectOptions,
    setSearchInput, 
    selectedDescriptions,
  setSelectedDescriptions,
  } = useContext(PentaContext);

  const [manuOptions, setManu] = useState([]);
  const [descOptions, setDescOptions] = useState([]);

  // load manufacturers (unchanged)
  useEffect(() => {
    (async () => {
      const manufacturersOptions = await fetchSelectOptions("Manufacturers");
      setManu(manufacturersOptions || []);
    })();
  }, [fetchSelectOptions]);

  // Build Description options from cached inventory, filtered by Tag chips
 useEffect(() => {
  const all = JSON.parse(
    sessionStorage.getItem("allInventoryItems") || "[]"
  );

  const selectedTags = Object.keys(selectedFilter).filter(
    (k) => selectedFilter[k]
  );

  const filtered = all.filter((r) => {
    if (!selectedTags.length) return true;
    const tag = r?.Tag;
    return tag && selectedTags.includes(tag);
  });

  const phraseMap = new Map();

  filtered.forEach((r) => {
    const phrases = phrasesFromRecord(r);
    const rawText = [
      r?.["Item Name"],
      r?.["Description (from SKU)"],
      r?.Model,
      r?.["Model/Type"],
    ]
      .filter(Boolean)
      .join(" ");

    phrases.forEach((ph) => {
      const normalized = norm(ph);
      if (!phraseMap.has(normalized)) phraseMap.set(normalized, new Set());
      phraseMap.get(normalized).add(rawText);
    });
  });

  const opts = Array.from(phraseMap.entries())
    .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
    .map(([ph, rawSet]) => ({
      label: titleize(ph),
      value: encodeURIComponent(ph),
      raw: Array.from(rawSet).join(" "),
    }));

  setDescOptions(opts);
}, [selectedFilter]);

 const handleDescriptionChange = (next) => {
  setSelectedDescriptions(next);
  const selectedTerms = next.map((o) => decodeURIComponent(o.value));
  setSearchInput(selectedTerms.join(" "));
};

  return (
    <>
      {/* Manufacturer (unchanged) */}
      <div style={{ width: "80%", margin: "0 auto 20px auto" }}>
        <h1 style={{ fontSize: "23px", fontWeight: 600 }}>Select Manufacturer</h1>
        <MultiSelect
          options={manuOptions}
          value={selectedManufacturer}
          onChange={setSelectedManufacturer}
          labelledBy="Select..."
          hasSelectAll
          ClearSelectedIcon={null}
        />
      </div>

      <hr style={{ width: "80%", margin: "10px auto" }} />

      {/* Description -> drives searchInput so it behaves like the main search */}
      <div style={{ width: "80%", margin: "0 auto 20px auto" }}>
        <h1 style={{ fontSize: "23px", fontWeight: 600 }}>Select Description</h1>
        <MultiSelect
          options={descOptions}
        value={selectedDescriptions}
         onChange={handleDescriptionChange}

          labelledBy="Select..."
          hasSelectAll
          ClearSelectedIcon={null}
        />
      </div>
    </>
  );
};

export default MultipleSelect;
