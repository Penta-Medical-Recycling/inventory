import React, { useState, useEffect, useContext, useRef } from "react";
import PentaContext from "../../context/PentaContext";
import BigSpinner from "../../assets/BigSpinner";
import InStockCard from "../cards/InStockCard";

const HomeLister = ({}) => {
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
    isOn,
    searchInput,
    setIsLoading,
    setPage,
    urlCreator,
    fetchAPI,
    setData,
  } = useContext(PentaContext);

  const [button, setButton] = useState(1);
  const [isL, setIsL] = useState(false);
  const [onL, setOL] = useState(false);
  const [onR, setR] = useState(false);
  const globalUrl = useRef("");
  const offsetKey = useRef("&offset=");

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

  /// page starts page loads
  /// animation plays ofr 0.5

  /// when we click next page, 0.5 seconds to remove cards => then display isLoading

  useEffect(() => {
    setIsLoading(true);
    const debounceTimeout = setTimeout(async () => {
      await loadNewPage();
      setIsLoading(false);
    }, 1000);
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    minValue,
    maxValue,
    isOn,
    searchInput,
    offset,
  ]);

  // on start once after fetched
  // we turn on isLoading, right after words we add .visible to the cards to they fade in
  // no waiting
  // when they disappear
  // we instantly remove .visible from the cards
  // we hold off isLoading for 5 seconds
  // once they are gone then the new cards fade in.

  // two different useeffects in different ords
  // on load spinner => then add visible
  // on offload => remove visible => then start spinner

  return (
    <>
      {isLoading ? (
        <BigSpinner size={75} />
      ) : data && data.length ? (
        <div id="cardDiv">
          {data.map(
            (item) =>
              item.fields.SKU && (
                <InStockCard
                  item={item.fields}
                  button={button}
                  setButton={setButton}
                  key={item.fields["Item ID"]}
                  isL={isL}
                  setIsL={setIsL}
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
