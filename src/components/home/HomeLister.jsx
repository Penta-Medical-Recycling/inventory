import { useState, useEffect, useContext, useRef } from "react";
import { useDebounce } from "use-debounce";
import PentaContext from "../../context/PentaContext";
import BigSpinner from "../../assets/BigSpinner";
import InStockCard from "../cards/InStockCard";
import InventoryGroupCard from "../cards/InventoryGroupCard";
import { getInventoryPagePlan } from "../../lib/inventoryPagination";
import { getAvailableSkuCodes } from "../../lib/inventoryAvailability";

// HomeLister lists the cards for the home page.

// Airtable's maximum page size. Used for the background master-list fetch so it
// pulls the full inventory in as few requests as possible.
const AIRTABLE_MAX_PAGE_SIZE = 100;

const HomeLister = ({ onRemove, setOnRemove, activeGroup, onSelectGroup }) => {
  const {
    isLoading,
    data,
    offset,
    setOffset,
    offsetArray,
    setOffsetArray,
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    selectedDescriptions,
    minValue,
    maxValue,
    isRangeOn,
    searchInput,
    selectedPart,
    extremity,
    setIsLoading,
    setPage,
    urlCreator,
    fetchAPI,
    setData,
    inventoryGroups,
    areInventoryGroupsLoading,
  } = useContext(PentaContext);

  const cardDiv = useRef(null);
  const availabilityCache = useRef(new Map());

  // Debounce only the search text so rapid typing coalesces into one fetch.
  // Other filters (manufacturer, size, part, page) are discrete and fetch
  // immediately.
  const [debouncedSearch] = useDebounce(searchInput, 400);
  // Gate the inventory cards behind the full master-list fetch. Until every
  // inventory page is cached, the add-to-cart stock check can't tell "not
  // loaded yet" from "actually zero", so we hold the spinner until it's done.
  const [inventoryReady, setInventoryReady] = useState(false);
  const [masterInventoryItems, setMasterInventoryItems] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [areAvailableGroupsLoading, setAreAvailableGroupsLoading] = useState(true);
  const [availableGroupsSignature, setAvailableGroupsSignature] = useState("");
  const currentFilterSignature = urlCreator({ pageSize: 1, maxRecords: 1 });

  // ✅ Background fetch of all inventory pages
  useEffect(() => {
    // Reuse the cached master list across in-app navigation (e.g. Cart -> Home).
    // sessionStorage persists for the tab session, so only do the full
    // multi-page fetch when the cache is missing or empty.
    const cached = sessionStorage.getItem("allInventoryItems");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMasterInventoryItems(parsed);
          setInventoryReady(true);
          return;
        }
      } catch {
        // Malformed cache - fall through and refetch.
      }
    }

    async function fetchAllInventory() {
      try {
        let allRecords = [];
        let nextOffset = "";
        let pageCounter = 0;
        // Safety bound only - the loop exits on the missing offset below once
        // Airtable runs out of pages. Larger pages (100 is the Airtable max)
        // cut the request count vs the visible 36/page pagination.
        const maxPages = 1000;
        const baseUrl = urlCreator(AIRTABLE_MAX_PAGE_SIZE).split("&offset=")[0];

        while (pageCounter < maxPages) {
          const url = baseUrl + nextOffset;
          const res = await fetchAPI(url);
          if (res.records) {
            allRecords.push(...res.records.map((r) => r.fields));
          }
          if (!res.offset) break;
          nextOffset = `&offset=${res.offset}`;
          pageCounter++;
        }

        sessionStorage.setItem("allInventoryItems", JSON.stringify(allRecords));
  setMasterInventoryItems(allRecords);
        console.log(`✅ Fetched ${allRecords.length} total items from inventory.`);
      } catch (err) {
        console.error("❌ Error fetching all inventory:", err);
      } finally {
        setInventoryReady(true);
      }
    }

    fetchAllInventory();
  }, []);

  useEffect(() => {
    if (activeGroup || areInventoryGroupsLoading || !inventoryReady) {
      setAvailableGroups([]);
      setAreAvailableGroupsLoading(false);
      return;
    }

    const cachedGroups = availabilityCache.current.get(currentFilterSignature);
    if (cachedGroups) {
      setAvailableGroups(cachedGroups);
      setAvailableGroupsSignature(currentFilterSignature);
      setAreAvailableGroupsLoading(false);
      return;
    }

    setAreAvailableGroupsLoading(true);
    setAvailableGroupsSignature("");
    setOffset(0);
    setOffsetArray([""]);

    const availableCodes = getAvailableSkuCodes(masterInventoryItems, {
      selectedDescriptions,
      selectedSKU,
      selectedManufacturer,
      selectedFilter,
      searchInput: debouncedSearch,
      selectedPart,
      extremity,
      isRangeOn,
      minValue,
      maxValue,
    });
    const confirmedGroups = inventoryGroups.filter((group) =>
      group.skuCodes.some((code) => availableCodes.has(code))
    );
    availabilityCache.current.set(currentFilterSignature, confirmedGroups);
    setAvailableGroups(confirmedGroups);
    setAvailableGroupsSignature(currentFilterSignature);
    setAreAvailableGroupsLoading(false);
  }, [
    activeGroup,
    areInventoryGroupsLoading,
    inventoryReady,
    inventoryGroups,
    masterInventoryItems,
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    selectedDescriptions,
    minValue,
    maxValue,
    isRangeOn,
    debouncedSearch,
    selectedPart,
    extremity,
  ]);

  const pagePlan = getInventoryPagePlan(offset, activeGroup ? [] : availableGroups);

  useEffect(() => {
    if (
      areInventoryGroupsLoading ||
      (!activeGroup &&
        (areAvailableGroupsLoading || availableGroupsSignature !== currentFilterSignature))
    ) {
      return;
    }

    let cancelled = false;

    async function loadPage() {
      setIsLoading(true);
      setOnRemove(false);

      const groupedCodes = availableGroups.flatMap((group) => group.skuCodes);
      const pageSize = activeGroup ? 36 : pagePlan.individualCount;
      let response = { records: [] };

      if (pageSize > 0) {
        const baseUrl = urlCreator({
          pageSize,
          includeSkuCodes: activeGroup?.skuCodes,
          excludeSkuCodes: activeGroup ? undefined : groupedCodes,
        });
        const pageOffset = offsetArray[offset];
        response = await fetchAPI(
          baseUrl + (pageOffset ? `&offset=${encodeURIComponent(pageOffset)}` : "")
        );
      } else if (!pagePlan.hasMoreGroups) {
        response = await fetchAPI(
          urlCreator({
            pageSize: 1,
            maxRecords: 1,
            fields: ["Item ID"],
            excludeSkuCodes: groupedCodes,
          })
        );
      }

      if (cancelled) return;
      const records = pageSize > 0 ? response?.records || [] : [];
      const hasNext = pagePlan.hasMoreGroups || Boolean(response?.offset) || (pageSize === 0 && Boolean(response?.records?.length));

      if (response?.offset) {
        setOffsetArray((current) => {
          const next = [...current];
          next[offset + 1] = response.offset;
          return next;
        });
      }

      setPage(
        offset > 0
          ? hasNext
            ? "Next/Previous"
            : "Previous"
          : hasNext
            ? "Next"
            : "None"
      );
      setData(records);
      sessionStorage.setItem("allItems", JSON.stringify(records.map((record) => record.fields)));
      setIsLoading(false);
    }

    loadPage();
    return () => {
      cancelled = true;
    };
  }, [
    activeGroup,
    areInventoryGroupsLoading,
    areAvailableGroupsLoading,
    availableGroupsSignature,
    availableGroups,
    currentFilterSignature,
    debouncedSearch,
    extremity,
    isRangeOn,
    maxValue,
    minValue,
    offset,
    selectedDescriptions,
    selectedFilter,
    selectedManufacturer,
    selectedPart,
    selectedSKU,
  ]);

  return (
    <>
      {isLoading || !inventoryReady || (!activeGroup && areAvailableGroupsLoading) ? (
        <BigSpinner size={75} />
      ) : pagePlan.groups.length || (data && data.length) ? (
        <div id="cardDiv" ref={cardDiv}>
          {pagePlan.groups.map((group) => (
            <InventoryGroupCard key={group.key} group={group} onSelect={onSelectGroup} />
          ))}
          {(data || []).map((item, index) => (
            <InStockCard
              key={item.fields["Item ID"] || index}
              item={item.fields}
              onRemove={onRemove}
              setOnRemove={setOnRemove}
              allVisibleItems={(data || []).map((i) => i.fields)}
            />
          ))}
        </div>
      ) : data && data.length === 0 ? (
        <p className="is-size-4 has-text-weight-bold has-text-centered">
          No Results Found
        </p>
      ) : (
        <></>
      )}
    </>
  );
};

export default HomeLister;
