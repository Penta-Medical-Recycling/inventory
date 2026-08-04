import { useState, useEffect, useContext, useRef } from "react";
import { useDebounce } from "use-debounce";
import PentaContext from "../../context/PentaContext";
import BigSpinner from "../../assets/BigSpinner";
import InStockCard from "../cards/InStockCard";
import InventoryGroupCard from "../cards/InventoryGroupCard";
import { getInventoryPagePlan } from "../../lib/inventoryPagination";
import { getAvailableSkuCodes } from "../../lib/inventoryAvailability";

// HomeLister lists the cards for the home page.

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
    masterInventoryItems,
    isInventoryReady,
    masterInventoryError,
    reloadMasterInventory,
  } = useContext(PentaContext);

  const cardDiv = useRef(null);
  const availabilityCache = useRef(new Map());
  // Tracks the query identity (active group + filter signature) that the current
  // pagination offset/offsetArray belong to, so a stale Airtable offset token is
  // never replayed against a different query. See the pagination reset below.
  const loadedQueryKeyRef = useRef(null);

  // Debounce only the search text so rapid typing coalesces into one fetch.
  // Other filters (manufacturer, size, part, page) are discrete and fetch
  // immediately.
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [areAvailableGroupsLoading, setAreAvailableGroupsLoading] = useState(true);
  const [availableGroupsSignature, setAvailableGroupsSignature] = useState("");
  // Set when the current page request fails, so we surface a retry instead of a
  // misleading "No Results Found" (and keep the existing page/pagination intact).
  const [pageError, setPageError] = useState(false);
  // Bumping this re-runs the page-load effect for the retry affordance.
  const [pageReloadKey, setPageReloadKey] = useState(0);
  const currentFilterSignature = urlCreator({ pageSize: 1, maxRecords: 1 });

  useEffect(() => {
    if (activeGroup || areInventoryGroupsLoading || !isInventoryReady) {
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
    isInventoryReady,
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

    // Airtable offset tokens are specific to the exact query that produced them.
    // When the query identity changes (filters, search, or the active group), any
    // offset carried over from a page > 0 belongs to a different formula. Reset
    // pagination first rather than replaying a stale token, which Airtable would
    // reject or answer with the wrong page.
    const queryKey = `${activeGroup ? activeGroup.key : "overview"}::${currentFilterSignature}`;
    if (loadedQueryKeyRef.current !== queryKey && offset !== 0) {
      loadedQueryKeyRef.current = queryKey;
      setOffset(0);
      setOffsetArray([""]);
      return;
    }
    loadedQueryKeyRef.current = queryKey;

    let cancelled = false;

    async function loadPage() {
      setIsLoading(true);
      setOnRemove(false);

      const groupedCodes = availableGroups.flatMap((group) => group.skuCodes);
      const pageSize = activeGroup ? 36 : pagePlan.individualCount;
      let response = { records: [] };
      let requestFailed = false;

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
        requestFailed = response === null;
      } else if (!pagePlan.hasMoreGroups) {
        response = await fetchAPI(
          urlCreator({
            pageSize: 1,
            maxRecords: 1,
            fields: ["Item ID"],
            excludeSkuCodes: groupedCodes,
          })
        );
        requestFailed = response === null;
      }

      if (cancelled) return;

      // A failed request (fetchAPI returns null) is not an empty page. Surface a
      // retry and keep the current data/pagination rather than wiping the page
      // and showing a misleading "No Results Found".
      if (requestFailed) {
        setPageError(true);
        setIsLoading(false);
        return;
      }
      setPageError(false);

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
    pageReloadKey,
  ]);

  return (
    <>
      {masterInventoryError ? (
        <div className="has-text-centered" role="alert">
          <p className="is-size-4 has-text-weight-bold">
            We couldn&apos;t load the inventory.
          </p>
          <button
            type="button"
            className="button is-primary"
            onClick={reloadMasterInventory}
          >
            Retry
          </button>
        </div>
      ) : isLoading || !isInventoryReady || (!activeGroup && areAvailableGroupsLoading) ? (
        <BigSpinner size={75} />
      ) : pageError ? (
        <div className="has-text-centered" role="alert">
          <p className="is-size-4 has-text-weight-bold">
            We couldn&apos;t load these results.
          </p>
          <button
            type="button"
            className="button is-primary"
            onClick={() => setPageReloadKey((key) => key + 1)}
          >
            Retry
          </button>
        </div>
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
