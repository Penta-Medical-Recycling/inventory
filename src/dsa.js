async function fetchData() {
  let url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}?pageSize=36&sort%5B0%5D%5Bfield%5D=Item%20ID&sort%5B0%5D%5Bdirection%5D=asc&filterByFormula=AND(`;
  const skus = selectedSKU.map((option) => option.value);
  const manufacturers = selectedManufacturer.map((option) => option.value);
  const selectedTags = Object.keys(selectedFilter).filter(
    (key) => selectedFilter[key]
  );

  url += 'AND({Requests}=BLANK(),{Shipment Status}=BLANK()),NOT({SKU}="")';

  if (
    skus.length > 0 ||
    manufacturers.length > 0 ||
    selectedTags.length > 0 ||
    isOn ||
    debouncedSearchValue
  ) {
    if (skus.length > 0) {
      url += `,OR(${skus.map((sku) => `{SKU}='${sku}'`).join(",")})`;
    }
    if (manufacturers.length > 0) {
      url += `,OR(${manufacturers
        .map((manufacturer) => `{Manufacturer}='${manufacturer}'`)
        .join(",")})`;
    }
    if (selectedTags.length > 0) {
      url += `,OR(${selectedTags.map((tag) => `{Tag}='${tag}'`).join(",")})`;
    }
    if (isOn) {
      url += `,AND({Size} >= ${minValue}, {Size} <= ${maxValue})`;
    }
    if (debouncedSearchValue) {
      const searchTerms = debouncedSearchValue
        .toLowerCase()
        .split(" ")
        .filter((a) => a !== "size");
      const searchConditions = searchTerms.map(
        (term) => `SEARCH("${term}", {Concat2})`
      );
      url += `,AND(${searchConditions.join(",")})`;
    }
  }
  url += ")&offset=" + offsetArray[offset];

  ////////////////////////////////
  const data = await response.json();
  if (data.offset && !offsetArray[offset + 1]) {
    setOffsetArray([...offsetArray, data.offset]);
  }
  ////////////////////////////////
}

const idFetcher = async () => {
  for (let [key, value] of Object.entries(localStorage)) {
    if (key !== "partner" && key !== "notes") {
      const parse = JSON.parse(value);
      const itemID = parse["Item ID"];
      if (itemID !== undefined) {
        ids.push(itemID);
      }
    }
  }
  const idSet = new Set();

  for (const id of ids) {
    const searchString = `SEARCH("${id}", {StringSearch})`;
    const url = `https://api.airtable.com/v0/appBrTbPbyamI0H6Z/Requests?filterByFormula=${encodeURIComponent(
      searchString
    )}&maxRecords=1`;

    ////////////////////////////////
    if (data.records && data.records.length > 0) {
      idSet.add(id);
    }
    ////////////////////////////////
  }
  ////////////////////////////////
  setOutOfStock(idSet);
  if (idSet.size > 0) {
    return true;
  } else {
    return false;
  }
  ////////////////////////////////
};

async function createBlob(fileType) {
  setLoading(true);
  const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
  const baseId = "appnx8gtnlQx5b7nI";
  const tableName = "Inventory";
  const encodedTableName = encodeURIComponent(tableName);
  const skus = selectedSKU.map((option) => option.value);
  const manufacturers = selectedManufacturer.map((option) => option.value);
  const selectedTags = Object.keys(selectedFilter).filter(
    (key) => selectedFilter[key]
  );

  let url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}?sort%5B0%5D%5Bfield%5D=Item%20ID&sort%5B0%5D%5Bdirection%5D=asc&filterByFormula=AND(`;
  url += 'AND({Requests}=BLANK(),{Shipment Status}=BLANK()),NOT({SKU}="")';

  if (
    skus.length > 0 ||
    manufacturers.length > 0 ||
    selectedTags.length > 0 ||
    isOn ||
    debouncedSearchValue
  ) {
    if (skus.length > 0) {
      url += `,OR(${skus.map((sku) => `{SKU}='${sku}'`).join(",")})`;
    }
    if (manufacturers.length > 0) {
      url += `,OR(${manufacturers
        .map((manufacturer) => `{Manufacturer}='${manufacturer}'`)
        .join(",")})`;
    }
    if (selectedTags.length > 0) {
      url += `,OR(${selectedTags.map((tag) => `{Tag}='${tag}'`).join(",")})`;
    }
    if (isOn) {
      url += `,AND({Size} >= ${minValue}, {Size} <= ${maxValue})`;
    }
    if (debouncedSearchValue) {
      const searchTerms = debouncedSearchValue.toLowerCase().split(" ");
      const searchConditions = searchTerms.map(
        (term) => `SEARCH("${term}", {Concat2})`
      );
      url += `,AND(${searchConditions.join(",")})`;
    }
  }

  async function fetchTableRecords(offset = null) {
    const newUrl = url + `)&offset=${offset || ""}`;

    const response = await fetch(newUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();
    const records = data.records;

    return {
      records,
      offset: data.offset || undefined,
    };
  }

  (async () => {
    let allRecords = [];
    let offset = null;

    do {
      const { records, offset: newOffset } = await fetchTableRecords(offset);
      allRecords = allRecords.concat(records);
      offset = newOffset;
    } while (offset);

    const mappedData = allRecords.map((e) => [
      e.fields["Item ID"] || "",
      e.fields["Description (from SKU)"] || "",
      e.fields["Size"] || "",
      e.fields["Model/Type"] || "",
      e.fields["Manufacturer"] || "",
    ]);

    const allContent = [
      "ID,Description,Size,Model/Type,Manufacturer",
      ...mappedData.map((row) => `"${row.join('","')}"`),
    ].join("\n");

    const downloadBlob = (blob, filename) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    };

    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    if (fileType === "csv") {
      const blob = new Blob([allContent], { type: "text/csv" });
      downloadBlob(blob, "Inventory Data.csv");
    } else {
      const workbook = XLSX.utils.book_new();
      const sheetData = [
        ["ID", "Description", "Size", "Model/Type", "Manufacturer"],
        ...mappedData,
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const wbout = XLSX.write(workbook, {
        bookType: "xlsx",
        bookSST: false,
        type: "binary",
      });
      const blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream",
      });
      downloadBlob(blob, "Inventory Data.xlsx");
    }
    setLoading(false);
  })();
}

