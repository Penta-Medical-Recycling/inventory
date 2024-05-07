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

  // Used to keep track of previous endpoint and offset
  // This determines whether to navigate the same endpoint or create a new one
  const globalUrl = useRef("");
  const offsetKey = useRef("&offset=");

  const cardDiv = useRef(null);

  // Function to load a new page of data
  async function loadNewPage() {
    const newUrl = urlCreator(); // Create a URL instance based on filters and search input
    const newOffset = "&offset=" + offsetArray[offset];

    // Check if the current URL is different from the previous one
    // If they are different, it indicates a change in the API endpoint,
    // and we need to reset the offset and offsetArray.
    // If they are the same, it means we are navigating the same API endpoint
    // with a different offset.
    if (globalUrl.current !== newUrl) {
      const res = await fetchAPI(newUrl); // Fetch data from the new API endpoint

      // Update the offsetArray and pagination state based on the response
      if (res.offset && res.offset !== undefined) {
        setOffsetArray(["", res.offset]);
        setPage("Next");
        // Initial page load with an offset, enabling only the 'Next' pagination option.
      } else if (res.offset === undefined) {
        setOffsetArray([""]);
        setPage("None");
        // Initial page load with no offset, disabling pagination.
      }

      offsetKey.current = newOffset; // Update the useRef offset key
      globalUrl.current = newUrl; // Update the useRef global URL
      setOffset(0); // Reset the offset to 0
      setData(res.records); // Update the data with new records to display
    } else if (
      globalUrl.current === newUrl &&
      offsetKey.current !== newOffset
    ) {
      const res = await fetchAPI(newUrl + newOffset); // Fetches data from the same API endpoint with a new offset.
      // Update the page state based on the response
      if (
        res.offset &&
        res.offset !== undefined &&
        offsetArray[offset - 1] !== undefined &&
        offset !== 0
      ) {
        setOffsetArray([...offsetArray, res.offset]);
        setPage("Next/Previous");
        // Determines if navigation to both the next and previous pages is possible and sets pagination accordingly.
      } else if (
        res.offset === undefined &&
        offsetArray[offset - 1] !== undefined &&
        offset !== 0
      ) {
        setPage("Previous");
        // Checks if a previous page exists but there is no next offset, setting pagination for 'Previous' only.
      } else {
        setPage("Next");
        // Handles the edge case where you return to the first page after navigating away.
      }

      offsetKey.current = newOffset; // Update the useRef offset key
      setData(res.records); // Update the data with new records to display
    }
  }

  // Function to simulate card removal with a delay for animation
  async function removingCards() {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(true); // Set loading state to true
        resolve();
      }, 750);
    });
  }

  // Function to simulate card addition with a delay for animation
  async function addingCards() {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false); // Set loading state to false
        resolve();
      }, 750);
    });
  }

  useEffect(() => {
    // Utilize useEffect to manage card updates whenever filters, search input, or offset change
    // A debounced timer is employed to prevent excessive fetch requests

    async function onStart() {
      if (cardDiv.current) {
        setOnRemove(true); // Set the card's onRemove animation
        await removingCards();
      }
    }

    onStart();

    // Use a debounce timeout to prevent multiple rapid requests
    const debounceTimeout = setTimeout(async () => {
      setOnRemove(false); // Stops removal animation
      await loadNewPage(); // Load a new page of data
      await addingCards(); // Starts additions animation
    }, 750);

    // Cleanup function to clear the debounce timeout when the component unmounts
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [
    // On any change of filters
    selectedManufacturer,
    selectedSKU,
    selectedFilter,
    minValue,
    maxValue,
    isRangeOn,
    // On any change of search input
    searchInput,
    // On any change of offset for navigation.
    offset,
  ]);

  return (
    <>
      {isLoading ? (
        // Display a loading spinner when isLoading is true
        <BigSpinner size={75} />
      ) : data && data.length ? (
        // When there is data, display the card container and create cards with data
        <div id="cardDiv" ref={cardDiv}>
          {data.map((item) => (
            <InStockCard
              item={item.fields}
              key={item.fields["Item ID"]}
              onRemove={onRemove}
              setOnRemove={setOnRemove}
            />
          ))}
        </div>
      ) : data && data.length === 0 ? (
        // Display a message when no results are found
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
