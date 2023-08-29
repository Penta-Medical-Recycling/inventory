const VITE_REACT_APP_API_KEY =
  "patpkhRO7lyyS9ZGB.95b84cd768a9bfdb155c53bb91a9cf29f3ee0b9b2256dc105ff04c962ebb88a3";

async function fetchAPI(url, apiKey) {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

// fetchAPI(
//   "https://api.airtable.com/v0/appnx8gtnlQx5b7nI/Inventory?filterByFormula=OR({Requests}=BLANK(),{Shipment Status}=BLANK())",
//   VITE_REACT_APP_API_KEY
// );

async function fetchTableRecords(tableName, apiKey, offset = null) {
  const baseId = "appBrTbPbyamI0H6Z";
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?${
    offset ? `offset=${offset}` : ""
  }`;

  return fetchAPI(url, apiKey);
}

// fetchTableRecords("SKUs", VITE_REACT_APP_API_KEY);

async function fetchTableRecordsWithOffset(tableName, apiKey) {
  let allRecords = [];
  let offset = null;

  do {
    const { records, offset: newOffset } = await fetchTableRecords(
      tableName,
      apiKey,
      offset
    );
    allRecords = allRecords.concat(records);
    offset = newOffset;
  } while (offset);
  console.log(allRecords.length);
  return allRecords;
}

// fetchTableRecordsWithOffset("SKUs", VITE_REACT_APP_API_KEY);

// console.log(await fetchSelectOptions("Partners", VITE_REACT_APP_API_KEY));

const requestButton = async (event) => {
  setIsLoading(true);
  event.preventDefault();
  setOutOfStock(new Set());

  const stockCheck = await idFetcher(apiKey);

  if (stockCheck) {
    Toast({
      message:
        "Sorry but one or more of your items are out of stock, please remove to checkout.",
      type: "is-danger",
    });
    setIsLoading(false);
    return;
  }

  // Rest of your code...
};
