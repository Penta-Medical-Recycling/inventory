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
    const baseUrl = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?";
    const sort = `sort%5B0%5D%5Bfield%5D=Item%20ID&sort%5B0%5D%5Bdirection%5D=asc`;
    const pageSize = "pageSize=36";
    let filterFunction = "filterByFormula=";
    const filters = [
      "{Requests}=BLANK()",
      "{Shipment Status}=BLANK()",
      'NOT({SKU}="")',
      // 'OR(AND({Requests}=BLANK(),{Shipment Status}=BLANK(),NOT({SKU}=""),{Qty.}=1),AND(NOT({SKU}=""),{Qty.}>1))',
    ];

    // qty = 3 => 3 - 1 => 2
    // qty = 2 => 2 - 0.5 => 1.5
    // qty = 1.5 => 1.5 - 0.5 => 1
    // qty = 1

    // in stock to be true
    //"{Requests}=BLANK()",
    // "{Shipment Status}=BLANK()",
    // 'NOT({SKU}="")',
    // true

    // OR(AND({Requests}=BLANK(),{Shipment Status}=BLANK(),NOT({SKU}=""),{Qty.}=1),AND(NOT({SKU}=""),{Qty.}>1))

    //if (no requests, no shipment, has to have an sku, and quantity is 1)
    // else if (quantity is > 1)
    // else {
    // dont show it
    // }

    /// in stock => has to have no requests, no shipment, and have an sku

    // shows on home page if
    // Quantity is greater than 1,
    // OR has to no requests, no shipment, and have an SKU with a Quantity of 1
    // if (quantity is greater than 1, OR ( no requests, no shipment, and have an SKU with a Quantity of 1))
    // show
    // Once an item has been checked out with a quantity of 1,

    // For the most part, 97% of items have a quantity of 1
    // so if there is a chance that an item is checked out, in the airTable request column, we will let them know the list of items that had their items qnty changed
    // only those with a quantity greater than 1 will be affected, no qnty of 1 will ever be modified
    // as we don't want to delete the item from the airTable
    // The note in the airTable is so in the case that the item with a modified quanity is not found or shipped for whatever reason reason
    // then the item with a modified quantity can be changed back to its original value.

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
    console.log(baseUrl + [pageSize, sort, filterFunction].join("&"));
    return baseUrl + [pageSize, sort, filterFunction].join("&");
  }

  //api.airtable.com/v0/appnx8gtnlQx5b7nI/Inventory?pageSize=36&sort[0][field]=Item ID&sort[0][direction]=asc&filterByFormula=AND(OR(AND({Requests}=BLANK(),{Shipment Status}=BLANK(),NOT({SKU}="")),AND({Qty.}=1)),OR({Qty.}>1))
  // https: function urlCreator() {
  //   const baseUrl = "https://api.airtable.com/v0/appnx8gtnlQx5b7nI/Inventory?";
  //   const sort = `sort%5B0%5D%5Bfield%5D=Item%20ID&sort%5B0%5D%5Bdirection%5D=asc`;
  //   const pageSize = "pageSize=36";
  //   let filterFunction = "filterByFormula=";
  //   const filters = [];

  //   // Add the modified filter formula
  //   filters.push(
  //     `AND(OR({Requests}=BLANK(),{Shipment Status}=BLANK(),{Qty.}=1),{Qty.}>1),NOT({SKU}=""))`
  //   );

  //   const skus = selectedSKU.map((option) => option.value);
  //   if (skus.length > 0) {
  //     filters.push(`OR(${skus.map((sku) => `{SKU}='${sku}'`).join(",")})`);
  //   }
  //   const manufacturers = selectedManufacturer.map((option) => option.value);
  //   if (manufacturers.length > 0) {
  //     filters.push(
  //       `OR(${manufacturers
  //         .map((manufacturer) => `{Manufacturer}='${manufacturer}'`)
  //         .join(",")})`
  //     );
  //   }
  //   const selectedTags = Object.keys(selectedFilter).filter(
  //     (key) => selectedFilter[key]
  //   );
  //   if (selectedTags.length > 0) {
  //     filters.push(
  //       `OR(${selectedTags.map((tag) => `{Tag}='${tag}'`).join(",")})`
  //     );
  //   }
  //   if (isOn) {
  //     filters.push(`AND({Size} >= ${minValue},{Size} <= ${maxValue})`);
  //   }

  //   if (searchInput) {
  //     const searchTerms = searchInput
  //       .toLowerCase()
  //       .split(" ")
  //       .filter((term) => term !== "size");
  //     const searchConditions = searchTerms.map(
  //       (term) => `SEARCH("${term}",{StringSearch})`
  //     );
  //     filters.push(`AND(${searchConditions.join(",")})`);
  //   }

  //   filterFunction += encodeURIComponent(filters.join(",")); // Join filters with commas
  //   console.log(baseUrl + [pageSize, sort, filterFunction].join("&"));
  //   return baseUrl + [pageSize, sort, filterFunction].join("&");
  // }

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
