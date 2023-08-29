import { useState, useEffect } from "react";
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
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState([]);
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(55);
  const [isOn, setIsOn] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchInput);
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const [offset, setOffset] = useState(0);
  const [offsetArray, setOffsetArray] = useState([""]);
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const [largestSize, setLargestSize] = useState(60);
  const [page, setPage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropActive, setIsDropActive] = useState(false);

  // const [isVisible, setIsVisible] = useState(false); // for card animations after debouncing timeout
  // const [data, setData] = useState([]]); // for card animations after debouncing timeout

  // const baseURL = 'https://api.airtable.com/v0/${baseId}/${encodedTableName}?' (does not change state)
  // const parameters = `${...}&${...}` (changes based on filters and search, if those chang offset is reset)
  // const offSetParam = '&offset={offsetArray[offset] || ''}' (changes when paginating or resets when above changes)

  // fetch (baseURL + parameters + offSetParam);
  // setData(res); holds on to the baseURL + parameters + offSetParam
  // sends data to home lister

  // Changes to the follow value will result in a change in the inventory API endpoint, this global url is set above
  // selectedManufacturer,
  // selectedSKU,
  // selectedFilter,
  // isOn,
  // debouncedMinValue,
  // debouncedMaxValue,
  // debouncedSearchValue,

  // offset and offsetArray is reset to default any time the above varibales change (0, [])
  // if the above remain the same value, but offset changes, then the offSetParam is updated and refetching occurs
  // offset, offsetArray

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
            label: `${e.fields.Name.trimStart()} - ${e.fields.Description.trimStart()}`,
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
    offset,
    offsetArray,
    page,
    setPage,
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
    setIsDropActive,
    selectedFilter,
    setSelectedFilters,
    fetchAPI,
    fetchTableRecords,
    fetchTableRecordsWithOffset,
    fetchSelectOptions,
    fetchMaxSize,
  };

  return (
    <PentaContext.Provider value={contextValues}>
      {children}
    </PentaContext.Provider>
  );
}

export default PentaProvider;
