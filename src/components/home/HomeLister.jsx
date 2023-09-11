import React, { useState, useEffect, useContext, useRef } from "react";
import PentaContext from "../../context/PentaContext";
import BigSpinner from "../../assets/BigSpinner";
import InStockCard from "../cards/InStockCard";

const HomeLister = ({ onR, setR }) => {
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

  const [button, setButton] = useState(1);
  const globalUrl = useRef("");
  const offsetKey = useRef("&offset=");
  const cardDiv = useRef(null);

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
    } else if (
      globalUrl.current === newUrl &&
      offsetKey.current !== newOffset
    ) {
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
    }
  }

  async function removingCard() {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(true);
        resolve();
      }, 750);
    });
  }
  async function addingCard() {
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
        setR(true);
        await removingCard();
      }
    }
    onStart();
    const debounceTimeout = setTimeout(async () => {
      setR(false);
      await loadNewPage();
      await addingCard();
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
          {data.map(
            (item) =>
              item.fields.SKU && (
                <InStockCard
                  item={item.fields}
                  button={button}
                  setButton={setButton}
                  key={item.fields["Item ID"]}
                  onR={onR}
                  setR={setR}
                />
              )
          )}
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
