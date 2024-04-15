import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PentaContext from "../context/PentaContext";

// Partner Page allows the user to select a partner to view their cart

const Partner = () => {
  const { setSelectedPartner, fetchSelectOptions } = useContext(PentaContext);
  const [isActive, setIsActive] = useState(false); // Dropdown menu active state
  const [searchTerm, setSearchTerm] = useState(""); // Search term for partner selection
  const [partner, setPartner] = useState(""); // Selected partner
  const navigate = useNavigate();
  const [data, setData] = useState([]); // List of partner options

  const containerRef = useRef(null);

  // Close the dropdown when clicking outside of it
  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (event) => {
      handleClickOutside(event);
    };

    // Add or remove event listener based on dropdown state
    if (isActive) {
      document.addEventListener("mousedown", handleDocumentClick);
    } else {
      document.removeEventListener("mousedown", handleDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isActive]);

  useEffect(() => {
    // Fetch partner options from AirTable
    const fetchPartners = async () => {
      const partnerOptions = await fetchSelectOptions("Partners");
      setData(partnerOptions);
    };
    fetchPartners();
  }, []);

  // Handle search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle click on a partner option
  const handleOptionClick = (option) => {
    setPartner(option);
    setIsActive(false);
  };

  // Filter partner options based on the search term
  const filteredOptions = data.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle the dropdown visibility
  const dropDown = () => {
    setIsActive(!isActive);
  };

  // Prevent the dropdown from closing when clicking on the search input
  const handleSearchClick = (event) => {
    event.stopPropagation();
  };

  // Submit selected partner to localStorage and navigate to Cart page
  const submit = async () => {
    try {
      await localStorage.setItem("partner", partner);
      setSelectedPartner(partner);
      navigate("/cart");
    } catch (error) {
      console.error("Error updating local storage:", error);
    }
  };

  return (
    <div
      className="is-flex is-flex-direction-column is-justify-content-center is-align-items-center"
      style={{ height: "50vh" }}
    >
      {/* Title for the partner selection */}
      <h1
        className="is-size-4 has-text-weight-bold has-text-centered my-4 loading-effect"
        style={{ animationDelay: "0.33s" }}
      >
        Select Partner To View Cart
      </h1>
      <div
        className="loading-effect"
        ref={containerRef}
        style={{ animationDelay: "0.66s", zIndex: "1" }}
      >
        {/* Dropdown for partner selection */}
        <div
          className={
            isActive
              ? "is-active dropdown is-flex is-justify-content-center"
              : "dropdown is-flex is-justify-content-center"
          }
          onClick={dropDown}
        >
          <div className="dropdown-trigger">
            <button
              className="button"
              aria-haspopup="true"
              aria-controls="dropdown-menu"
              aria-label="PartnerDropdown"
              role="button"
              id="partner-dropdown"
            >
              <span style={{ overflow: "hidden" }}>
                {partner || "Select a Partner"}
              </span>
              <span className="icon is-small">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div className="dropdown-menu" role="menu">
            <div
              className="dropdown-content"
              style={{ maxHeight: "400px", overflowY: "auto", width: "80vw" }}
            >
              {/* Search input for filtering partner options */}
              <div className="dropdown-item">
                <input
                  className="input is-small is-rounded search-partner"
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearch}
                  onClick={handleSearchClick}
                />
              </div>
              <hr className="dropdown-divider" />
              {/* List of partner options */}
              {filteredOptions.map((option, index) => (
                <p
                  className={
                    partner === option
                      ? "dropdown-item is-active partnerOption"
                      : "dropdown-item partnerOption"
                  }
                  key={index}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className="is-flex is-justify-content-center loading-effect"
        style={{ animationDelay: "1s" }}
      >
        {/* Button to submit the selected partner */}
        <button
          id="partner-button"
          aria-label="SubmitPartner"
          role="button"
          className="button my-4 is-rounded"
          onClick={submit}
          z-index="0"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Partner;
