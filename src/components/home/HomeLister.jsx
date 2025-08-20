import React, { useState, useEffect, useContext, useRef } from "react";
import PentaContext from "../../context/PentaContext";
import BigSpinner from "../../assets/BigSpinner";
import InStockCard from "../cards/InStockCard";

// HomeLister lists the cards for the home page.

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

  // ✅ Background fetch of all inventory pages
  useEffect(() => {
    async function fetchAllInventory() {
      try {
        let allRecords = [];
        let nextOffset = "";
        let pageCounter = 0;
        const maxPages = 50;
        const baseUrl = urlCreator().split("&offset=")[0];

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
        console.log(`✅ Fetched ${allRecords.length} total items from inventory.`);
      } catch (err) {
        console.error("❌ Error fetching all inventory:", err);
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
      {isLoading ? (
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
