import React, { useContext, useRef, useEffect } from "react";
import PentaContext from "../../context/PentaContext";
import LittleSpinner from "../../assets/LittleSpinner";
import DownloadLogo from "../../assets/DownloadLogo";
import * as XLSX from "xlsx";

const DownloadButton = ({}) => {
  const {
    isDropActive,
    setIsDropActive,
    isDownloading,
    setIsDownloading,
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
    setIsDownloading(true);
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
      setIsDownloading(false);
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
          aria-label="Download"
          role="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu3"
          onClick={toggleDropdown}
        >
          {isDownloading ? (
            <LittleSpinner size={30} />
          ) : (
            <DownloadLogo></DownloadLogo>
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
            href="#"
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
