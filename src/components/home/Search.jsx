import React, { useContext } from "react";
import PentaContext from "../../context/PentaContext";
import DownloadButton from "./DownloadButton";

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
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <div
            className="control has-icons-left has-icons-right loading-effect"
            style={{ animationDelay: "0.321s" }}
          >
            {/* Search Input */}
            <input
              className="input is-rounded mr-3 search-bar"
              type="text"
              placeholder="Search ..."
              value={searchInput}
              onChange={onSearchChange}
            />
            {/* Search Icon */}
            <span className="icon is-small is-left">
              <i className="fas fa-search"></i>
            </span>
            {/* Clear Search Button */}
            {searchInput && (
              <span
                className="icon is-small is-right"
                onClick={clearSearchInput}
                id="search-clear"
              >
                <i className="fas fa-times mr-5"></i>
              </span>
            )}
          </div>
        </div>
      </form>
      {/* Download Button Component */}
      <DownloadButton></DownloadButton>
    </div>
  );
};

export default Search;
