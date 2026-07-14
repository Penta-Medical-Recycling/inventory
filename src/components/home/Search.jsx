import { useContext } from "react";
import { Search as SearchIcon, X as XIcon } from "lucide-react";
import PentaContext from "../../context/PentaContext";
import DownloadButton from "./DownloadButton";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

// Search component used for searching through the inventory.

const Search = () => {
  const { searchInput, setSearchInput } = useContext(PentaContext);

  // Handler for input changes in the search bar.
  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Clear the search input.
  const clearSearchInput = () => {
    setSearchInput("");
  };

  return (
    <div id="search-form">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mr-3 flex-1"
      >
        {/* Override the theme ring (Penta coral) with the blue theme locally so
            the search box focuses blue instead of orange. */}
        <InputGroup className="h-9 w-full rounded-full bg-white [--ring:#35b0fb] has-[[data-slot=input-group-control]:focus-visible]:border-input">
          {/* Search Icon */}
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>

          {/* Search Input */}
          <InputGroupInput
            type="text"
            placeholder="Search"
            className="pl-3"
            value={searchInput}
            onChange={onSearchChange}
          />

          {/* Clear Search Button */}
          {searchInput && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                id="search-clear"
                aria-label="ClearSearch"
                size="icon-xs"
                onClick={clearSearchInput}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </form>
      {/* Download Button Component */}
      <DownloadButton></DownloadButton>
    </div>
  );
};

export default Search;
