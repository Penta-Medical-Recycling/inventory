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
    let allRecords = [];
    let nextOffset = "";
    let pageCounter = 0;
    const maxPages = 50; // safeguard against infinite loops

    const baseUrl = urlCreator().split("&offset=")[0]; // remove existing offset param

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
  }

  fetchAllInventory();
}, []);


  async function loadNewPage() {
    const newUrl = urlCreator();
    const newOffset = "&offset=" + offsetArray[offset];

    if (globalUrl.current !== newUrl) {
      const res = await fetchAPI(newUrl);

      if (res.offset && res.offset !== undefined) {
        setOffsetArray(["", res.offset]);
        setPage("Next");
      } else if (res.offset === undefined) {
        setOffsetArray([""]);
        setPage("None");
      }

      offsetKey.current = newOffset;
      globalUrl.current = newUrl;
      setOffset(0);
      setData(res.records);

      // ✅ Save current page items too (optional but good for local view logic)
      sessionStorage.setItem("allItems", JSON.stringify(res.records.map((r) => r.fields)));
    } else if (globalUrl.current === newUrl && offsetKey.current !== newOffset) {
      const res = await fetchAPI(newUrl + newOffset);

      if (
        res.offset &&
        res.offset !== undefined &&
        offsetArray[offset - 1] !== undefined &&
        offset !== 0
      ) {
        setOffsetArray([...offsetArray, res.offset]);
        setPage("Next/Previous");
      } else if (
        res.offset === undefined &&
        offsetArray[offset - 1] !== undefined &&
        offset !== 0
      ) {
        setPage("Previous");
      } else {
        setPage("Next");
      }

      offsetKey.current = newOffset;
      setData(res.records);

      // ✅ Save current page items
      sessionStorage.setItem("allItems", JSON.stringify(res.records.map((r) => r.fields)));
    }
  }

  async function removingCards() {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(true);
        resolve();
      }, 750);
    });
  }

  async function addingCards() {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        resolve();
      }, 750);
    });
  }

  useEffect(() => {
    async function onStart() {
      if (cardDiv.current) {
        setOnRemove(true);
        await removingCards();
      }
    }

    onStart();

    const debounceTimeout = setTimeout(async () => {
      setOnRemove(false);
      await loadNewPage();
      await addingCards();
    }, 750);

    return () => {
      clearTimeout(debounceTimeout);
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
          {data.map((item) => (
            <InStockCard
              item={item.fields}
              key={item.fields["Item ID"]}
              onRemove={onRemove}
              setOnRemove={setOnRemove}
              allVisibleItems={data.map((i) => i.fields)} // optional but still fine
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
