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
    urlCreator,
    fetchAPI,
    setData,
  } = useContext(PentaContext);

  const [button, setButton] = useState(1);
  const globalUrl = useRef("");
  const offsetKey = useRef("&offset=");

  useEffect(() => {
    setIsLoading(true);
    const debounceTimeout = setTimeout(() => {
      async function loadNewPage() {
        const newUrl = urlCreator();
        if (globalUrl.current !== newUrl) {
          const res = await fetchAPI(newUrl);
          setOffset(0);
          setOffsetArray([""]);
          if (res.offset && !offsetArray[offset + 1]) {
            setOffsetArray([...offsetArray, res.offset]);
          }
          setData(res.records);
          globalUrl.current = newUrl;
        }
      }
      loadNewPage();
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
  ]);

  useEffect(() => {
    setIsLoading(true);
    const debounceTimeout = setTimeout(() => {
      async function loadNewPage() {
        const newUrl = urlCreator();
        const newOffset = "&offset=" + offsetArray[offset];
        if (globalUrl.current === newUrl && offsetKey.current !== newOffset) {
          const res = await fetchAPI(newUrl + newOffset);
          if (res.offset && !offsetArray[offset + 1]) {
            setOffsetArray([...offsetArray, res.offset]);
          }
          offsetKey.current = newOffset;
          setData(res.records);
        }
        setIsLoading(false);
      }
      loadNewPage();
    }, 1000);
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [offset]);

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
