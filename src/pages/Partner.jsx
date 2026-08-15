import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PentaContext from "../context/PentaContext";
import { setRequestParty } from "../lib/storage";
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
  const { setSelectedPartner, fetchTableRecordsWithOffset } =
    useContext(PentaContext);
  const [partner, setPartner] = useState(null);
  const [partnerInput, setPartnerInput] = useState("");
  const [partners, setPartners] = useState([]);
  const [clinician, setClinician] = useState(null);
  const [clinicianInput, setClinicianInput] = useState("");
  const [clinicians, setClinicians] = useState([]);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [clinicianOpen, setClinicianOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const partnerAnchorRef = useComboboxAnchor();
  const clinicianAnchorRef = useComboboxAnchor();

  useEffect(() => {
    let cancelled = false;

    const fetchRequestParties = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const [partnerRecords, clinicianRecords] = await Promise.all([
          fetchTableRecordsWithOffset("Partners"),
          fetchTableRecordsWithOffset("Clinicians"),
        ]);
        if (cancelled) return;

        setPartners(
          partnerRecords
            .filter((record) => typeof record.fields.Partner === "string")
            .map((record) => ({
              id: record.id,
              label: record.fields.Partner.trimStart(),
            }))
            .sort((left, right) => left.label.localeCompare(right.label))
        );
        setClinicians(
          clinicianRecords
            .filter((record) => typeof record.fields.Name === "string")
            .map((record) => ({
              id: record.id,
              label: record.fields.Name.trim(),
              partnerIds: record.fields.Partners || [],
            }))
            .sort((left, right) => left.label.localeCompare(right.label))
        );
      } catch (error) {
        console.error("Error loading partners and clinicians:", error);
        if (!cancelled) {
          setPartners([]);
          setClinicians([]);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRequestParties();
    return () => {
      cancelled = true;
    };
    // `fetchTableRecordsWithOffset` is recreated by the provider on render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const partnerClinicians = partner
    ? clinicians.filter((option) => option.partnerIds.includes(partner.id))
    : [];
  const clinicianRequired = partnerClinicians.length > 0;

  const submit = async () => {
    try {
      const requestParty = {
        partnerId: partner.id,
        partnerName: partner.label,
        clinicianRequired,
        clinicianId: clinician?.id || null,
        clinicianName: clinician?.label || null,
      };
      localStorage.setItem("partner", partner.label);
      setRequestParty(requestParty);
      setSelectedPartner(partner.label);
      navigate("/cart");
    } catch (error) {
      console.error("Error updating local storage:", error);
    }
  };

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h1 className="my-4 text-center text-xl font-semibold">
        Select Partner To View Cart
      </h1>

      <div className="flex w-full max-w-2xl flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="partner-dropdown" className="text-sm font-semibold text-[#374151]">
            Partner
          </label>
          <Combobox
            items={partners}
            value={partner}
            onValueChange={(value) => {
              setPartner(value ?? null);
              setPartnerInput(value?.label ?? "");
              setClinician(null);
              setClinicianInput("");
            }}
            inputValue={partnerInput}
            onInputValueChange={setPartnerInput}
            open={partnerOpen}
            onOpenChange={setPartnerOpen}
            itemToStringLabel={(item) => item.label}
            itemToStringValue={(item) => item.id}
            isItemEqualToValue={(left, right) => left.id === right.id}
          >
            <div ref={partnerAnchorRef}>
              <ComboboxInput
                className="partner-combobox w-full bg-white [--ring:#35b0fb] has-[[data-slot=input-group-control]:focus-visible]:border-input"
                placeholder={isLoading ? "Loading partners..." : "Select a Partner"}
                aria-label="PartnerDropdown"
                id="partner-dropdown"
                disabled={isLoading || loadError}
                onFocus={() => setPartnerOpen(true)}
              />
            </div>
            <ComboboxContent anchor={partnerAnchorRef}>
              <ComboboxEmpty>No partners found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.id} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {clinicianRequired && (
          <div className="flex flex-col gap-2">
            <label htmlFor="clinician-dropdown" className="text-sm font-semibold text-[#374151]">
              Clinician
            </label>
            <Combobox
              items={partnerClinicians}
              value={clinician}
              onValueChange={(value) => {
                setClinician(value ?? null);
                setClinicianInput(value?.label ?? "");
              }}
              inputValue={clinicianInput}
              onInputValueChange={setClinicianInput}
              open={clinicianOpen}
              onOpenChange={setClinicianOpen}
              itemToStringLabel={(item) => item.label}
              itemToStringValue={(item) => item.id}
              isItemEqualToValue={(left, right) => left.id === right.id}
            >
              <div ref={clinicianAnchorRef}>
                <ComboboxInput
                  className="partner-combobox w-full bg-white [--ring:#35b0fb] has-[[data-slot=input-group-control]:focus-visible]:border-input"
                  placeholder="Select a Clinician"
                  aria-label="ClinicianDropdown"
                  id="clinician-dropdown"
                  onFocus={() => setClinicianOpen(true)}
                />
              </div>
              <ComboboxContent anchor={clinicianAnchorRef}>
                <ComboboxEmpty>No clinicians found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        )}

        {loadError && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-3" role="alert">
            <p className="text-sm text-[#7C2D12]">
              We couldn&apos;t load partners and clinicians.
            </p>
            <Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
              Retry
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          id="partner-button"
          aria-label="SubmitPartner"
          variant="outline"
          size="lg"
          className="partner-action-button my-4 rounded-full"
          onClick={submit}
          disabled={
            isLoading ||
            loadError ||
            !partner ||
            (clinicianRequired && !clinician)
          }
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Partner;
