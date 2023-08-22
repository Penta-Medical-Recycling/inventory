import CardLister from "../Components/CardLister";
import LoadingSpinner from "../Components/LoadingSpinner";
import * as Papa from "papaparse";
import * as XLSX from "xlsx/xlsx.mjs";
import { useEffect, useState } from "react";

function Home({
  cartCount,
  setCartCount,
  isActive,
  setIsActive,
  selectedManufacturer,
  setSelectedManufacturer,
  selectedSKU,
  setSelectedSKU,
  minValue,
  maxValue,
  isOn,
}) {
  const [selectedFilter, setSelectedFilters] = useState({
    Prosthesis: false,
    Orthosis: false,
    Pediatric: false,
  });
  const [next, setNext] = useState("");
  const [offset, setOffset] = useState(0);
  const [offsetArray, setOffsetArray] = useState([""]);
  const [searchInput, setSearchInput] = useState("");
  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
  };
  const clearSearchInput = () => {
    setSearchInput("");
  };
  const [page, setPage] = useState("");
  const activeToggle = () => {
    setIsActive(!isActive);
  };
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchInput);

  const filterClick = (key) => {
    const newObj = { ...selectedFilter };
    newObj[key] = !selectedFilter[key];
    setSelectedFilters(newObj);
  };

  useEffect(() => {
    if (offset === 0 && offsetArray.length > 1) {
      setPage("Next");
    } else if (
      offsetArray[offset + 1] !== undefined &&
      offsetArray[offset - 1] !== undefined
    ) {
      setPage("Next/Previous");
    } else if (
      offsetArray[offset - 1] !== undefined &&
      offsetArray[offset + 1] === undefined
    ) {
      setPage("Previous");
    } else {
      setPage("None");
    }
  }, [offset, offsetArray]);

  const [isDropActive, setIsDropActive] = useState(false);

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setIsDropActive(!isDropActive);
  };

  async function createBlob(fileType) {
    console.log(fileType);
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

    let url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}?pageSize=99&filterByFormula=AND(`;
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
    url += ")&offset=";

    try {
      let header = "ID,Description,Size,Model/Type,Manufacturer\n";
      let data;
      do {
        let newUrl = url + next;
        const response = await fetch(newUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        data = await response.json();
        for (let i = 0; i < data.records.length; i++) {
          let record = data.records[i].fields;
          header += `"${record["Item ID"] || ""}","${record["Description (from SKU)"] || ""
            }","${record["Size"] || ""}","${record["Model/Type"] || ""}","${record["Manufacturer"] || ""
            }"\n`;
        }
        if (data.offset) {
          break;
          //   // setNext(data.offset);
          //   // we need to figure out how to download all the CSV data without an offset
          //   // right now its only the csv of up until the first 100.
        }
      } while (data.offset);

      if (fileType === "csv") {
        const blob = new Blob([header], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Inventory Data";
        link.click();
      } else {
        const { data: rows } = Papa.parse(header, { skipEmptyLines: true });
        const workbook = XLSX.utils.book_new();
        const sheetData = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, sheetData, "Sheet1");
        const wopts = { bookType: "xlsx", bookSST: false, type: "binary" };
        const wbout = XLSX.write(workbook, wopts);

        const s2ab = (s) => {
          const buf = new ArrayBuffer(s.length);
          const view = new Uint8Array(buf);
          for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xff;
          }
          return buf;
        };

        const blob = new Blob([s2ab(wbout)], {
          type: "application/octet-stream",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Inventory Data.xlsx";
        link.click();
      }
      setLoading(false);
      return data.records;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  return (
    <div className={isActive ? "sidebar-active" : ""}>
      <div id="text-section">
        <h1
          className="is-size-2 has-text-weight-bold has-text-centered"
          id="penta-title"
        >
          Penta Prosthetics Current Inventory
        </h1>
        <p
          className="my-6 mx-6 is-size-5 has-text-centered"
          style={{ width: "60%" }}
        >
          To submit a request, please click the “add to cart” button on the
          items card and visit the cart above. Then choose the partner you are
          and click request items.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div id="search-form">
            <form>
              <div className="field">
                <div className="control has-icons-left has-icons-right">
                  <input
                    className="input"
                    type="text"
                    placeholder="Search by description, size, or model/type"
                    value={searchInput}
                    onChange={onSearchChange}
                    style={{ width: "75vw" }}
                  />
                  <span className="icon is-small is-left">
                    <i className="fas fa-search"></i>
                  </span>
                  {searchInput && ( // Conditionally render clear button
                    <span
                      className="icon is-small is-right"
                      onClick={clearSearchInput}
                      id="search-clear"
                    >
                      <i className="fas fa-times"></i>
                    </span>
                  )}
                </div>
              </div>
            </form>
            <div className={`dropdown ${isDropActive ? "is-active" : ""}`}>
              <div className="dropdown-trigger">
                <button
                  className="button"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu3"
                  onClick={toggleDropdown}
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="1.5em"
                      viewBox="0 0 512 512"
                      id="download-button"
                    >
                      <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
                    </svg>
                  )}
                  <span className="icon is-small">
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                </button>
              </div>
              <div className="dropdown-menu" id="dropdown-menu3" role="menu" style={{ minWidth: '87px' }}>
                <div className="dropdown-content">
                  <a
                    className="dropdown-item"
                    onClick={() => createBlob("csv")}
                  >
                    .csv
                  </a>
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={() => createBlob("xlsx")}
                  >
                    .xlsx
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="filter-buttons">
          <div
            className={
              selectedFilter["Prosthesis"]
                ? "filter-selected filter-3"
                : "filter-3"
            }
            onClick={() => filterClick("Prosthesis")}
          >
            <p>Prosthesis</p>
          </div>
          <div
            className={
              selectedFilter["Orthosis"]
                ? "filter-selected filter-3"
                : "filter-3"
            }
            onClick={() => filterClick("Orthosis")}
          >
            <p>Orthosis</p>
          </div>
          <div
            className={
              selectedFilter["Pediatric"]
                ? "filter-selected filter-3"
                : "filter-3"
            }
            onClick={() => filterClick("Pediatric")}
          >
            <p>Pediatric</p>
          </div>
          <div
            id="filter-button"
            onClick={activeToggle}
            className={
              isOn || selectedManufacturer.length || selectedSKU.length
                ? "filter-button-active"
                : ""
            }
          >
            <p>Filters</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height=".65em"
              viewBox="0 0 512 512"
            >
              <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" />
            </svg>
          </div>
        </div>
        <p className="my-6 mx-6 has-text-centered">
          If you would like to download a copy of the current page click the
          icon to the right of the search bar.
        </p>
      </div>
      {page === "Next" ? (
        // <div className="is-flex is-justify-content-center">
        //   <nav className="pagination" role="navigation" aria-label="pagination">
        //     <a
        //       className="pagination-next"
        //       onClick={() => setOffset(offset + 1)}
        //     >
        //       Next ⊳
        //     </a>
        //   </nav>
        // </div>
        <div className="is-flex is-justify-content-center is-align-items-center">
          <div style={{marginLeft: '33px' }} className='is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag'>
            <p>{offset + 1}</p>
          </div>
          <p className="is-size-4 ml-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset + 1)}><i className="fas fas fa-angle-double-right"></i></p>
        </div>
      ) : page === "Previous" ? (
        // <div className="is-flex is-justify-content-center">
        //   <nav className="pagination" role="navigation" aria-label="pagination">
        //     <a
        //       className="pagination-previous"
        //       onClick={() => setOffset(offset - 1)}
        //     >
        //       ⊲ Previous
        //     </a>
        //   </nav>
        // </div>
        <div className="is-flex is-justify-content-center is-align-items-center">
          <p className="is-size-4 mr-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset - 1)}><i className="fas fas fa-angle-double-left"></i></p>
          <div style={{ marginRight: '25px' }} className='is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag'>
            <p>{offset + 1}</p>
          </div>
        </div>
      ) : page === "Next/Previous" ? (
        // <div className="is-flex is-justify-content-center">
        //   <nav
        //     className="pagination is-centered"
        //     role="navigation"
        //     aria-label="pagination"
        //   >
        //     <a
        //       className="pagination-previous"
        //       onClick={() => setOffset(offset - 1)}
        //     >
        //       ⊲ Previous
        //     </a>
        //     <a
        //       className="pagination-next"
        //       onClick={() => setOffset(offset + 1)}
        //     >
        //       Next ⊳
        //     </a>
        //   </nav>
        // </div>
        <div className="is-flex is-justify-content-center is-align-items-center">
          <p className="is-size-4 mr-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset - 1)}><i className="fas fas fa-angle-double-left"></i></p>
          <div className='is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag'>
            <p>{offset + 1}</p>
          </div>
          <p className="is-size-4 ml-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset + 1)}><i className="fas fas fa-angle-double-right"></i></p>
        </div>
      ) : (
        <></>
      )
      }
      <CardLister
        cartCount={cartCount}
        setCartCount={setCartCount}
        selectedManufacturer={selectedManufacturer}
        setSelectedManufacturer={setSelectedManufacturer}
        selectedSKU={selectedSKU}
        setSelectedSKU={setSelectedSKU}
        selectedFilter={selectedFilter}
        offsetArray={offsetArray}
        setOffsetArray={setOffsetArray}
        offset={offset}
        setOffset={setOffset}
        // setCsv={setCsv}
        minValue={minValue}
        maxValue={maxValue}
        isOn={isOn}
        searchInput={searchInput}
        debouncedSearchValue={debouncedSearchValue}
        setDebouncedSearchValue={setDebouncedSearchValue}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      {page === "Next" ? (
        // <div className="is-flex is-justify-content-center">
        //   <nav className="pagination" role="navigation" aria-label="pagination">
        //     <a
        //       className="pagination-next"
        //       onClick={() => setOffset(offset + 1)}
        //     >
        //       Next ⊳
        //     </a>
        //   </nav>
        // </div>
        <div className="is-flex is-justify-content-center is-align-items-center">
          <div style={{ marginLeft: '25px' }} className='is-flex is-justify-content-center is-align-items-center has-text-weight-bold  is-size-5 num-pag'>
            <p>{offset + 1}</p>
          </div>
          <p className="is-size-4 ml-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset + 1)}><i className="fas fas fa-angle-double-right"></i></p>
        </div>
      ) : page === "Previous" ? (
        // <div className="is-flex is-justify-content-center">
        //   <nav className="pagination" role="navigation" aria-label="pagination">
        //     <a
        //       className="pagination-previous"
        //       onClick={() => setOffset(offset - 1)}
        //     >
        //       ⊲ Previous
        //     </a>
        //   </nav>
        // </div>
        <div className="is-flex is-justify-content-center is-align-items-center">
          <p className="is-size-4 mr-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset - 1)}><i className="fas fas fa-angle-double-left"></i></p>
          <div style={{ marginRight: '25px' }} className='is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag'>
            <p>{offset + 1}</p>
          </div>
        </div>
      ) : page === "Next/Previous" ? (
        // <div className="is-flex is-justify-content-center">
        //   <nav
        //     className="pagination is-centered"
        //     role="navigation"
        //     aria-label="pagination"
        //   >
        //     <a
        //       className="pagination-previous"
        //       onClick={() => setOffset(offset - 1)}
        //     >
        //       ⊲ Previous
        //     </a>
        //     <a
        //       className="pagination-next"
        //       onClick={() => setOffset(offset + 1)}
        //     >
        //       Next ⊳
        //     </a>
        //   </nav>
        // </div>
        <div className="is-flex is-justify-content-center is-align-items-center">
          <p className="is-size-4 mr-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset - 1)}><i className="fas fas fa-angle-double-left"></i></p>
          <div className='is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag'>
            <p>{offset + 1}</p>
          </div>
          <p className="is-size-4 ml-3 is-text-weight-bold" style={{ cursor: 'pointer' }} onClick={() => setOffset(offset + 1)}><i className="fas fas fa-angle-double-right"></i></p>
        </div>
      ) : (
        <></>
      )
      }
    </div >
  );
}

export default Home;
