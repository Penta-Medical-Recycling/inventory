import React, { useState, useEffect, useContext } from "react";
import PentaContext from "../context/PentaContext";
import BigSpinner from "../assets/BigSpinner";
import InStockCard from "./cards/InStockCard";

const HomeLister = ({
  selectedFilter,
  offsetArray,
  setOffsetArray,
  setOffset,
  offset,
  searchInput,
  debouncedSearchValue,
  setDebouncedSearchValue,
  isLoading,
  setIsLoading,
}) => {
  const { selectedManufacturer, selectedSKU, minValue, maxValue, isOn } =
    useContext(PentaContext);
  const [data, setData] = useState([]);
  const patKey = import.meta.env.VITE_REACT_APP_API_KEY;
  const baseId = "appnx8gtnlQx5b7nI";
  const tableName = "Inventory";
  const [button, setButton] = useState(1);
  const [debouncedMinValue, setDebouncedMinValue] = useState(minValue);
  const [debouncedMaxValue, setDebouncedMaxValue] = useState(maxValue);

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

  async function fetchData() {
    let url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}?pageSize=36&sort%5B0%5D%5Bfield%5D=Item%20ID&sort%5B0%5D%5Bdirection%5D=asc&filterByFormula=AND(`;
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
        const searchTerms = debouncedSearchValue
          .toLowerCase()
          .split(" ")
          .filter((a) => a !== "size");
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
      setCardsVisible(true);
    });
  }, [offset, offsetArray]);

  useEffect(() => {
    setOffset(0);
    setOffsetArray([""]);
    setIsLoading(true);
    fetchData().then((records) => {
      setData(records);
      setIsLoading(false);
    });
  }, [
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    isOn,
    debouncedMinValue,
    debouncedMaxValue,
    debouncedSearchValue,
  ]);

  const [cardsVisible, setCardsVisible] = useState(false);

  return (
    <>
      {isLoading ? (
        <BigSpinner size={50} />
      ) : data.length ? (
        <div id="cardDiv">
          {data.map(
            (item) =>
              item.fields.SKU && (
                <InStockCard
                  item={item.fields}
                  button={button}
                  setButton={setButton}
                  key={item.fields["Item ID"]}
                />
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

export default HomeLister;
