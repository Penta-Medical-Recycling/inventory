import { useContext } from "react";
import PentaContext from "../../context/PentaContext";
import LittleSpinner from "../../assets/LittleSpinner";
import DownloadLogo from "../../assets/DownloadLogo";
import { ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// DownloadButton component is used for downloading the current inventory

const DownloadButton = () => {
  const { isDownloading, setIsDownloading, urlCreator, fetchAPI } =
    useContext(PentaContext);

  /**
   * Create and initiate the download of a blob containing inventory data in the chosen file format.
   *
   * @param {string} fileType - The file format for the download (either 'csv' or 'xlsx').
   */
  async function createBlob(fileType) {
    // Set the animation state to indicate the download process has started.
    setIsDownloading(true);

    // Asynchronously fetch and process the data for download.
    (async () => {
      // Generate the base URL for fetching data.
      // If there are no active search or filters, the base URL will fetch the entire inventory.
      // Otherwise, the base URL will retrieve items that match the applied search and filters criteria.
      const base = urlCreator().replace("pageSize=36&", ""); // Removes the page size limit to reduce the number of fetch requests.
      let url = base;
      let allRecords = [];
      let shouldContinue = true;

      // Retrieve all records from AirTable, paginating if necessary.
      while (shouldContinue) {
        const { records, offset } = await fetchAPI(url);
        allRecords = allRecords.concat(records);

        if (offset) {
          url = `${base}&offset=${offset}`;
        } else {
          shouldContinue = false;
        }
      }

      // Fills the data for empty values.
      const mappedData = allRecords.map((e) => [
        e.fields["Item ID"] || "",
        e.fields["Description (from SKU)"] || "",
        e.fields["Size"] || "",
        e.fields["Model/Type"] || "",
        e.fields["Name (from Manufacturer)"] || "",
      ]);

      // Formats the data for download as stringified CSV format.
      const allContent = [
        "ID,Description,Size,Model/Type,Manufacturer",
        ...mappedData.map((row) => `"${row.join('","')}"`),
      ].join("\n");

      // Helper function to initiate the download of a blob.
      const downloadBlob = (blob, filename) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      };

      // Helper function to convert a string to an ArrayBuffer.
      const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
          view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
      };

      // Download data in the chosen format (CSV or XLSX).
      if (fileType === "csv") {
        const blob = new Blob([allContent], { type: "text/csv" });
        downloadBlob(blob, "Inventory Data.csv");
      } else {
        // XLSX
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

      // Stop animation to indicate the download process has completed.
      setIsDownloading(false);
    })();
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Download"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "gap-2 rounded-full px-4 [&_svg:not([class*='size-'])]:size-6"
          )}
        >
          {/* Loading spinner while downloading, otherwise the download icon. */}
          {isDownloading ? <LittleSpinner size={24} /> : <DownloadLogo />}
          <ChevronDown className="size-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => createBlob("csv")}>
            .csv
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => createBlob("xlsx")}>
            .xlsx
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DownloadButton;
