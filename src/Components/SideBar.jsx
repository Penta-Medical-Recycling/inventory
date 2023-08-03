import MultipleSelect from "./MultipleSelect";
const SideBar = ({
  isActive,
  setIsActive,
  selectedManufacturer,
  setSelectedManufacturer,
}) => {
  const activeToggle = () => {
    setIsActive(!isActive);
  };
  return (
    <div id="side-bar" className={isActive ? "is-active" : ""}>
      <div id="side-bar-top">
        <h1 className="is-size-3 has-text-weight-bold mx-3">Filters</h1>
        <p className="is-size-3 mx-4" onClick={activeToggle}>
          &#10006;
        </p>
      </div>
      <hr style={{ width: "80%", margin: "10px auto" }}></hr>
      <MultipleSelect
        selectedManufacturer={selectedManufacturer}
        setSelectedManufacturer={setSelectedManufacturer}
      />
    </div>
  );
};

export default SideBar;
