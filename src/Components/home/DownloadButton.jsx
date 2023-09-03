import React, { useContext, useRef, useEffect } from "react";
import PentaContext from "../../context/PentaContext";
import LittleSpinner from "../../assets/LittleSpinner";
import * as XLSX from "xlsx";

const DownloadButton = ({}) => {
  const {
    isDropActive,
    setIsDropActive,
    loading,
    setLoading,
    urlCreator,
    fetchAPI,
  } = useContext(PentaContext);

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setIsDropActive(!isDropActive);
  };

  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function createBlob(fileType) {
    setLoading(true);
    (async () => {
      const base = urlCreator().replace("pageSize=36&", "");
      let url = base;
      let allRecords = [];
      let shouldContinue = true;

      while (shouldContinue) {
        const { records, offset } = await fetchAPI(url);

        allRecords = allRecords.concat(records);

        if (offset) {
          url = `${base}&offset=${offset}`;
        } else {
          shouldContinue = false;
        }
      }

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

  return (
    <div
      className={`dropdown loading-effect ${isDropActive ? "is-active" : ""}`}
      ref={dropdownRef}
      style={{ animationDelay: "0.428s", zIndex: 1 }}
    >
      <div className="dropdown-trigger">
        <button
          className="button is-rounded dropdown-download"
          aria-haspopup="true"
          aria-controls="dropdown-menu3"
          onClick={toggleDropdown}
        >
          {loading ? (
            <LittleSpinner size={30} />
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
      <div
        className="dropdown-menu"
        id="dropdown-menu3"
        role="menu"
        style={{ minWidth: "87px" }}
      >
        <div className="dropdown-content">
          <a
            className="dropdown-item"
            onClick={() => {
              createBlob("csv");
              setIsDropActive(false);
            }}
          >
            .csv
          </a>
          <a
            href="#"
            className="dropdown-item"
            onClick={() => {
              createBlob("xlsx");
              setIsDropActive(false);
            }}
          >
            .xlsx
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadButton;
