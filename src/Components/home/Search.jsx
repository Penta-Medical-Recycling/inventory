import React, { useContext } from "react";
import PentaContext from "../../context/PentaContext";
import DownloadButton from "./DownloadButton";

const Search = ({}) => {
  const { searchInput, setSearchInput } = useContext(PentaContext);

  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const clearSearchInput = () => {
    setSearchInput("");
  };

  return (
    <div id="search-form">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <div
            className="control has-icons-left has-icons-right loading-effect"
            style={{ animationDelay: "0.5s" }}
          >
            <input
              className="input is-rounded mr-3 search-bar"
              type="text"
              placeholder="Search by description, size, or model/type"
              value={searchInput}
              onChange={onSearchChange}
            />
            <span className="icon is-small is-left">
              <i className="fas fa-search"></i>
            </span>
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
      <DownloadButton></DownloadButton>
    </div>
  );
};

export default Search;
