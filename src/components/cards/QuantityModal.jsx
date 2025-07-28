import React, { useState, useEffect } from "react";
import { Range } from "react-range";

const QuantityModal = ({ itemName, currentItemId, onSubmit, onClose, hasSize = false }) => {
  const defaultSizeRange = [0, 75];
  const [inputValue, setInputValue] = useState(1);
  const [sizeRange, setSizeRange] = useState([defaultSizeRange[0], defaultSizeRange[1]]);
  const [exactSize, setExactSize] = useState("");
  const [step, setStep] = useState(hasSize ? 0 : 1);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    updateExistingCount();
  }, [itemName]);

  const updateExistingCount = () => {
    let count = 0;
    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (key === "partner" || key === "notes") return;

      try {
        const item = JSON.parse(localStorage.getItem(key));
        const valuesToCheck = [
          item?.["Description (from SKU)"]?.[0],
          item?.["Description (from SKU)"],
          item?.["Item Name"],
          item?.["Name"],
          item?.["Component"],
          item?.["Model"],
          item?.["SKU"]?.[0],
          item?.["SKU"]
        ];

        if (valuesToCheck.includes(itemName)) {
          count += 1;
        }
      } catch (err) {
        console.warn(`Error parsing localStorage item: ${key}`, err);
      }
    });

    setExistingCount(count);
  };

  const handleNext = () => {
    if (exactSize) {
      const sizeNum = parseFloat(exactSize);
      if (sizeNum < sizeRange[0] || sizeNum > sizeRange[1]) {
        alert(`Exact size must be between ${sizeRange[0]} and ${sizeRange[1]}`);
        return;
      }
    }
    setStep(1);
  };

  const handleSubmit = () => {
    const sizeData = hasSize ? { range: sizeRange, exact: exactSize || null } : null;
    onSubmit(parseInt(inputValue, 10), sizeData, existingCount);
    setInputValue(0);
    updateExistingCount(); // update after adding to cart
  };

  const increment = () => setInputValue((prev) => parseInt(prev || 0, 10) + 1);
  const decrement = () =>
    setInputValue((prev) => (parseInt(prev || 0, 10) > 0 ? parseInt(prev, 10) - 1 : 0));

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {hasSize && step === 0 && (
          <>
            <h2>Select size range for {itemName}</h2>
            <label>
              Size Range: <strong>{sizeRange[0]}</strong> - <strong>{sizeRange[1]}</strong>
            </label>
            <Range
              step={0.5}
              min={defaultSizeRange[0]}
              max={defaultSizeRange[1]}
              values={sizeRange}
              onChange={(values) => setSizeRange(values)}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    background: "#ddd",
                    borderRadius: "4px",
                    margin: "1rem 0",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "20px",
                    width: "20px",
                    backgroundColor: "#80d4ff",
                    borderRadius: "50%",
                  }}
                />
              )}
            />

            <div style={{ marginTop: "1rem" }}>
              <label htmlFor="exactSizeInput">
                Or enter <strong>exact size</strong>:
              </label>
              <input
                id="exactSizeInput"
                type="number"
                placeholder="e.g. 26.5"
                value={exactSize}
                step={0.5}
                min={0}
                max={75}
                onChange={(e) => setExactSize(e.target.value)}
                style={{ width: "100%", marginTop: "0.5rem" }}
              />
            </div>

            <div className="modal-buttons">
              <button onClick={onClose} className="modal-button-secondary">
                Cancel
              </button>
              <button onClick={handleNext} className="modal-button-primary">
                Next
              </button>
            </div>
          </>
        )}

        {(!hasSize || step === 1) && (
          <>
            <h2>How many units of “{itemName}” do you need?</h2>
            <p className="has-text-grey mt-2" style={{ textAlign: "center" }}>
              You already have <strong>{existingCount}</strong> unit{existingCount !== 1 ? "s" : ""} of this item in your cart.
            </p>
            <div
              className="quantity-control"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "1rem 0",
                justifyContent: "center",
              }}
            >
              <button className="button is-small" onClick={decrement}>
                -
              </button>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ width: "60px", textAlign: "center" }}
              />
              <button className="button is-small" onClick={increment}>
                +
              </button>
            </div>
            <div className="modal-buttons">
              <button onClick={onClose} className="modal-button-secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="modal-button-primary">
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuantityModal;
