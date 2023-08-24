import { useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";

const MultipleSelect = ({
  selectedManufacturer,
  setSelectedManufacturer,
  selectedSKU,
  setSelectedSKU,
}) => {
  const [manuOptions, setManu] = useState([]);
  const [SKUOptions, setSKUs] = useState([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
    const baseId = "appBrTbPbyamI0H6Z";

    async function fetchTableRecords(offset = null, tableName) {
      const url = `https://api.airtable.com/v0/${baseId}/${tableName}?${
        offset ? `offset=${offset}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();
      const records = data.records;

      return {
        records,
        offset: data.offset || undefined,
      };
    }

    (async () => {
      let allSKUs = [];
      let SKUSoffset = null;

      do {
        const { records, offset: newOffset } = await fetchTableRecords(
          SKUSoffset,
          "SKUs"
        );
        allSKUs = allSKUs.concat(records);
        SKUSoffset = newOffset;
      } while (SKUSoffset);

      setSKUs(
        allSKUs
          .map((e) => {
            return {
              label: `${e.fields.Name.trimStart()} - ${e.fields.Description.trimStart()}`,
              value: encodeURIComponent(e.fields.Name.trimStart()),
            };
          })
          .sort((a, b) => {
            return a.label.localeCompare(b.label);
          })
      );
    })();

    (async () => {
      let allManu = [];
      let Manuoffset = null;

      do {
        const { records, offset: newOffset } = await fetchTableRecords(
          Manuoffset,
          "Manufacturers"
        );
        allManu = allManu.concat(records);
        Manuoffset = newOffset;
      } while (Manuoffset);

      setManu(
        allManu
          .map((e) => {
            return {
              label: e.fields.Name.trimStart(),
              value: encodeURIComponent(e.fields.Name.trimStart()),
            };
          })
          .sort((a, b) => {
            return a.label.localeCompare(b.label);
          })
      );
    })();
  }, []);

  return (
    <>
      <div style={{ width: "80%", margin: "0 auto 20px auto" }}>
        <h1
          style={{
            fontSize: "23px",
            fontWeight: "600",
          }}
        >
          Select Manufacturer
        </h1>
        <MultiSelect
          options={manuOptions}
          value={selectedManufacturer}
          onChange={setSelectedManufacturer}
          labelledBy="Select"
        />
      </div>
      <hr style={{ width: "80%", margin: "10px auto" }}></hr>
      <div style={{ width: "80%", margin: "0 auto 20px auto" }}>
        <h1
          style={{
            fontSize: "23px",
            fontWeight: "600",
          }}
        >
          Select SKU or Description
        </h1>
        <MultiSelect
          options={SKUOptions}
          value={selectedSKU}
          onChange={setSelectedSKU}
          labelledBy="Select"
        />
      </div>
    </>
  );
};

export default MultipleSelect;
