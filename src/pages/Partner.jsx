import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const Partner = ({ setSelectedPartner }) => {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [partner, setPartner] = useState("");
  // const [finalPartner, setFinalPartner] = useState("");
  // const [dummy, setDummy] = useState(1)
  const navigate = useNavigate();

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
    setPartner(option);
    setIsActive(false);
  };

  const filteredOptions = options.filter((option) =>
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
      // Update local storage
      localStorage.setItem("partner", partner);

      // Wait for the local storage update to finish before navigating
      await new Promise((resolve) => setTimeout(resolve, 0)); // This simulates an asynchronous delay

      // Now navigate to '/cart'
      setSelectedPartner(partner);
      navigate("/cart");
    } catch (error) {
      console.error("Error updating local storage:", error);
    }
  };

  // useEffect(() => {
  //     // This effect will run when the 'partner' value in localStorage changes
  //     if (localStorage['partner']) navigate('/cart');
  // }, [localStorage]);

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
            <span>{partner || "Select a Partner"}</span>
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
