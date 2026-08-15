import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import Stepper from "../ui/Stepper";
import { getCartItemKeys } from "../../lib/storage";

const QuantityModal = ({ itemName, currentItemId, onSubmit, onClose, hasSize = false, getAvailableCount }) => {
  const defaultSizeRange = [0, 75];
  const [inputValue, setInputValue] = useState(1);
  const [sizeRange, setSizeRange] = useState([defaultSizeRange[0], defaultSizeRange[1]]);
  const [exactSize, setExactSize] = useState("");
  const [step, setStep] = useState(hasSize ? 0 : 1);
  const [existingCount, setExistingCount] = useState(0);
  // A size is either a range OR one exact value - never both. Toggling mode
  // keeps the two mutually exclusive instead of silently letting exact win.
  const [sizeMode, setSizeMode] = useState("range");
  // null = availability unknown (no cap). Otherwise the max units addable for
  // the current size selection, so the user can't request more than in stock.
  const [maxUnits, setMaxUnits] = useState(null);

  useEffect(() => {
    updateExistingCount();
  }, [itemName]);

  const updateExistingCount = () => {
    let count = 0;
    const allKeys = getCartItemKeys();

    allKeys.forEach((key) => {
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

  // Recompute how many units are addable once the quantity step is active
  // (for sized items this is after a size is chosen), then clamp the input.
  useEffect(() => {
    if (typeof getAvailableCount !== "function") return;
    if (hasSize && step !== 1) return;
    const sizeData = hasSize
      ? sizeMode === "exact"
        ? { exact: exactSize || null }
        : { range: sizeRange }
      : null;
    const available = getAvailableCount(sizeData);
    setMaxUnits(available);
    setInputValue((prev) => {
      const val = parseInt(prev || 0, 10) || 0;
      return Math.min(Math.max(val, available === 0 ? 0 : 1), available);
    });
  }, [step, hasSize, getAvailableCount]);

  const handleNext = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    const sizeData = hasSize
      ? sizeMode === "exact"
        ? { exact: exactSize || null }
        : { range: sizeRange }
      : null;
    onSubmit(parseInt(inputValue, 10), sizeData, existingCount);
    setInputValue(0);
    updateExistingCount(); // update after adding to cart
  };

  const canSubmit = parseInt(inputValue || 0, 10) >= 1;

  // No cap when availability is unknown; floor at 1 unless nothing is in stock.
  const quantityValue = parseInt(inputValue || 0, 10) || 0;
  const quantityMax = maxUnits ?? Number.MAX_SAFE_INTEGER;
  const quantityMin = maxUnits === 0 ? 0 : 1;

  const increment = () =>
    setInputValue((prev) => Math.min((parseInt(prev || 0, 10) || 0) + 1, quantityMax));
  const decrement = () =>
    setInputValue((prev) => Math.max((parseInt(prev || 0, 10) || 0) - 1, quantityMin));

  // Live stock for the size currently selected on the size step, so the user is
  // warned before advancing that a size range has no matching inventory.
  const isExactMode = sizeMode === "exact";
  const exactEmpty = isExactMode && String(exactSize).trim() === "";
  const activeSizeData = isExactMode
    ? { exact: exactSize || null }
    : { range: sizeRange };
  const sizeAvailable =
    hasSize && step === 0 && typeof getAvailableCount === "function" && !exactEmpty
      ? getAvailableCount(activeSizeData)
      : null;
  const noSizeMatches = sizeAvailable === 0;
  const canProceedSize = !exactEmpty && !noSizeMatches;

  return (
    <div className="modal-backdrop">
      <div className="modal-content quantity-modal">
        {hasSize && step === 0 && (
          <>
            <div className="quantity-modal__header">
              <h2>What size range do you need?</h2>
            </div>
            <p className="quantity-modal__meta">Accept any size in a range, or match one exact size</p>

            <div className="quantity-modal__size-controls">
              <div
                className="quantity-modal__mode"
                role="tablist"
                aria-label="Size selection mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isExactMode}
                  className={`quantity-modal__mode-tab${!isExactMode ? " is-active" : ""}`}
                  onClick={() => setSizeMode("range")}
                >
                  Size range
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isExactMode}
                  className={`quantity-modal__mode-tab${isExactMode ? " is-active" : ""}`}
                  onClick={() => setSizeMode("exact")}
                >
                  Exact size
                </button>
              </div>

              {isExactMode ? (
                <div className="quantity-modal__mode-panel">
                  <input
                    id="exactSizeInput"
                    className="quantity-modal__exact-input"
                    type="number"
                    placeholder="e.g. 26.5"
                    value={exactSize}
                    step={0.5}
                    min={defaultSizeRange[0]}
                    max={defaultSizeRange[1]}
                    onChange={(e) => setExactSize(e.target.value)}
                  />
                </div>
              ) : (
                <div className="quantity-modal__mode-panel">
                  <div className="quantity-modal__range-heading">
                    <span>Sizes</span>
                    <output>{sizeRange[0]} – {sizeRange[1]}</output>
                  </div>
                  <div className="quantity-modal__slider">
                    <Slider
                      min={defaultSizeRange[0]}
                      max={defaultSizeRange[1]}
                      step={1}
                      value={sizeRange}
                      onValueChange={(values) => setSizeRange(values)}
                    />
                  </div>
                </div>
              )}
            </div>

            {noSizeMatches && (
              <p className="quantity-modal__warning" role="alert">
                No items available in this size{isExactMode ? "" : " range"}. Try adjusting your selection.
              </p>
            )}

            <div className="modal-buttons">
              <button onClick={onClose} className="modal-button-secondary">
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="modal-button-primary modal-button-submit"
                disabled={!canProceedSize}
              >
                Next
              </button>
            </div>
          </>
        )}

        {(!hasSize || step === 1) && (
          <>
            <div className="quantity-modal__header">
              {hasSize && (
                <button
                  type="button"
                  className="quantity-modal__back"
                  onClick={() => setStep(0)}
                  aria-label="Back to size selection"
                  title="Back to size selection"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>
              )}
              <h2>How many units do you need?</h2>
            </div>
            <p className="quantity-modal__meta">
              <strong>{existingCount}</strong> in your cart
              {maxUnits != null && (
                <> · <strong>{maxUnits}</strong> available to add</>
              )}
            </p>
            <div className="quantity-control" style={{ maxWidth: "180px" }}>
              <Stepper
                label="Quantity"
                inputAriaLabel="Quantity"
                value={quantityValue}
                min={quantityMin}
                max={quantityMax}
                onValueChange={(val) => setInputValue(val)}
                onDecrement={decrement}
                onIncrement={increment}
                canDecrement={quantityValue > quantityMin}
                canIncrement={quantityValue < quantityMax}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={onClose} className="modal-button-secondary">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="modal-button-primary modal-button-submit"
                disabled={!canSubmit}
              >
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