const requestButton = async (event) => {
  setIsLoading(true);
  event.preventDefault();
  setOutOfStock(new Set());
  const stockCheck = await idFetcher();

  if (stockCheck) {
    Toast({
      message:
        "Sorry but one or more of your items are out of stock, please remove to checkout.",
      type: "is-danger",
    });
    setIsLoading(false);
    return;
  }
  const BaseID = "appBrTbPbyamI0H6Z";
  const tableName = "Requests";
  setErrorMessage("");
  const items = [];
  Object.entries(localStorage).forEach(([key, value]) => {
    if (key !== "partner" && key !== "notes")
      items.push(JSON.parse(value)["Item ID"]);
  });
  const url = `https://api.airtable.com/v0/${BaseID}/${tableName}`;
  const data = {
    records: [
      {
        fields: {
          Name: "temp value",
          Partner: localStorage["partner"],
          "Additional Notes": notes,
          "Items You Would Like": items,
        },
      },
    ],
    typecast: true,
  };

  fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${APIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("Error:", data.error);
        setErrorMessage("Error: " + data.error.message);
      } else {
        console.log("Success:", data);
        setNotes("");
        setCartCount(0);
        const partner = localStorage["partner"];
        localStorage.clear();
        localStorage.setItem("partner", partner);
        setIsLoading(false);
        Toast({
          message:
            "Thank you for your time, we will get back to you as soon as possible!",
          type: "is-info",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      setNotes("Error");
    });
};

// (baseId, tableName, queryParams, headers)
//const url = `https://api.airtable.com/v0/${baseId}/${tableName}?${queryParams}`;

//POST Headers
// {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${APIKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   }

// global URL ? that any time that specifc endpoint change then you do one final refresh?
// a specific one as well just for creating offsets, clone of that one
