import { useState, useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";

// Labeled numeric stepper: minus/plus buttons plus a free-text field that stays
// clamped to [min, max]. Shared by the Device size filter and the quantity modal.
const Stepper = ({
  label,
  value,
  min,
  max,
  onValueChange,
  onDecrement,
  onIncrement,
  canDecrement,
  canIncrement,
  inputAriaLabel,
}) => {
  // Local text state so the user can freely edit the field (including transient
  // empty/out-of-range states) while the committed value stays clamped.
  const [text, setText] = useState(String(value));
  const isFocused = useRef(false);

  // Keep the field in sync with the committed value, but never overwrite what
  // the user is actively typing.
  useEffect(() => {
    if (!isFocused.current) setText(String(value));
  }, [value]);

  const handleChange = (event) => {
    const raw = event.target.value;
    setText(raw);
    if (raw === "") return;
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    // Only commit live when the value is already in range. Out-of-range typing
    // (e.g. "3" on the way to "30") is left uncommitted so it isn't clamped and
    // overwritten mid-edit; clamping happens on blur.
    if (parsed >= min && parsed <= max) onValueChange(parsed);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  // Normalize/clamp the displayed text to a committed value when focus leaves.
  const handleBlur = () => {
    isFocused.current = false;
    const parsed = parseInt(text, 10);
    if (Number.isNaN(parsed)) {
      setText(String(value));
      return;
    }
    const clamped = Math.min(Math.max(parsed, min), max);
    onValueChange(clamped);
    setText(String(clamped));
  };

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A8A]">
        {label}
      </span>
      <div className="flex items-center gap-1 rounded-2xl border border-[#E5E7EB] bg-white px-1.5 py-1 transition-colors focus-within:border-[#64C8FF]">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!canDecrement}
          aria-label={`Decrease ${label}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#4A4A4A] transition-colors hover:bg-[#D9F1FF] hover:text-[#1a9fe0] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Minus className="size-4" />
        </button>
        <input
          type="number"
          value={text}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={inputAriaLabel ?? `${label} size`}
          className="w-full min-w-0 bg-transparent text-center text-lg font-semibold text-[#4A4A4A] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={onIncrement}
          disabled={!canIncrement}
          aria-label={`Increase ${label}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#4A4A4A] transition-colors hover:bg-[#D9F1FF] hover:text-[#1a9fe0] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default Stepper;
