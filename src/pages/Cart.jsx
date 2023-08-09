import React, { useState } from "react";
import CartLister from "../Components/CartLister";

function Cart({ cartCount, setCartCount }) {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState();
  const [cartInfo, setCartInfo] = useState({
    selectedOption: null,
    notes: "",
  });

  const options = [
    "Anera",
    "AROL PLUS",
    "Bestojis Orthopaedic and Rehabilitation Foundation",
    "Centro de Protesis",
    "CFINS",
    "Chosen/ KCMC",
    "Clive - Brace Orthopedic",
    "CMC Vellore",
    "Courage Ukraine",
    "CREE/ Rotary - México",
    "Cure Hospital (KENYA)",
    "CyborgBase",
    "Dreaming and Working Together",
    "DT Care",
    "Elizabeth's Legacy of Hope/ DOORIS",
    "ENAM",
    "Fauji Foundation",
    "Foot Care - Jaipur",
    "Fun Pro Bo",
    "Green Pasture Hospital",
    "Group AMH",
    "Haiti REH-Care",
    "Halal Foundation",
    "Henry Gizamba - Mbale City",
    "HPRS",
    "HRDC",
    "Ishk Tolaram Foundation",
    "Kind Deeds",
    "Lanka Fundamental Rights Organization",
    "Life & Limb",
    "Limb Care Foundation Inc.",
    "Limb Kind Foundation",
    "Limbs For Life",
    "Loma Linda P&O",
    "MedShare",
    "Mindy Foundation",
    "Nova Pro Foundation",
    "OADCPH",
    "OMAPEHIV",
    "Ortopedia Petrona",
    "Palestine Children's Relief Fund (PCRF)",
    "Partners for World Health",
    "PIPOS",
    "Polus Timbiqui",
    "PrOPhy Care",
    "Protesis Imbabura",
    "Protez Foundation",
    "Ptolemy Reid Rehabilitation Center",
    "Range of Motion Project",
    "Rotary Choluteca",
    "SSPO",
    "Stepping into Grace",
    "Syrian American Medical Society",
    "Tellus - Ukraine",
    "Tim Cleveland",
    "Todd Stone",
    "UHuman",
    "Unbroken - Ukraine",
    "World Action Fund",
    "Центр протезування і реабілітації «РАЗАН» (RAZAN)",
  ];

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOptionClick = (option) => {
    setCartInfo({ ...cartInfo, selectedOption: option }); // Update selected option when clicked
    setIsActive(false); // Close the dropdown
  };

  const handleNotesChange = (event) => {
    setCartInfo({ ...cartInfo, notes: event.target.value }); // Update notes when changed
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dropDown = () => {
    setIsActive(!isActive);
  };

  const requestButton = (event) => {
    event.preventDefault();
    const BaseID = "appBrTbPbyamI0H6Z";
    const APIKey = "keyi3gjKvW7SaqhE4";
    const tableName = "Requests";
    setErrorMessage("");
    const items = [];
    Object.values(localStorage).forEach((x) =>
      items.push(JSON.parse(x)["Item ID"])
    );
    const url = `https://api.airtable.com/v0/${BaseID}/${tableName}`;
    const data = {
      records: [
        {
          fields: {
            Name: "temp value",
            Partner: cartInfo.selectedOption,
            "Additional Notes": cartInfo.notes,
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
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    setCartInfo({
      selectedOption: cartInfo.selectedOption,
      notes: "",
    });
    localStorage.clear();
  };

  const handleSearchClick = (event) => {
    event.stopPropagation();
  };

  const missingInfo = () => {
    !cartInfo.selectedOption && !cartInfo.notes && !localStorage.length
      ? setErrorMessage(
          "Please select a partner,add additional notes, and add items to your cart"
        )
      : !cartInfo.selectedOption
      ? setErrorMessage("Please select a partner")
      : setErrorMessage("Please add additional notes");
  };

  return (
    <>
      <div id="text-section">
        <h1 className="title has-text-centered my-6">CART</h1>
      </div>
      <h1 className="is-size-4 has-text-weight-bold has-text-centered my-4">
        Select Partner
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
            <span>{cartInfo.selectedOption || "Select a Partner"}</span>
            <span className="icon is-small">
              <i className="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </div>
        <div
          className="dropdown-menu"
          id={isActive ? "partner-content" : ""}
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
                  cartInfo.selectedOption === option
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
      <CartLister cartCount={cartCount} setCartCount={setCartCount} />

      <div style={{ width: "60vw", margin: "auto" }}>
        <textarea
          className="textarea my-4"
          placeholder="Additional Notes"
          value={cartInfo.notes}
          onChange={handleNotesChange}
        ></textarea>
      </div>
      <div className="is-flex is-justify-content-center">
        <button
          className="button mb-1"
          type="button"
          onClick={
            cartInfo.selectedOption && cartInfo.notes && localStorage.length
              ? requestButton
              : missingInfo
          }
        >
          Request Items
        </button>
      </div>
      <p className="has-text-centered has-text-danger mb-4">{errorMessage}</p>
    </>
  );
}

export default Cart;
