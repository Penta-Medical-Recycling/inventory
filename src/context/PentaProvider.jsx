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
import {
  getSiteStatus,
  getSKUGroups,
  getAllInventory
} from "../lib/api";

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
    let cancelled = false;
    let requestInFlight = false;

    const fetchStatus = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const status = await getSiteStatus();

        if (status === null) throw new Error(`Site-Status request failed`);

        if (cancelled) return;
        setPopUpStatus(status.announcement.status);
        setMessage(status.announcement.message);
        setServerStatus(status.platform.status);
        setServerMessage(status.platform.message);
        setServerError(null);
      } catch (error) {
        if (cancelled) return;
        // A failed status fetch is a host problem, not intentional maintenance -
        // surface an error message instead of the Maintenance screen.
        setServerError(
          "We're having trouble reaching the inventory service. Please try again later."
        );
      } finally {
        requestInFlight = false;
      }
    };

    const refreshVisibleStatus = () => {
      if (document.visibilityState === "visible") fetchStatus();
    };

    fetchStatus();
    window.addEventListener("focus", fetchStatus);
    document.addEventListener("visibilitychange", refreshVisibleStatus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", fetchStatus);
      document.removeEventListener("visibilitychange", refreshVisibleStatus);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInventoryGroups() {
      try {
        const groups = await getSKUGroups();
        if (!Array.isArray(groups)) throw new Error("Invalid SKU groups response");
        if (!cancelled) setInventoryGroups(groups);
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
      // Every page of available inventory, with no user filters.
      const records = await getAllInventory(buildInventoryParams({ includeUserFilters: false }));
      if (cancelled) return;

      // getAllInventory returns null if any page fails. Treat that as an error and
      // never cache a partial inventory.
      if (records === null) {
        setMasterInventoryError(true);
        setIsInventoryReady(true);
        return;
      }

      const allRecords = records.map((record) => record.fields);
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

  // REEMPLACE URL CREATOR

  function buildInventoryParams(options = {}) {
    const params = { pageSize: options.pageSize ?? 36 };

    if (options.includeSkuCodes?.length) params.includeSku = options.includeSkuCodes;
    if (options.excludeSkuCodes?.length) params.excludeSku = options.excludeSkuCodes;

    // When false, only the base availability filters apply (the backend always
    // adds them). Used for the full master list.
    if (options.includeUserFilters === false) return params;

    if (selectedDescriptions.length > 0) {
      params.descriptions = selectedDescriptions.map((option) => option.label);
    }
    if (selectedManufacturer.length > 0) {
      // Send the plain name: URLSearchParams does the encoding, so decode the
      // stored value to avoid encoding it twice.
      params.manufacturers = selectedManufacturer.map((option) => decodeURIComponent(option.value));
    }

    const tags = Object.keys(selectedFilter).filter((key) => selectedFilter[key]);
    if (tags.length > 0) params.tags = tags;

    if (isRangeOn) {
      params.minSize = minValue;
      params.maxSize = maxValue;
    }
    if (searchInput) params.search = searchInput;
    if (selectedPart) params.part = selectedPart;
    if (extremity && extremity !== "All") params.extremity = extremity;

    // NOTE: selectedSKU is not included on purpose. Before adding a "skus"
    // parameter, check whether setSelectedSKU is called anywhere (git grep).
    return params;
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
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?${offset ? `offset=${offset}` : ""
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
    console.trace("table:", tableName, allRecords.length);
    return allRecords;
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
        buildInventoryParams,
        fetchAPI,
        fetchTableRecords,
        fetchTableRecordsWithOffset,
        fetchSelectOptions,
        getCartItemsSortedFIFO,
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
