import { useState, useEffect, useRef } from "react";
import PentaContext from "./PentaContext";

function PentaProvider({ children }) {
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );
  const [cartCount, setCartCount] = useState(
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
      .length
  );
  const [selectedFilter, setSelectedFilters] = useState({
    Prosthesis: false,
    Orthosis: false,
    Pediatric: false,
  });
  const [isCartPressed, setIsCartPressed] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState([]);
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(55);
  const [isOn, setIsOn] = useState(false);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchInput);
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const [offset, setOffset] = useState(0);
  const [offsetArray, setOffsetArray] = useState([""]);
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const [largestSize, setLargestSize] = useState(160);
  const [page, setPage] = useState();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const [data, setData] = useState();

  function urlCreator() {
    const baseUrl = "https://api.airtable.com/v0/appnx8gtnlQx5b7nI/Inventory?";
    const sort = `sort%5B0%5D%5Bfield%5D=Item%20ID&sort%5B0%5D%5Bdirection%5D=asc`;
    const pageSize = "pageSize=36";
    let filterFunction = "filterByFormula=";
    const filters = [
      "{Requests}=BLANK()",
      "{Shipment Status}=BLANK()",
      'NOT({SKU}="")',
    ];
    const skus = selectedSKU.map((option) => option.value);
    if (skus.length > 0) {
      filters.push(`OR(${skus.map((sku) => `{SKU}='${sku}'`).join(",")})`);
    }
    const manufacturers = selectedManufacturer.map((option) => option.value);
    if (manufacturers.length > 0) {
      filters.push(
        `OR(${manufacturers
          .map((manufacturer) => `{Manufacturer}='${manufacturer}'`)
          .join(",")})`
      );
    }
    const selectedTags = Object.keys(selectedFilter).filter(
      (key) => selectedFilter[key]
    );
    if (selectedTags.length > 0) {
      filters.push(
        `OR(${selectedTags.map((tag) => `{Tag}='${tag}'`).join(",")})`
      );
    }
    if (isOn) {
      filters.push(`AND({Size} >= ${minValue}, {Size} <= ${maxValue})`);
    }

    if (searchInput) {
      const searchTerms = searchInput
        .toLowerCase()
        .split(" ")
        .filter((term) => term !== "size");
      const searchConditions = searchTerms.map(
        (term) => `SEARCH("${term}", {StringSearch})`
      );
      filters.push(`AND(${searchConditions.join(",")})`);
    }

    filterFunction += `${encodeURIComponent("AND(" + filters.join(",") + ")")}`;
    return baseUrl + [pageSize, sort, filterFunction].join("&");
  }

  async function fetchAPI(url) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_REACT_APP_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  async function fetchTableRecords(tableName, offset = null) {
    const baseId = "appBrTbPbyamI0H6Z";
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?${
      offset ? `offset=${offset}` : ""
    }`;

    return fetchAPI(url);
  }

  async function fetchTableRecordsWithOffset(tableName) {
    let allRecords = [];
    let offset = null;

    do {
      const { records, offset: newOffset } = await fetchTableRecords(
        tableName,
        offset
      );
      allRecords = allRecords.concat(records);
      offset = newOffset;
    } while (offset);
    return allRecords;
  }

  async function fetchMaxSize() {
    const url = `https://api.airtable.com/v0/appnx8gtnlQx5b7nI/Inventory?pageSize=1&sort%5B0%5D%5Bfield%5D=Size&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=AND(AND({Requests}=%22%22,{Shipment%20Status}=%22%22),NOT({SKU}=%22%22))`;

    const data = await fetchAPI(url);
    if (data && data.records && data.records.length > 0) {
      return data.records[0].fields.Size;
    }
    return null;
  }

  const fetchSelectOptions = async (fieldToMap) => {
    const records = await fetchTableRecordsWithOffset(fieldToMap);

    if (fieldToMap === "Manufacturers") {
      return records
        .map((e) => {
          return {
            label: e.fields.Name.trimStart(),
            value: encodeURIComponent(e.fields.Name.trimStart()),
          };
        })
        .sort((a, b) => {
          return a.label.localeCompare(b.label);
        });
    } else if (fieldToMap === "SKUs") {
      return records
        .map((e) => {
          return {
            label: e.fields.Description.trimStart(),
            value: encodeURIComponent(e.fields.Name.trimStart()),
          };
        })
        .sort((a, b) => {
          return a.label.localeCompare(b.label);
        });
    } else {
      return records
        .map((e) => e.fields.Name.trimStart())
        .sort((a, b) => a.localeCompare(b));
    }
  };

  let contextValues = {
    selectedPartner,
    setSelectedPartner,
    cartCount,
    setCartCount,
    isCartPressed,
    setIsCartPressed,
    isActive,
    setIsActive,
    selectedManufacturer,
    setSelectedManufacturer,
    selectedSKU,
    setSelectedSKU,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    largestSize,
    setLargestSize,
    isOn,
    setIsOn,
    page,
    setPage,
    offset,
    offsetArray,
    setOffsetArray,
    setOffset,
    searchInput,
    setSearchInput,
    loading,
    setLoading,
    isLoading,
    setIsLoading,
    debouncedSearchValue,
    setDebouncedSearchValue,
    isDropActive,
    urlCreator,
    setIsDropActive,
    selectedFilter,
    setSelectedFilters,
    fetchAPI,
    fetchTableRecords,
    fetchTableRecordsWithOffset,
    fetchSelectOptions,
    fetchMaxSize,
    data,
    setData,
  };

  return (
    <PentaContext.Provider value={contextValues}>
      {children}
    </PentaContext.Provider>
  );
}

export default PentaProvider;
