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
  searchInput,
  debouncedSearchValue,
  setDebouncedSearchValue,
}) => {
  const [data, setData] = useState([]);
  // const apiKey = config.SECRET_API_KEY;
  const patKey = import.meta.env.VITE_REACT_APP_API_KEY;
  const baseId = "appnx8gtnlQx5b7nI";
  const tableName = "Inventory";
  const [button, setButton] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [debouncedMinValue, setDebouncedMinValue] = useState(minValue);
  const [debouncedMaxValue, setDebouncedMaxValue] = useState(maxValue);
  // const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchInput);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (isOn) {
        setDebouncedMinValue(minValue);
        setDebouncedMaxValue(maxValue);
      }
    }, 1000);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [minValue, maxValue]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchValue(searchInput);
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
      selectedTags.length > 0 ||
      isOn ||
      debouncedSearchValue
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
        const searchTerms = debouncedSearchValue.toLowerCase().split(" ").filter(a => a !== 'size')
        const searchConditions = searchTerms.map(
          (term) => `SEARCH("${term}", {Concat2})`
        );
        url += `,AND(${searchConditions.join(",")})`;
      }
    }
    url += ")&offset=" + offsetArray[offset];

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${patKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.offset && !offsetArray[offset + 1]) {
        setOffsetArray([...offsetArray, data.offset]);
      }
      return data.records;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
  useEffect(() => {
    setIsLoading(true);
    fetchData().then((records) => {
      setData(records);
      setIsLoading(false);
    });
  }, [
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    offset,
    isOn,
    debouncedMinValue,
    debouncedMaxValue,
    debouncedSearchValue,
  ]);

  useEffect(() => {
    setOffset(0);
    setOffsetArray([""]);
  }, [
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    isOn,
    debouncedMinValue,
    debouncedMaxValue,
    debouncedSearchValue,
  ]);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : data.length ? (
        <div id="cardDiv">
          {data.map(
            (item) =>
              item.fields.SKU && (
                <div className="card" key={item.id}>
                  <div>
                    <header className="card-header">
                      <div
                        className="has-text-centered"
                        style={{ width: "100%" }}
                      >
                        <p
                          className="has-text-weight-bold ml-3 my-3"
                          style={{ fontSize: "18px" }}
                        >
                          {item.fields["Description (from SKU)"]}
                        </p>
                        {/* <p className="has-text-grey ml-3 mb-3">ID: {item.fields["Item ID"]}</p> */}
                      </div>
                    </header>
                    <div className="">
                      <p
                        className="has-text-weight-bold has-text-centered mt-4"
                        style={{ fontSize: "18px" }}
                      >
                        {item.fields["Tag"]}
                      </p>
                      <hr
                        className="mb-4 mt-3"
                        style={{ margin: "0 auto", width: "80%" }}
                      ></hr>
                    </div>
                    <div className="content mx-5 mb-5">
                      {item.fields["Manufacturer"] && (
                        <div
                          className="mb-4 has-text-centered"
                          style={{ width: "50%" }}
                        >
                          <p
                            className="has-text-weight-bold"
                            style={{ margin: "0" }}
                          >
                            Manufacturer
                          </p>
                          <p>{item.fields["Manufacturer"]}</p>
                        </div>
                      )}
                      {item.fields["Size"] && (
                        <div
                          className="has-text-centered"
                          style={{ width: "50%" }}
                        >
                          <p
                            className="has-text-weight-bold has-text-centered"
                            style={{ margin: "0" }}
                          >
                            Size
                          </p>
                          <p>{item.fields["Size"]}</p>
                        </div>
                      )}
                      {item.fields["Model/Type"] && (
                        <div
                          className="has-text-centered"
                          style={{ width: "50%" }}
                        >
                          <p
                            className="has-text-weight-bold has-text-centered"
                            style={{ margin: "0" }}
                          >
                            Model
                          </p>
                          <p>{item.fields["Model/Type"]}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <footer className="card-footer">
                    {!localStorage.getItem([item.fields["Item ID"]]) &&
                    button ? (
                      <button
                        className="button card-footer-item"
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
                        className="button card-footer-item"
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
                  </footer>
                </div>
              )
          )}
        </div>
      ) : (
        <p className="is-size-4 has-text-weight-bold has-text-centered">
          No Results Found
        </p>
      )}
    </>
  );
};

export default CardLister;
