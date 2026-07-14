import React, { useState, useEffect, useContext, useRef } from "react";
import PentaContext from "../../context/PentaContext";
import BigSpinner from "../../assets/BigSpinner";
import InStockCard from "../cards/InStockCard";

// HomeLister lists the cards for the home page.

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
    minValue,
    maxValue,
    isRangeOn,
    searchInput,
    setIsLoading,
    setPage,
    urlCreator,
    fetchAPI,
    setData,
  } = useContext(PentaContext);

  const globalUrl = useRef("");
  const offsetKey = useRef("&offset=");
  const cardDiv = useRef(null);

  // Gate the inventory cards behind the full master-list fetch. Until every
  // inventory page is cached, the add-to-cart stock check can't tell "not
  // loaded yet" from "actually zero", so we hold the spinner until it's done.
  const [inventoryReady, setInventoryReady] = useState(false);

  // ✅ Background fetch of all inventory pages
  useEffect(() => {
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
          if (!res) break; // network/HTTP error – save what we have so far
          if (res.records) {
            allRecords.push(...res.records.map((r) => r.fields));
          }
          if (!res.offset) break;
          nextOffset = `&offset=${res.offset}`;
          pageCounter++;
        }

        sessionStorage.setItem("allInventoryItems", JSON.stringify(allRecords));
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

        offsetKey.current = newOffset;
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

  const removingCards = () =>
    new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(true);
        resolve();
      }, 750);
    });

  const addingCards = () =>
    new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        resolve();
      }, 750);
    });

  useEffect(() => {
    let isMounted = true;

    async function onStart() {
      if (cardDiv.current && isMounted) {
        setOnRemove(true);
        await removingCards();
      }

      const debounceTimeout = setTimeout(async () => {
        if (!isMounted) return;
        setOnRemove(false);
        await loadNewPage();
        await addingCards();
      }, 750);

      return () => clearTimeout(debounceTimeout);
    }

    onStart();

    return () => {
      isMounted = false;
    };
  }, [
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    minValue,
    maxValue,
    isRangeOn,
    searchInput,
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
