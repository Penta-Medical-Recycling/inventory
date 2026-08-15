import { useState, useEffect } from "react";
import PentaContext from "./PentaContext";
import {
  normalizeInventoryGroups,
  SKU_GROUPS_TABLE,
} from "../config/inventoryGroups";
import {
  AIRTABLE_API_KEY,
  AIRTABLE_API_URL,
  AIRTABLE_BASE_ID,
} from "../config/airtable";
import { getCartItemKeys } from "../lib/storage";

// Airtable's maximum page size. Used for the background master-list fetch so it
// pulls the full inventory in as few requests as possible.
const AIRTABLE_MAX_PAGE_SIZE = 100;

function PentaProvider({ children }) {
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );
  const [cartCount, setCartCount] = useState(
    getCartItemKeys().length
  );
  // null = status not yet known. The app renders normally while this resolves;
  // "Offline" is the intentional maintenance toggle from the Site-Status record.
  const [serverStatus, setServerStatus] = useState(null);
  const [serverMessage, setServerMessage] = useState("");
  // Set when the /Site-Status fetch itself fails (Airtable host issue), so the
  // app can surface an error instead of being conflated with maintenance.
  const [serverError, setServerError] = useState(null);
  const [popUpStatus, setPopUpStatus] = useState("Offline");
  const [message, setMessage] = useState("");
  const [isCartPressed, setIsCartPressed] = useState(false);
  const [isSideBarActive, setIsSideBarActive] = useState(false);
  const [largestSize, setLargestSize] = useState(60);
  const [page, setPage] = useState();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  const [selectedPart, setSelectedPart] = useState("");
  const [extremity, setExtremity] = useState("All");

  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(60);
  // The size range is always shown; it only counts as an active filter once the
  // user narrows it from the full [1, largestSize] range.
  const isRangeOn = minValue > 1 || maxValue < largestSize;
  const [offset, setOffset] = useState(0);
  const [offsetArray, setOffsetArray] = useState([""]);
  const [inventoryGroups, setInventoryGroups] = useState([]);
  const [areInventoryGroupsLoading, setAreInventoryGroupsLoading] = useState(true);

  const clearFilters = () => {
    setSelectedManufacturer([]);
    setSelectedSKU([]);
    setSelectedDescriptions([]);
    setSelectedFilters({
      Prosthesis: false,
      Orthosis: false,
      Pediatric: false,
    });
    setSelectedPart("");
    setExtremity("All");
    setMinValue(1);
    setMaxValue(largestSize);
    setOffset(0);
    setOffsetArray([""]);
  };

  // Full sellable inventory (filter-independent), cached for the tab session and
  // shared across the app so availability checks and the bulk add flow read a
  // single reactive source instead of poking sessionStorage directly.
  const [masterInventoryItems, setMasterInventoryItems] = useState([]);
  const [isInventoryReady, setIsInventoryReady] = useState(false);
  // Set when the master-list fetch fails outright, so the UI can distinguish a
  // real failure (offer a retry) from a genuinely empty inventory.
  const [masterInventoryError, setMasterInventoryError] = useState(false);
  // Bumping this re-runs the master fetch effect (used by the retry affordance).
  const [masterInventoryReloadKey, setMasterInventoryReloadKey] = useState(0);
  const reloadMasterInventory = () => {
    sessionStorage.removeItem("allInventoryItems");
    setIsInventoryReady(false);
    setMasterInventoryError(false);
    setMasterInventoryReloadKey((key) => key + 1);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await fetch(`${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Site-Status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${AIRTABLE_API_KEY}`
          }
        });

        const response = await data.json();
        setPopUpStatus(response.records[0].fields.Status);
        setMessage(response.records[0].fields.Message);
        setServerStatus(response.records[1].fields.Status);
        setServerMessage(response.records[1].fields.Message);
      } catch (error) {
        // A failed status fetch is a host problem, not intentional maintenance -
        // surface an error message instead of the Maintenance screen.
        console.error("Error fetching site status:", error);
        setServerError(
          "We're having trouble reaching the inventory service. Please try again later."
        );
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInventoryGroups() {
      try {
        const records = await fetchTableRecordsWithOffset(SKU_GROUPS_TABLE);
        if (!cancelled) setInventoryGroups(normalizeInventoryGroups(records));
      } catch (error) {
        console.error("Error fetching SKU Groups:", error);
        if (!cancelled) setInventoryGroups([]);
      } finally {
        if (!cancelled) setAreInventoryGroupsLoading(false);
      }
    }

    loadInventoryGroups();
    return () => {
      cancelled = true;
    };
  }, []);

  // Background fetch of the full inventory (all pages, filter-independent).
  // Reuses the sessionStorage cache across in-app navigation; only re-fetches
  // when the cache is missing/empty or a retry was requested.
  useEffect(() => {
    let cancelled = false;

    const cached = sessionStorage.getItem("allInventoryItems");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMasterInventoryItems(parsed);
          setMasterInventoryError(false);
          setIsInventoryReady(true);
          return;
        }
      } catch {
        // Malformed cache - fall through and refetch.
      }
    }

    async function fetchAllInventory() {
      let allRecords = [];
      let nextOffset = "";
      let pageCounter = 0;
      // Safety bound only - the loop exits on the missing offset once Airtable
      // runs out of pages. 100 (the Airtable max) cuts the request count.
      const maxPages = 1000;
      // The master list must represent the full sellable inventory regardless of
      // the active filters, so availability is derived from a complete set.
      const baseUrl = urlCreator({
        pageSize: AIRTABLE_MAX_PAGE_SIZE,
        includeUserFilters: false,
      }).split("&offset=")[0];

      while (pageCounter < maxPages && !cancelled) {
        const url = baseUrl + nextOffset;
        const res = await fetchAPI(url);
        if (cancelled) return;
        // fetchAPI returns null on a failed request. Treat that as an error
        // rather than an empty page, so we don't cache/expose a partial list
        // that would wrongly hide every group.
        if (!res) {
          setMasterInventoryError(true);
          setIsInventoryReady(true);
          return;
        }
        if (res.records) {
          allRecords.push(...res.records.map((r) => r.fields));
        }
        if (!res.offset) break;
        nextOffset = `&offset=${res.offset}`;
        pageCounter++;
      }

      if (cancelled) return;
      sessionStorage.setItem("allInventoryItems", JSON.stringify(allRecords));
      setMasterInventoryItems(allRecords);
      setMasterInventoryError(false);
      setIsInventoryReady(true);
    }

    fetchAllInventory();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterInventoryReloadKey]);

  function urlCreator(pageSizeOrOptions = 36) {
    const options =
      typeof pageSizeOrOptions === "number"
        ? { pageSize: pageSizeOrOptions }
        : pageSizeOrOptions || {};
    const pageSizeValue = options.pageSize ?? 36;
    // When false, only the base availability filters (and any include/exclude SKU
    // codes) are applied - the user-selected filters/search are skipped. Used to
    // build the full inventory master list regardless of the active filter state.
    const includeUserFilters = options.includeUserFilters !== false;
    const baseUrl = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Inventory?`;
    const sort = `sort[0][field]=Item ID&sort[0][direction]=asc`;
    const pageSize = `pageSize=${pageSizeValue}`;
    let filterFunction = "filterByFormula=";

    const filters = [
      "{Requests}=BLANK()",
      "{Shipment Status}=BLANK()",
      'NOT({SKU}="")',
    ];

    const codeCondition = (code) =>
      `{SKU Item Code}="${String(code).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    if (options.includeSkuCodes?.length) {
      filters.push(`OR(${options.includeSkuCodes.map(codeCondition).join(",")})`);
    }
    if (options.excludeSkuCodes?.length) {
      filters.push(`NOT(OR(${options.excludeSkuCodes.map(codeCondition).join(",")}))`);
    }

    if (includeUserFilters) {
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
    // Tag is a multi-value field. Match membership within its joined values and
    // require every selected tag (e.g. "Prosthesis" AND "Pediatric").
    selectedTags.forEach((tag) => {
      filters.push(`FIND("${tag}", ARRAYJOIN({Tag}))`);
    });

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


    // Filter by prosthetic part via the Airtable "Limb Guide" field. The Parts
    // filter options don't map 1:1 to the field values, so translate them here.
    // "All" (and no selection) has no mapping and applies no filter.
    const limbGuide = {
      Liners: "Liners",
      Adapters: "Adapters",
      "Knees/Hips": "Knees/ Hips",
      Pylons: "Pylons",
      Feet: "Feet",
      Accessories: "Accessory/ Misc.",
    }[selectedPart];
    if (limbGuide) {
      // Limb Guide is a multi-value field; match within its joined values.
      filters.push(`FIND("${limbGuide}", ARRAYJOIN({Limb Guide}))`);
    }

    // Filter by extremity via the "Arms/ Hands" Limb Guide value: Upper keeps
    // only those items, Lower excludes them.
    if (extremity === "Upper") {
      filters.push(`FIND("Arms/ Hands", ARRAYJOIN({Limb Guide}))`);
    } else if (extremity === "Lower") {
      filters.push(`NOT(FIND("Arms/ Hands", ARRAYJOIN({Limb Guide})))`);
    }
    }

    filterFunction += encodeURIComponent(`AND(${filters.join(",")})`);
    const params = [pageSize, sort, filterFunction];
    if (options.maxRecords) params.push(`maxRecords=${options.maxRecords}`);
    options.fields?.forEach((field) => {
      params.push(`fields%5B%5D=${encodeURIComponent(field)}`);
    });
    return baseUrl + params.join("&");

    
  }

  async function fetchAPI(url) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
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
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?${
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
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Inventory?pageSize=1&sort[0][field]=Size&sort[0][direction]=desc&filterByFormula=AND(AND({Requests}="",{Shipment Status}=""),NOT({SKU}=""))`;
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
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Inventory?sort[0][field]=Date Added&sort[0][direction]=asc&filterByFormula=AND(NOT({Requests}!=""), {Quantity In Stock}>0)`;
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
          await fetch(`${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Inventory/${record.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${AIRTABLE_API_KEY}`,
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
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Inventory?filterByFormula=AND({SKU} = '${sku}', {Requests} = BLANK(), {Shipment Status} = BLANK())`;
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
        selectedFilter,
        setSelectedFilters,
        clearFilters,
        data,
        setData,
        serverMessage,
        setServerMessage,
        serverStatus,
        setServerStatus,
        serverError,
        setServerError,
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
        selectedPart,
        setSelectedPart,
        extremity,
        setExtremity,
        inventoryGroups,
        areInventoryGroupsLoading,
        masterInventoryItems,
        isInventoryReady,
        masterInventoryError,
        reloadMasterInventory,
      }}
    >
      {children}
    </PentaContext.Provider>
  );
}

export default PentaProvider;
