import React, { useState, useEffect, useContext, useRef } from "react";
import { useDebounce } from "use-debounce";
import PentaContext from "../../context/PentaContext";
import BigSpinner from "../../assets/BigSpinner";
import InStockCard from "../cards/InStockCard";

// HomeLister lists the cards for the home page.

// Duration of the card fade in/out, kept in sync with the .fade-in/.fade-out
// CSS rules in App.css.
const FADE_MS = 400;
// Airtable's maximum page size. Used for the background master-list fetch so it
// pulls the full inventory in as few requests as possible.
const AIRTABLE_MAX_PAGE_SIZE = 100;

const HomeLister = ({ onRemove, setOnRemove }) => {
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
    allInventoryItems,
    setAllInventoryItems,
  } = useContext(PentaContext);

  const globalUrl = useRef("");
  const offsetKey = useRef("&offset=");
  const cardDiv = useRef(null);

  // Debounce only the search text so rapid typing coalesces into one fetch.
  // Other filters (manufacturer, size, part, page) are discrete and fetch
  // immediately.
  const [debouncedSearch] = useDebounce(searchInput, 400);
  // Gate the inventory cards behind the full master-list fetch. Until every
  // inventory page is cached, the add-to-cart stock check can't tell "not
  // loaded yet" from "actually zero", so we hold the spinner until it's done.
  const [inventoryReady, setInventoryReady] = useState(false);

  // ✅ Background fetch of all inventory pages
  useEffect(() => {
    // Reuse the cached master list across in-app navigation (e.g. Cart -> Home).
    // sessionStorage persists for the tab session, so only do the full
    // multi-page fetch when the cache is missing or empty.
    if (allInventoryItems.length > 0) {
      setInventoryReady(true);
      return;
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
          setAllInventoryItems(allRecords);
        console.log(`✅ Fetched ${allRecords.length} total items from inventory.`);
      } catch (err) {
        console.error("❌ Error fetching all inventory:", err);
      } finally {
        setInventoryReady(true);
      }
    }

    fetchAllInventory();
  }, []);

  async function loadNewPage() {
    const newUrl = urlCreator();
    const newOffset = "&offset=" + offsetArray[offset];

    try {
      if (globalUrl.current !== newUrl) {
        const res = await fetchAPI(newUrl);
        if (res.offset) {
          setOffsetArray(["", res.offset]);
          setPage("Next");
        } else {
          setOffsetArray([""]);
          setPage("None");
        }

        // The new filter always lands on page 0, so record the page-0 offset
        // key. Storing the old page's key here made the follow-up offset reset
        // look like a page change and replay the loading animation.
        offsetKey.current = "&offset=";
        globalUrl.current = newUrl;
        setOffset(0);
        setData(res.records);
        sessionStorage.setItem("allItems", JSON.stringify(res.records.map((r) => r.fields)));
      } else if (offsetKey.current !== newOffset) {
        const res = await fetchAPI(newUrl + newOffset);
        if (res.offset && offsetArray[offset - 1] !== undefined && offset !== 0) {
          setOffsetArray([...offsetArray, res.offset]);
          setPage("Next/Previous");
        } else if (!res.offset && offsetArray[offset - 1] !== undefined && offset !== 0) {
          setPage("Previous");
        } else {
          setPage("Next");
        }

        offsetKey.current = newOffset;
        setData(res.records);
        sessionStorage.setItem("allItems", JSON.stringify(res.records.map((r) => r.fields)));
      }
    } catch (err) {
      console.error("❌ Error loading new page:", err);
    }
  }

  // Cheap, synchronous mirror of loadNewPage's fetch decision so the effect can
  // skip cycles that wouldn't fetch anything - e.g. the async max size arriving
  // after mount, or the offset reset that follows a filter change. Without this,
  // those no-op cycles replay the loading animation a second time.
  function willFetch() {
    const newUrl = urlCreator();
    const newOffset = "&offset=" + offsetArray[offset];
    if (globalUrl.current !== newUrl) return true;
    if (offsetKey.current !== newOffset) return true;
    return false;
  }

  useEffect(() => {
    // Cancel-safe loading cycle. `cancelled` short-circuits state updates and
    // every timer is tracked so the cleanup can clear them when the effect
    // re-runs (a new filter/page), preventing overlapping loading cycles.
    let cancelled = false;
    const timers = [];
    const delay = (ms) =>
      new Promise((resolve) => timers.push(setTimeout(resolve, ms)));

    async function run() {
      // Skip cycles that wouldn't change what's displayed. This coalesces the
      // extra dependency updates that fire right after a load (the async max
      // size on first render, the offset reset after a filter change) so the
      // loading animation only ever plays once.
      if (!willFetch()) {
        setIsLoading(false);
        return;
      }

      // Fade the current cards out before swapping them (skip on first load).
      if (cardDiv.current) {
        setOnRemove(true);
        await delay(FADE_MS);
        if (cancelled) return;
      }

      setIsLoading(true);
      setOnRemove(false);
      await loadNewPage();
      if (cancelled) return;

      await delay(FADE_MS);
      if (cancelled) return;
      setIsLoading(false);
    }

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [
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
    offset,
  ]);

  return (
    <>
      {isLoading || !inventoryReady ? (
        <BigSpinner size={75} />
      ) : data && data.length ? (
        <div id="cardDiv" ref={cardDiv}>
          {data.map((item, index) => (
            <InStockCard
              key={item.fields["Item ID"] || index}
              item={item.fields}
              onRemove={onRemove}
              setOnRemove={setOnRemove}
              allVisibleItems={data.map((i) => i.fields)}
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
