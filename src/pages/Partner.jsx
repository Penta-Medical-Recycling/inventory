import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const Partner = ({ setSelectedPartner }) => {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [partner, setPartner] = useState("");
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
    const baseId = "appBrTbPbyamI0H6Z";
    const tableName = "Partners";

    async function fetchTableRecords(offset = null) {
      const url = `https://api.airtable.com/v0/${baseId}/${tableName}?${
        offset ? `offset=${offset}` : ""
      }`;

      const response = await fetch(url, {
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

      setData(
        allRecords
          .map((e) => e.fields.Name.trimStart())
          .sort((a, b) => a.localeCompare(b))
      );
    })();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleOptionClick = (option) => {
    setPartner(option);
    setIsActive(false);
  };

  const filteredOptions = data.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dropDown = () => {
    setIsActive(!isActive);
  };

  const handleSearchClick = (event) => {
    event.stopPropagation();
  };

  const submit = async () => {
    try {
      localStorage.setItem("partner", partner);

      await new Promise((resolve) => setTimeout(resolve, 0)); // This simulates an asynchronous delay

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
      <h1 className="is-size-4 has-text-weight-bold has-text-centered my-4">
        Select Partner To View Cart
      </h1>
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
        <div
          className="dropdown-menu"
          // id={isActive ? "partner-content" : ""}
          role="menu"
        >
          <div
            className="dropdown-content"
            style={{ maxHeight: "400px", overflowY: "auto", width: "80vw" }}
          >
            <div className="dropdown-item">
              <input
                className="input is-small"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
                onClick={handleSearchClick}
              />
            </div>
            <hr className="dropdown-divider" />
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
      <div className="is-flex is-justify-content-center">
        <button className="button my-4" onClick={submit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Partner;
