import HomeLister from "../components/home/HomeLister";
import { useEffect, useContext, useRef, useState, useMemo, useCallback } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PentaContext from "../context/PentaContext";
import Pagination from "../components/home/Pagination";
import Tags from "../components/home/Tags";
import Search from "../components/home/Search";
import QuantityModal from "../components/cards/QuantityModal";
import MessageModal from "../components/cards/MessageModal";
import Toast from "../components/Toast";
import { bulkAddToCart, countAvailableUnits, getItemDisplayName } from "../lib/cartBulkAdd";
import { createInventoryFilterPredicate } from "../lib/inventoryAvailability";

// {SKU Item Code} is a lookup field that arrives as an array locally but coerces
// to a scalar in Airtable formulas, so match against either shape.
const matchesSkuCode = (entry, code) => {
  const field = entry?.["SKU Item Code"];
  if (Array.isArray(field)) return field.map(String).includes(String(code));
  return String(field) === String(code);
};

function Home() {
  const {
    isSideBarActive,
    inventoryGroups,
    areInventoryGroupsLoading,
    offset,
    setOffset,
    offsetArray,
    setOffsetArray,
    setIsLoading,
    setCartCount,
    setIsCartPressed,
    masterInventoryItems,
    isInventoryReady,
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
  } = useContext(PentaContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const groupKey = searchParams.get("group");
  const activeGroup = inventoryGroups.find((group) => group.key === groupKey) || null;
  const previousGroupKey = useRef(groupKey);
  const overviewPagination = useRef({ offset: 0, offsetArray: [""] });

  // State to control card removal animation.
  const [onRemove, setOnRemove] = useState(false);

  // Bulk order flow lives inside a single-SKU group view (Option D). Multi-SKU
  // groups stay drill-down only.
  const isSingleSkuGroup = activeGroup?.skuCodes?.length === 1;
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [bulkMessageContent, setBulkMessageContent] = useState("");

  // The active user filters constrain which physical units are eligible for a
  // bulk add, so hidden stock (filtered out of the visible list) can't be added.
  const filterPredicate = useMemo(
    () =>
      createInventoryFilterPredicate({
        selectedManufacturer,
        selectedSKU,
        selectedFilter,
        selectedDescriptions,
        searchInput,
        selectedPart,
        extremity,
        isRangeOn,
        minValue,
        maxValue,
      }),
    [
      selectedManufacturer,
      selectedSKU,
      selectedFilter,
      selectedDescriptions,
      searchInput,
      selectedPart,
      extremity,
      isRangeOn,
      minValue,
      maxValue,
    ]
  );

  // Combines the single-SKU match with the active filters so every bulk code
  // path (availability, count, submit) selects from the same visible stock.
  const bulkMatcher = useCallback(
    (entry) => {
      const code = activeGroup?.skuCodes?.[0];
      return matchesSkuCode(entry, code) && filterPredicate(entry);
    },
    [activeGroup?.skuCodes, filterPredicate]
  );

  // Derive the display name / size affordance for the active single-SKU group
  // from the cached master inventory. Recomputes once the master list is ready
  // so sized stock is never treated as unsized before the fetch completes.
  const bulkInfo = useMemo(() => {
    if (!isSingleSkuGroup) return null;
    const matches = isInventoryReady
      ? (masterInventoryItems || []).filter((entry) => bulkMatcher(entry))
      : [];
    if (matches.length === 0) {
      return { name: activeGroup.title, hasSize: false };
    }
    return {
      name: getItemDisplayName(matches[0]),
      hasSize: matches.some((entry) => !!entry?.Size),
    };
  }, [isSingleSkuGroup, activeGroup?.id, isInventoryReady, masterInventoryItems, bulkMatcher]);

  // Close any open bulk UI when leaving or switching groups.
  useEffect(() => {
    setShowBulkModal(false);
    setShowBulkMessage(false);
  }, [groupKey]);

  // How many units of the active single-SKU group are addable for a given size,
  // so the QuantityModal can cap its stepper instead of validating post-submit.
  const countBulkAvailable = useCallback(
    (selectedSize) =>
      countAvailableUnits({
        items: masterInventoryItems || [],
        matcher: bulkMatcher,
        selectedSize,
      }),
    [masterInventoryItems, bulkMatcher]
  );

  useEffect(() => {
    if (!areInventoryGroupsLoading && groupKey && !activeGroup) {
      const next = new URLSearchParams(searchParams);
      next.delete("group");
      setSearchParams(next, { replace: true });
    }
  }, [activeGroup, areInventoryGroupsLoading, groupKey, searchParams, setSearchParams]);

  useEffect(() => {
    const previous = previousGroupKey.current;
    if (!previous && groupKey) {
      overviewPagination.current = { offset, offsetArray: [...offsetArray] };
      setOffset(0);
      setOffsetArray([""]);
    } else if (previous && !groupKey) {
      setOffset(overviewPagination.current.offset);
      setOffsetArray(overviewPagination.current.offsetArray);
    } else if (previous && groupKey && previous !== groupKey) {
      setOffset(0);
      setOffsetArray([""]);
    }
    previousGroupKey.current = groupKey;
  }, [groupKey]);

  const openGroup = (group) => {
    setIsLoading(true);
    const next = new URLSearchParams(searchParams);
    next.set("group", group.key);
    setSearchParams(next);
  };

  const closeGroup = () => {
    setIsLoading(true);
    const next = new URLSearchParams(searchParams);
    next.delete("group");
    setSearchParams(next);
  };

  const handleBulkSubmit = (unitsRequested, selectedSize = null) => {
    const { addedCount, availableCount, status } = bulkAddToCart({
      items: masterInventoryItems || [],
      matcher: bulkMatcher,
      unitsRequested,
      selectedSize,
    });

    const name = bulkInfo?.name || activeGroup?.title || "item";

    if (status === "invalid-quantity") {
      setShowBulkModal(false);
      return;
    }
    if (status === "inventory-unavailable") {
      setBulkMessageContent(
        `"${name}" inventory is still loading. Please wait a moment and try again.`
      );
      setShowBulkMessage(true);
      setShowBulkModal(false);
      return;
    }
    if (status === "insufficient-stock") {
      setBulkMessageContent(
        `Only ${availableCount} unit(s) of "${name}" are currently in stock. Please lower your quantity.`
      );
      setShowBulkMessage(true);
      setShowBulkModal(false);
      return;
    }

    setCartCount((prev) => prev + addedCount);
    setShowBulkModal(false);
    setIsCartPressed(true);
    setTimeout(() => setIsCartPressed(false), 1000);
    Toast({ message: `"${name}" added to cart`, type: "is-success" });
  };

  return (
    <div className={isSideBarActive ? "sidebar-active" : ""}>
      <div id="text-section">
        {/* Page title */}
        <h1
          className="is-size-2 has-text-weight-bold has-text-centered"
          id="penta-title"
        >
          Penta Medical Recycling Inventory
        </h1>

        {/* Search Bar with filter button to its left */}
        <div id="search-row">
          {/* Filter button */}
          <Tags></Tags>
          <Search></Search>
        </div>
      </div>
      {activeGroup && (
        <div className="group-context" aria-label="Current inventory group">
          <div className="group-context__inner">
            <button type="button" className="group-context__back" onClick={closeGroup}>
              <ArrowLeft size={16} aria-hidden="true" />
              All items
            </button>
            <h2 className="group-context__title">{activeGroup.title}</h2>
            {isSingleSkuGroup && (
              <button
                type="button"
                className="group-context__bulk"
                onClick={() => setShowBulkModal(true)}
                aria-label={`Bulk add ${activeGroup.title}`}
              >
                <Plus size={16} aria-hidden="true" />
                Bulk add
              </button>
            )}
          </div>
        </div>
      )}
      {/* Top Pagination*/}
      <Pagination bottom={false} onRemove={onRemove}></Pagination>
      {/* List of Inventory Items */}
      <HomeLister
        onRemove={onRemove}
        setOnRemove={setOnRemove}
        activeGroup={activeGroup}
        onSelectGroup={openGroup}
      />
      {/* Bottom Pagination */}
      <Pagination bottom={true} onRemove={onRemove}></Pagination>

      {showBulkModal && bulkInfo && (
        <QuantityModal
          itemName={bulkInfo.name}
          currentItemId={null}
          hasSize={bulkInfo.hasSize}
          getAvailableCount={countBulkAvailable}
          onSubmit={(unitsRequested, selectedSize) =>
            handleBulkSubmit(unitsRequested, selectedSize)
          }
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {showBulkMessage && (
        <MessageModal
          message={bulkMessageContent}
          onClose={() => setShowBulkMessage(false)}
        />
      )}
    </div>
  );
}

export default Home;
