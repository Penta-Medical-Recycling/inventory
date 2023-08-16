import React, { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

const CardLister = ({
  cartCount,
  setCartCount,
  selectedManufacturer,
  setSelectedManufacturer,
  selectedSKU,
  setSelectedSKU,
  selectedFilter,
  offsetArray,
  setOffsetArray,
  setOffset,
  offset,
  setCsv,
  minValue,
  maxValue,
  isOn,
  searchInput
}) => {
  const [data, setData] = useState([]);
  // const apiKey = config.SECRET_API_KEY;
  const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
  useEffect(() => {
    console.log(import.meta.env)
  }, [])
  const baseId = "appnx8gtnlQx5b7nI";
  const tableName = "Inventory";
  const [button, setButton] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [debouncedMinValue, setDebouncedMinValue] = useState(minValue);
  const [debouncedMaxValue, setDebouncedMaxValue] = useState(maxValue);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchInput)

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (isOn) {
        setDebouncedMinValue(minValue);
        setDebouncedMaxValue(maxValue);
      };
    }, 1000);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [minValue, maxValue]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchValue(searchInput)
    }, 1000);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [searchInput]);

  const encodedTableName = encodeURIComponent(tableName);

  let url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}?pageSize=36&filterByFormula=AND(`;

  async function fetchData() {
    const skus = selectedSKU.map((option) => option.value);
    const manufacturers = selectedManufacturer.map((option) => option.value);
    const selectedTags = Object.keys(selectedFilter).filter(
      (key) => selectedFilter[key]
    );

    url += 'AND({Requests}=BLANK(),{Shipment Status}=BLANK()),NOT({SKU}="")';

    if (
      skus.length > 0 ||
      manufacturers.length > 0 ||
      selectedTags.length > 0 || isOn || debouncedSearchValue
    ) {
      if (skus.length > 0) {
        url += `,OR(${skus.map((sku) => `{SKU}='${sku}'`).join(",")})`;
      }
      if (manufacturers.length > 0) {
        url += `,OR(${manufacturers
          .map((manufacturer) => `{Manufacturer}='${manufacturer}'`)
          .join(",")})`;
      }
      if (selectedTags.length > 0) {
        url += `,OR(${selectedTags.map((tag) => `{Tag}='${tag}'`).join(",")})`;
      }
      if (isOn) {
        url += `,AND({Size} >= ${minValue}, {Size} <= ${maxValue})`;
      }
      if (debouncedSearchValue) {
        const searchTerms = debouncedSearchValue.toLowerCase().split(" ");
        const searchConditions = searchTerms.map(term => `SEARCH("${term}", {Concat2})`);
        url += `,AND(${searchConditions.join(",")})`;
      }

    }
    url += ")&offset=" + offsetArray[offset];

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.offset && !offsetArray[offset + 1]) {
        setOffsetArray([...offsetArray, data.offset]);
      }
      let header = "ID,Description,Size,Model/Type,Manufacturer\n";
      for (let i = 0; i < data.records.length; i++) {
        let record = data.records[i].fields;
        header += `"${record["Item ID"] || ""}","${record["Description (from SKU)"] || ""
          }","${record["Size"] || ""}","${record["Model/Type"] || ""}","${record["Manufacturer"] || ""
          }"\n`;
      }
      console.log(header);
      //should only be trigger on button press, not on ever page load.
      //also should it only download an csv based on the current filters? Or should it always be a download of EVERY item?
      const blob = new Blob([header], { type: "text/csv" });
      setCsv(URL.createObjectURL(blob));
      return data.records;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
  useEffect(() => {
    setIsLoading(true)
    fetchData().then((records) => {
      setData(records);
      setIsLoading(false);
    });
  }, [selectedManufacturer, selectedSKU, selectedFilter, offset, isOn, debouncedMinValue, debouncedMaxValue, debouncedSearchValue]);

  useEffect(() => {
    setOffset(0);
    setOffsetArray([""]);
  }, [selectedManufacturer, selectedSKU, selectedFilter, isOn, debouncedMinValue, debouncedMaxValue, debouncedSearchValue]);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : data.length? (
        <div id="cardDiv">
          {data.map(
            (item) =>
              item.fields.SKU && (
                <div className="card" key={item.id}>
                  <div className="card-content">
                    <div className="content">
                      <p>ID: {item.fields["Item ID"]}</p>
                      <p>
                        Description: {item.fields["Description (from SKU)"]}
                      </p>
                      {item.fields["Size"] && (
                        <p>Size: {item.fields["Size"]}</p>
                      )}
                      {item.fields["Model/Type"] && (
                        <p>Model: {item.fields["Model/Type"]}</p>
                      )}
                      {item.fields["Manufacturer"] && (
                        <p>Manufacturer: {item.fields["Manufacturer"]}</p>
                      )}
                      <p>SKU: {item.fields["SKU"]}</p>
                      <p>Tag: {item.fields["Tag"]}</p>
                      {!localStorage.getItem([item.fields["Item ID"]]) &&
                        button ? (
                        <button
                          className="button"
                          style={{ backgroundColor: "#78d3fb", color: "white" }}
                          onClick={() => {
                            localStorage.setItem(
                              item.fields["Item ID"],
                              JSON.stringify(item.fields)
                            );
                            setButton(button + 1);
                            setCartCount(cartCount + 1);
                          }}
                        >
                          Add to cart
                        </button>
                      ) : (
                        <button
                          className="button"
                          style={{ backgroundColor: "#ff5c47", color: "white" }}
                          onClick={() => {
                            localStorage.removeItem(item.fields["Item ID"]);
                            setButton(button + 1);
                            setCartCount(cartCount - 1);
                          }}
                        >
                          Remove From Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      ) : (<p className="is-size-4 has-text-weight-bold has-text-centered">No Results Found</p>)}
    </>
  );
};

export default CardLister;
