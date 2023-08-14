import MultipleSelect from "./MultipleSelect";
import SizeSlider from "./SizeSlider";
const SideBar = ({
  isActive,
  setIsActive,
  selectedManufacturer,
  setSelectedManufacturer,
  selectedSKU,
  setSelectedSKU,
  minValue,
  setMinValue,
  maxValue,
  setMaxValue,
  isOn,
  setIsOn
}) => {
  const activeToggle = () => {
    setIsActive(!isActive);
  };
  return (
    <div id="side-bar" className={isActive ? "is-filter-active" : ""}>
      <div id="side-bar-top">
        <h1 className="is-size-3 mx-3" style={{ fontWeight: '600' }}>Filters</h1>
        <p className="is-size-3 mx-4" onClick={activeToggle}>
          &#10006;
        </p>
      </div>
      <hr style={{ width: "80%", margin: "10px auto" }}></hr>
      <MultipleSelect
        selectedManufacturer={selectedManufacturer}
        setSelectedManufacturer={setSelectedManufacturer}
        selectedSKU={selectedSKU}
        setSelectedSKU={setSelectedSKU}
      />
      <hr style={{ width: "80%", margin: "10px auto 0px" }}></hr>
      <SizeSlider
        minValue={minValue}
        setMinValue={setMinValue}
        maxValue={maxValue}
        setMaxValue={setMaxValue}
        isOn={isOn}
        setIsOn={setIsOn} />
    </div>
  );
};

export default SideBar;
