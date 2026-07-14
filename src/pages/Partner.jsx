import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PentaContext from "../context/PentaContext";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
  useComboboxAnchor,
} from "@/components/ui/combobox";

// Partner Page allows the user to select a partner to view their cart.
// The partner picker is a searchable shadcn Combobox (Base UI); it handles
// filtering, keyboard navigation, and open/close state internally.

const Partner = () => {
  const { setSelectedPartner, fetchSelectOptions } = useContext(PentaContext);
  const [partner, setPartner] = useState(""); // Selected partner
  const [inputValue, setInputValue] = useState(""); // Text shown in the combobox
  const [data, setData] = useState([]); // List of partner options
  const [open, setOpen] = useState(false); // Controls the dropdown popup
  const navigate = useNavigate();

  // Anchor the dropdown popup to the full-width input so its options render at
  // the input's width instead of the tiny chevron trigger's width.
  const anchorRef = useComboboxAnchor();

  useEffect(() => {
    // Fetch partner options from AirTable
    const fetchPartners = async () => {
      const partnerOptions = await fetchSelectOptions("Partners");
      setData(partnerOptions);
    };
    fetchPartners();
  }, []);

  // Submit selected partner to localStorage and navigate to Cart page
  const submit = async () => {
    try {
      localStorage.setItem("partner", partner);
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
        className="is-size-4 has-text-weight-bold has-text-centered my-4"
      >
        Select Partner To View Cart
      </h1>

      {/* Searchable partner combobox */}
      <div
        className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
      >
        <Combobox
          items={data}
          value={partner}
          onValueChange={(value) => {
            setPartner(value ?? "");
            // Mirror the selection into the input so it shows the chosen partner.
            setInputValue(value ?? "");
          }}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          open={open}
          onOpenChange={setOpen}
        >
          <div ref={anchorRef}>
            <ComboboxInput
              className="w-full bg-white [--ring:#35b0fb] has-[[data-slot=input-group-control]:focus-visible]:border-input"
              placeholder="Select a Partner"
              aria-label="PartnerDropdown"
              id="partner-dropdown"
              onFocus={() => setOpen(true)}
            />
          </div>
          <ComboboxContent anchor={anchorRef}>
            <ComboboxEmpty>No partners found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Button to submit the selected partner */}
      <div
        className="is-flex is-justify-content-center"
      >
        <Button
          id="partner-button"
          aria-label="SubmitPartner"
          variant="outline"
          size="lg"
          className="my-4 rounded-full"
          onClick={submit}
          disabled={!partner}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Partner;
