import { useState, useEffect, useRef } from "react";
import PentaContext from "./PentaContext";

function PentaProvider({ children }) {
  // Initialize selectedPartner from localStorage if available; otherwise, default to an empty string.
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );

  // Count the number of items in the cart. Items are stored as stringified JSON objects with Item IDs as keys.
  // Exclude 'partner' and 'notes' keys from localStorage when counting.
  const [cartCount, setCartCount] = useState(
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
      .length
  );

  // Set the animation state for when an item is added to the cart.
  const [isCartPressed, setIsCartPressed] = useState(false);

  // Control the visibility of the sidebar.
  const [isSideBarActive, setIsSideBarActive] = useState(false);

  // Define the largestSize as fetched from the inventory, used to validate the size range toggle.
  const [largestSize, setLargestSize] = useState(60);

  // Set the frontend page number based on the offset.
  const [page, setPage] = useState();

  // Manage loading animation state for .csv and .xlsx downloads.
  const [isDownloading, setIsDownloading] = useState(false);

  // Manage loading animation state for cards.
  const [isLoading, setIsLoading] = useState(false);

  // Track the state of the download dropdown menu.
  const [isDropActive, setIsDropActive] = useState(false);

  // Initialize the data that populates the homepage cards.
  const [data, setData] = useState();

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Changes in the following variables impact the AirTable API endpoint, fetching new homepage data.
  // They are used for creating a filter formula parameter.

  // Input for searching through the inventory.
  const [searchInput, setSearchInput] = useState("");

  // Track the selection of general tags: 'Prosthesis', 'Orthosis', and 'Pediatric'.
  const [selectedFilter, setSelectedFilters] = useState({
    Prosthesis: false,
    Orthosis: false,
    Pediatric: false,
  });

  // Track the selection of specific manufacturers for filtering.
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);

  // Track the selection of specific descriptions from SKUs for filtering.
  const [selectedSKU, setSelectedSKU] = useState([]);

  // Track the selected size range, with default values.
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(55);

  // Toggle the size range filter.
  const [isRangeOn, setIsRangeOn] = useState(false);

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // These variables are related to homepage data presentation and pagination, not affecting the AirTable API endpoint.
  // AirTable paginates with 100 records per request, managed using offsets.
  // Offset keys are stored in offsetArray to navigate pages forwards or backwards.
  // Example offsetArray: ['', 'itrSAerEy3AXVYmaf/recMidLQr5gU02F47', 'itrSAerEy3AXVYmaf/recBgrc23ryjE96JS', 'itrSAerEy3AXVYmaf/rechvSQ6GtO85SpRF']
  // The 'offset' variable tracks pagination; page number is 'offset + 1'.
  // If 'offset' is 0, the parameter is 'offset=', if 'offset' is 2, it becomes 'offset=itrSAerEy3AXVYmaf/recBgrc23ryjE96JS'.

  // Set the offset for a specific AirTable endpoint.
  const [offset, setOffset] = useState(0);

  // Maintain an offsetArray to keep track of pagination.
  const [offsetArray, setOffsetArray] = useState([""]);
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function urlCreator() {
    const baseUrl = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?";
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
    if (isRangeOn) {
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

  const APIKey = import.meta.env.VITE_REACT_APP_API_KEY;

  async function fetchAPI(url) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${APIKey}`,
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
    const baseId = "appHFwcwuXLTNCjtN";
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
    const url = `https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?pageSize=1&sort%5B0%5D%5Bfield%5D=Size&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=AND(AND({Requests}=%22%22,{Shipment%20Status}=%22%22),NOT({SKU}=%22%22))`;

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
            label: e.fields.Description || "VOID",
            value: encodeURIComponent(e.fields["Item Code"].trimStart()),
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
    isSideBarActive,
    setIsSideBarActive,
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
    isRangeOn,
    setIsRangeOn,
    page,
    setPage,
    offset,
    offsetArray,
    setOffsetArray,
    setOffset,
    searchInput,
    setSearchInput,
    isDownloading,
    setIsDownloading,
    isLoading,
    setIsLoading,
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
