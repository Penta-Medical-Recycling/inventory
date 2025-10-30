import { useState, useEffect, useCallback } from "react";
import PentaContext from "./PentaContext";

function PentaProvider({ children }) {
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );
  const APIKey = import.meta.env.VITE_REACT_APP_API_KEY;

  const [cartCount, setCartCount] = useState(
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes").length
  );
  const [serverStatus, setServerStatus] = useState("Offline");
  const [serverMessage, setServerMessage] = useState("");
  const [popUpStatus, setPopUpStatus] = useState("Offline");
  const [message, setMessage] = useState("");
  const [isCartPressed, setIsCartPressed] = useState(false);
  const [isSideBarActive, setIsSideBarActive] = useState(false);
  const [largestSize, setLargestSize] = useState(60);
  const [page, setPage] = useState();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const [data, setData] = useState();
  const [filteredDescriptions, setFilteredDescriptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedFilter, setSelectedFilters] = useState({
    Prosthesis: false,
    Orthosis: false,
    Pediatric: false,
  });
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState([]);
  const [selectedDescriptions, setSelectedDescriptions] = useState([]); 

  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(55);
  const [isRangeOn, setIsRangeOn] = useState(false);
  const [offset, setOffset] = useState(0);
  const [offsetArray, setOffsetArray] = useState([""]);

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await fetch("https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Site-Status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${APIKey}`
        }
      });

      const response = await data.json();
      setPopUpStatus(response.records[0].fields.Status);
      setMessage(response.records[0].fields.Message);
      setServerStatus(response.records[1].fields.Status);
      setServerMessage(response.records[1].fields.Message);
    };

    fetchStatus();
  }, []);

  const urlCreator = useCallback(() => {
    const baseUrl = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?";
    const sort = `sort[0][field]=Item ID&sort[0][direction]=asc`;
    const pageSize = "pageSize=36";
    let filterFunction = "filterByFormula=";

    const filters = [
      "{Requests}=BLANK()",
      "{Shipment Status}=BLANK()",
      'NOT({SKU}="")',
    ];

    const skus = selectedSKU.map((option) => option.value);
    if (selectedSKU.length > 0) {
  filters.push(
    `OR(${selectedSKU.map((sku) => `{SKU}='${decodeURIComponent(sku)}'`).join(",")})`
        );
      }

    if (selectedDescriptions.length > 0) {
  const descTerms = selectedDescriptions
    .map((option) =>
      option.label.toLowerCase().replace(/[^a-z0-9\s]/gi, "")
    )
    .filter(Boolean);

  const descConditions = descTerms.map(
    (term) => `SEARCH("${term}", {StringSearch})`
  );

  if (descConditions.length > 0) {
    filters.push(`OR(${descConditions.join(",")})`);
  }
}

    const manufacturers = selectedManufacturer.map((option) => option.value);
    if (manufacturers.length > 0) {
      filters.push(
        `OR(${manufacturers.map((m) => `{Manufacturer}='${decodeURIComponent(m)}'`).join(",")})`
      );
    }

    
    const selectedTags = Object.keys(selectedFilter).filter((key) => selectedFilter[key]);
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

if (selectedSKU.length > 0) {
  const descTerms = selectedSKU
    .map((option) => option.label.toLowerCase().replace(/[^a-z0-9\s]/gi, ""))
    .filter(Boolean);

  const descConditions = descTerms.map(
    (term) => `SEARCH("${term}", {StringSearch})`
  );

  if (descConditions.length > 0) {
    filters.push(`OR(${descConditions.join(",")})`);
  }
}


    filterFunction += encodeURIComponent(`AND(${filters.join(",")})`);
    return baseUrl + [pageSize, sort, filterFunction].join("&");

    
  }, [
    selectedSKU,
    selectedManufacturer,
    selectedFilter,
    minValue,
    isRangeOn,
    searchInput
  ]);

  async function fetchAPI(url) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${APIKey}`,
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
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
      const { records, offset: newOffset } = await fetchTableRecords(tableName, offset);
      allRecords = allRecords.concat(records);
      offset = newOffset;
    } while (offset);
    return allRecords;
  }

  async function fetchMaxSize() {
    const url = `https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?pageSize=1&sort[0][field]=Size&sort[0][direction]=desc&filterByFormula=AND(AND({Requests}="",{Shipment Status}=""),NOT({SKU}=""))`;
    const data = await fetchAPI(url);
    if (data?.records?.length > 0) return data.records[0].fields.Size;
    return null;
  }

  const fetchSelectOptions = async (fieldToMap) => {
  const records = await fetchTableRecordsWithOffset(fieldToMap);

  if (fieldToMap === "Manufacturers") {
    return records
      .map((e) => ({
        label: e.fields.Name.trimStart(),
        value: encodeURIComponent(e.fields.Name.trimStart()),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } else if (fieldToMap === "SKUs") {
    const skuList = records.map((e) => e.fields.SKU);
    const mappedData = skuList
      .filter((item) => typeof item === "string" && item.trim() !== "")
      .map((item) => ({
        label: item.trimStart().replace(/["]/g, ""),
        value: item,
      }));

    return mappedData.sort((a, b) => a.label.localeCompare(b.label));
  } else {
    return records
      .map((e) => e.fields.Partner.trimStart())
      .sort((a, b) => a.localeCompare(b));
  }
};

  const getCartItemsSortedFIFO = async () => {
    const url = `https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?sort[0][field]=Date Added&sort[0][direction]=asc&filterByFormula=AND(NOT({Requests}!=""), {Quantity In Stock}>0)`;
    const data = await fetchAPI(url);
    return data?.records || [];
  };

  const fulfillCartItems = async (cartItems) => {
    for (let item of cartItems) {
      let quantityToFulfill = item.quantity;
      const inventory = await getCartItemsSortedFIFO();
      for (let record of inventory) {
        if (record.fields.SKU === item.sku && quantityToFulfill > 0) {
          const availableQty = record.fields["Quantity In Stock"] || 0;
          const fulfillQty = Math.min(availableQty, quantityToFulfill);
          await fetch(`https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory/${record.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${APIKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                "Quantity In Stock": availableQty - fulfillQty,
                "Quantity Fulfilled": (record.fields["Quantity Fulfilled"] || 0) + fulfillQty,
                Requests: selectedPartner,
              },
            }),
          });
          quantityToFulfill -= fulfillQty;
        }
      }
    }
  };

  const getTotalInStockBySKU = async (sku) => {
    const baseId = "appHFwcwuXLTNCjtN";
    const url = `https://api.airtable.com/v0/${baseId}/Inventory?filterByFormula=AND({SKU} = '${sku}', {Requests} = BLANK(), {Shipment Status} = BLANK())`;
    const data = await fetchAPI(url);
    if (!data || !data.records) return 0;
    return data.records.reduce((total, record) => total + (record.fields["Quantity In Stock"] || 0), 0);
  };

  return (
    <PentaContext.Provider
      value={{
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
        setIsDropActive,
        selectedFilter,
        setSelectedFilters,
        data,
        setData,
        serverMessage,
        setServerMessage,
        serverStatus,
        setServerStatus,
        popUpStatus,
        setPopUpStatus,
        message,
        setMessage,
        urlCreator,
        fetchAPI,
        fetchTableRecords,
        fetchTableRecordsWithOffset,
        fetchSelectOptions,
        fetchMaxSize,
        getCartItemsSortedFIFO,
        fulfillCartItems,
        getTotalInStockBySKU,
        selectedDescriptions,
       setSelectedDescriptions,
      }}
    >
      {children}
    </PentaContext.Provider>
  );
}

export default PentaProvider;