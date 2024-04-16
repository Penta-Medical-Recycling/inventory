import { useState } from "react";
import PentaContext from "./PentaContext";
import Cookies from "js-cookie";

function PentaProvider({ children }) {
  // Initialize selectedPartner from localStorage if available; otherwise, default to an empty string.
  const [selectedPartner, setSelectedPartner] = useState(
    localStorage.getItem("partner") || ""
  );

  // Checking for first-visit of user on webpage and state for toggling the pop-up content
  const [showModal, setShowModal] = useState(false);
  const hasVisited = Cookies.get('hasVisited');
  if (!hasVisited) {
    setShowModal(true);
    Cookies.set('hasVisited', true, { expires : 1 })
  }

  // Count the number of items in the cart. Items are stored as stringified JSON objects with Item IDs as keys.
  // Exclude 'partner' and 'notes' keys from localStorage when counting.
  const [cartCount, setCartCount] = useState(
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
      .length
  );

  // Set the animation state for when an item is added to the cart.
  const [isCartPressed, setIsCartPressed] = useState(false);

  // Control the visibility of the sidebar.
  const [isSideBarActive, setIsSideBarActive] = useState(false);

  // Define the largestSize as fetched from the inventory, used to validate the size range toggle.
  const [largestSize, setLargestSize] = useState(60);

  // Controls the which pagination buttons should be displayed, 'Next', 'Previous', 'Next/Previous' and 'None'
  const [page, setPage] = useState();

  // Manage loading animation state for .csv and .xlsx downloads.
  const [isDownloading, setIsDownloading] = useState(false);

  // Manage loading animation state for cards.
  const [isLoading, setIsLoading] = useState(false);

  // Track the state of the download dropdown menu.
  const [isDropActive, setIsDropActive] = useState(false);

  // Initialize the data that populates the homepage cards.
  const [data, setData] = useState();

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Changes in the following variables impact the AirTable API endpoint, fetching new homepage data.
  // They are used for creating a filter formula parameter.

  // Input for searching through the inventory.
  const [searchInput, setSearchInput] = useState("");

  // Track the selection of general tags: 'Prosthesis', 'Orthosis', and 'Pediatric'.
  const [selectedFilter, setSelectedFilters] = useState({
    Prosthesis: false,
    Orthosis: false,
    Pediatric: false,
  });

  // Track the selection of specific manufacturers for filtering.
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);

  // Track the selection of specific descriptions from SKUs for filtering.
  const [selectedSKU, setSelectedSKU] = useState([]);

  // Track the selected size range, with default values.
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(55);

  // Toggle the size range filter.
  const [isRangeOn, setIsRangeOn] = useState(false);

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // These variables are related to homepage data presentation and pagination, not affecting the AirTable API endpoint.
  // AirTable paginates with 100 records per request, managed using offsets.
  // Offset keys are stored in offsetArray to navigate pages forwards or backwards.
  // Example offsetArray: ['', 'itrSAerEy3AXVYmaf/recMidLQr5gU02F47', 'itrSAerEy3AXVYmaf/recBgrc23ryjE96JS', 'itrSAerEy3AXVYmaf/rechvSQ6GtO85SpRF']
  // The 'offset' variable tracks pagination; page number is 'offset + 1'.
  // If 'offset' is 0, the parameter is 'offset=', if 'offset' is 2, it becomes 'offset=itrSAerEy3AXVYmaf/recBgrc23ryjE96JS'.

  // Set the offset for a specific AirTable endpoint.
  const [offset, setOffset] = useState(0);

  // Maintain an offsetArray to keep track of pagination.
  const [offsetArray, setOffsetArray] = useState([""]);
  ////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Creates a URL for querying data from the AirTable API based on user-selected filters and search criteria.
   *
   * @returns {string} The generated URL for data retrieval.
   */
  function urlCreator() {
    // Define the base URL for the AirTable API.
    const baseUrl = "https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?";

    // Define sorting criteria for the API query by oldest to newest available items.
    const sort = `sort[0][field]=Item ID&sort[0][direction]=asc`;

    // Define the page size for pagination.
    const pageSize = "pageSize=36";

    // Initialize the filter function for the API query.
    let filterFunction = "filterByFormula=";

    // Define an array of filters to be applied to the query.
    // Initial filters are for fetching in-stock items
    const filters = [
      "{Requests}=BLANK()", // Filter for items with no requests.
      "{Shipment Status}=BLANK()", // Filter for items with no shipment status.
      'NOT({SKU}="")', // Filter for items with a non-empty SKU.
    ];

    // Extract SKUs from selectedSKU and add them to the filters if any are selected.
    const skus = selectedSKU.map((option) => option.value);
    if (skus.length > 0) {
      filters.push(`OR(${skus.map((sku) => `{SKU}='${sku}'`).join(",")})`);
    }

    // Extract manufacturers from selectedManufacturer and add them to the filters if any are selected.
    const manufacturers = selectedManufacturer.map((option) => option.value);
    if (manufacturers.length > 0) {
      filters.push(
        `OR(${manufacturers
          .map((manufacturer) => `{Manufacturer}='${manufacturer}'`)
          .join(",")})`
      );
    }

    // Extract selected tags and add them to the filters if any are selected.
    const selectedTags = Object.keys(selectedFilter).filter(
      (key) => selectedFilter[key]
    );
    if (selectedTags.length > 0) {
      filters.push(
        `OR(${selectedTags.map((tag) => `{Tag}='${tag}'`).join(",")})`
      );
    }

    // Add a filter for size range if the size range filter is active.
    if (isRangeOn) {
      filters.push(`AND({Size} >= ${minValue}, {Size} <= ${maxValue})`);
    }

    // If a search query is provided, create search conditions based on user input.
    if (searchInput) {
      // Split the search input into lowercase words, removing the term "size."
      const searchTerms = searchInput
        .toLowerCase()
        .split(" ")
        .filter((term) => term !== "size");

      // Create search conditions for each word in the search input.
      const searchConditions = searchTerms.map(
        (term) => `SEARCH("${term}", {StringSearch})`
      );

      // Combine the search conditions with an 'AND' operator to search for exact matches in the airTable 'StringSearch' column.
      filters.push(`AND(${searchConditions.join(",")})`);
      // For reference, this is the StringSearch formula, with all the searchable fields:
      //LOWER(CONCATENATE({Item ID}, " ", {Model/Type}, " ", Size, " ", Manufacturer, " ", SKU, " ", Tag, " ", {Description (from SKU)}))
    }

    // Concatenate the filter conditions and encode them for the API request.
    filterFunction += `${encodeURIComponent("AND(" + filters.join(",") + ")")}`;
    // Combine all the URL components and return the final URL for data retrieval.
    return baseUrl + [pageSize, sort, filterFunction].join("&");
  }

  // Retrieve the API key from environment variables.
  const APIKey = import.meta.env.VITE_REACT_APP_API_KEY;

  /**
   * Fetch data from a specified URL using the provided API key for authorization.
   *
   * @param {string} url - The URL to fetch data from.
   * @returns {Promise} A promise that resolves to the fetched data or null in case of an error.
   */
  async function fetchAPI(url) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${APIKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  /**
   * Fetch records from a specified AirTable table with optional pagination offset.
   *
   * @param {string} tableName - The name of the AirTable table to fetch records from.
   * @param {string|null} offset - Optional pagination offset for fetching more records.
   * @returns {Promise} A promise that resolves to the fetched records or null in case of an error.
   */
  async function fetchTableRecords(tableName, offset = null) {
    const baseId = "appHFwcwuXLTNCjtN";
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?${
      offset ? `offset=${offset}` : ""
    }`;

    return fetchAPI(url);
  }

  /**
   * Fetch all records from a specified AirTable table with pagination handled automatically.
   *
   * @param {string} tableName - The name of the AirTable table to fetch records from.
   * @returns {Promise} A promise that resolves to an array containing all fetched records or null in case of an error.
   */
  async function fetchTableRecordsWithOffset(tableName) {
    let allRecords = [];
    let offset = null;

    do {
      const { records, offset: newOffset } = await fetchTableRecords(
        tableName,
        offset
      );
      allRecords = allRecords.concat(records);
      offset = newOffset;
    } while (offset);
    return allRecords;
  }

  /**
   * Fetches the maximum size available in the inventory to set the upper limit on the range filter.
   *
   * @returns {Promise} A promise that resolves to the maximum size found in the inventory or null if no data is found.
   */
  async function fetchMaxSize() {
    const url = `https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?pageSize=1&sort[0][field]=Size&sort[0][direction]=desc&filterByFormula=AND(AND({Requests}="",{Shipment Status}=""),NOT({SKU}=""))`;

    const data = await fetchAPI(url);
    if (data && data.records && data.records.length > 0) {
      return data.records[0].fields.Size;
    }
    return null;
  }

  /**
   * Fetch and transform select options based on a specified field from AirTable records.
   *
   * @param {string} fieldToMap - The field name to fetch select options from.
   * @returns {Array} An alphabetized array of select options in the correct formats for dropdowns.
   */
  const fetchSelectOptions = async (fieldToMap) => {
    // Fetch records from the specified field in AirTable.
    const records = await fetchTableRecordsWithOffset(fieldToMap);

    // Transform and sort the records based on the specified field.
    // The format records by trimming whitespace and sorting them alphabetically
    if (fieldToMap === "Manufacturers") {
      return records
        .map((e) => {
          return {
            label: e.fields.Name.trimStart(),
            value: encodeURIComponent(e.fields.Name.trimStart()),
          };
        })
        .sort((a, b) => {
          return a.label.localeCompare(b.label);
        });
    } else if (fieldToMap === "SKUs") {
      return records
        .map((e) => {
          return {
            label: e.fields.Description || "VOID", //"VOID" for empty Descriptions
            value: encodeURIComponent(e.fields["Item Code"].trimStart()),
          };
        })
        .sort((a, b) => {
          return a.label.localeCompare(b.label);
        });
    } else {
      // For Partner Selection
      return records
        .map((e) => e.fields.Name.trimStart())
        .sort((a, b) => a.localeCompare(b));
    }
  };

  let contextValues = {
    selectedPartner,
    setSelectedPartner,
    cartCount,
    setCartCount,
    isCartPressed,
    setIsCartPressed,
    isSideBarActive,
    setIsSideBarActive,
    selectedManufacturer,
    setSelectedManufacturer,
    selectedSKU,
    setSelectedSKU,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    largestSize,
    setLargestSize,
    isRangeOn,
    setIsRangeOn,
    page,
    setPage,
    offset,
    offsetArray,
    setOffsetArray,
    setOffset,
    searchInput,
    setSearchInput,
    isDownloading,
    setIsDownloading,
    isLoading,
    setIsLoading,
    isDropActive,
    urlCreator,
    setIsDropActive,
    selectedFilter,
    setSelectedFilters,
    fetchAPI,
    fetchTableRecords,
    fetchTableRecordsWithOffset,
    fetchSelectOptions,
    fetchMaxSize,
    data,
    setData,
    showModal,
    setShowModal
  };

  return (
    <PentaContext.Provider value={contextValues}>
      {children}
    </PentaContext.Provider>
  );
}

export default PentaProvider;
