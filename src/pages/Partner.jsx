import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PentaContext from "../context/PentaContext";
import { setRequestParty } from "../lib/storage";
import RequestPartyPicker from "../components/RequestPartyPicker";

// Partner Page allows the user to select a partner to view their cart.
// The partner picker is a searchable shadcn Combobox (Base UI); it handles
// filtering, keyboard navigation, and open/close state internally.

const Partner = () => {
  const { setSelectedPartner } = useContext(PentaContext);
  const navigate = useNavigate();

  const submit = (requestParty) => {
    try {
      localStorage.setItem("partner", requestParty.partnerName);
      setRequestParty(requestParty);
      setSelectedPartner(requestParty.partnerName);
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

      <div className="w-full max-w-2xl">
        <RequestPartyPicker onSave={submit} submitLabel="Continue to cart" />
      </div>
    </div>
  );
};

export default Partner;
