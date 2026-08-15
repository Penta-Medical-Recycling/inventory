import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, X } from "lucide-react";
import BigSpinner from "../assets/BigSpinner";
import CartLister from "../components/CartLister";
import RequestPartyPicker from "../components/RequestPartyPicker";
import Toast from "../components/Toast";
import PentaContext from "../context/PentaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AIRTABLE_API_KEY,
  AIRTABLE_API_URL,
  AIRTABLE_BASE_ID,
} from "../config/airtable";
import {
  clearCartItems,
  clearRequestParty,
  getCartItemKeys,
  getRequestParty,
  setRequestParty,
} from "../lib/storage";

export { getCartItemKeys } from "../lib/storage";

// You should implement or import this method properly
const getTotalInStockBySKU = async (sku) => {
  // TODO: Replace with actual API call
  return 10;
};

const AVAILABILITY_BATCH_SIZE = 100;

const escapeFormulaValue = (value) =>
  String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");

const createAvailabilityFormula = (itemIds) => {
  const itemMatches = itemIds.map(
    (id) => `{Item ID}='${escapeFormulaValue(id)}'`
  );
  const itemFilter =
    itemMatches.length === 1 ? itemMatches[0] : `OR(${itemMatches.join(",")})`;

  return `AND({Requests}=BLANK(),{Shipment Status}=BLANK(),NOT({SKU}=""),${itemFilter})`;
};

export const checkCartItemAvailability = async (itemIds, fetchImpl = fetch) => {
  const uniqueItemIds = [...new Set(itemIds.filter(Boolean).map(String))];
  const statuses = Object.fromEntries(uniqueItemIds.map((id) => [id, "pending"]));
  const availableIds = new Set();

  try {
    for (let start = 0; start < uniqueItemIds.length; start += AVAILABILITY_BATCH_SIZE) {
      const batch = uniqueItemIds.slice(start, start + AVAILABILITY_BATCH_SIZE);
      let offset = null;

      do {
        const params = new URLSearchParams({
          filterByFormula: createAvailabilityFormula(batch),
          pageSize: String(AVAILABILITY_BATCH_SIZE),
        });
        params.append("fields[]", "Item ID");
        if (offset) params.set("offset", offset);

        const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/Inventory?${params}`;
        const response = await fetchImpl(url, {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        });
        if (!response.ok) throw new Error(`Inventory check failed with ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data.records)) throw new Error("Invalid inventory response");
        data.records.forEach((record) => {
          const itemId = Array.isArray(record?.fields?.["Item ID"])
            ? record.fields["Item ID"][0]
            : record?.fields?.["Item ID"];
          if (itemId != null && itemId !== "") availableIds.add(String(itemId));
        });
        offset = data.offset || null;
      } while (offset);
    }

    uniqueItemIds.forEach((id) => {
      statuses[id] = "done";
    });
    return {
      statuses,
      unavailableIds: uniqueItemIds.filter((id) => !availableIds.has(id)),
      failedIds: [],
    };
  } catch (error) {
    console.error("Error checking cart inventory availability:", error);
    uniqueItemIds.forEach((id) => {
      statuses[id] = "error";
    });
    return { statuses, unavailableIds: [], failedIds: uniqueItemIds };
  }
};

export const createRequestFields = ({
  requestName,
  requestParty,
  itemIds,
  notes,
  numOfPatients,
  numOfChildren,
}) => ({
  Name: requestName,
  Partner: [requestParty.partnerId],
  "Additional Notes": notes,
  "Items You Would Like": itemIds,
  "Number of patients helped": Number(numOfPatients) || 0,
  "Number of children helped": Number(numOfChildren) || 0,
  ...(requestParty.clinicianId
    ? { Clinicians: [requestParty.clinicianId] }
    : {}),
});

function Cart() {
  const {
    fulfillCartItems,
    selectedPartner,
    setSelectedPartner,
    setCartCount,
  } = useContext(PentaContext);
  const requestParty = getRequestParty();
  const hasValidRequestParty = Boolean(
    requestParty &&
      requestParty.partnerName === selectedPartner &&
      (!requestParty.clinicianRequired || requestParty.clinicianId)
  );
  const [quantities, setQuantities] = useState({});
  const [outOfStock, setOutOfStock] = useState();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [numOfPatients, setNumOfPatients] = useState("");
  const [numOfChildren, setNumOfChildren] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPartyEditor, setShowPartyEditor] = useState(false);
  const [itemValidationStatus, setItemValidationStatus] = useState({});
  const [isRetryingAvailability, setIsRetryingAvailability] = useState(false);
// Filter valid cart item keys (skip notes/partner/etc)
const itemKeys = getCartItemKeys();
const isCartEmpty = itemKeys.length === 0;
const itemIds = itemKeys.map((key) => {
  const item = JSON.parse(localStorage.getItem(key));
  return item["Item ID"];
}).filter(Boolean);
const hasValidationErrors = itemIds.some((id) => itemValidationStatus[id] === "error");
const hasUnavailableItems = outOfStock?.size > 0;


  const handleQuantityChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const validateCartQuantities = async () => {
    for (let [sku, quantity] of Object.entries(quantities)) {
      const totalAvailable = await getTotalInStockBySKU(sku);
      if (quantity > totalAvailable) {
        alert(
          `Cannot order ${quantity} for ${decodeURIComponent(sku)}. Only ${totalAvailable} in stock.`
        );
        return false;
      }
    }
    return true;
  };

  const handleConfirmOrder = async () => {
    if (isCartEmpty) return;

    const cartItems = Object.entries(quantities).map(([sku, quantity]) => ({
      sku,
      quantity: parseInt(quantity)
    }));

    if (await validateCartQuantities() && window.confirm("Are you sure you want to place this order?")) {
  await requestButton(); // ✅ submit and redirect
}

  };

  const handleResetCart = () => {
  setShowResetModal(true); // 🆕 trigger confirmation modal
};

const confirmResetCart = () => {
  clearCartItems();
  clearRequestParty();
  setSelectedPartner("");
  setCartCount(0);
  Toast({ message: "Cart has been cleared.", type: "is-info" });
  setShowResetModal(false); // close modal
  navigate("/"); // 🆕 redirect to homepage
};


  const generateRandomHexadecimal = () =>
    "#" + Math.floor(Math.random() * 16777216).toString(16).toUpperCase();

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
    localStorage.setItem("notes", event.target.value);
  };

  const idFetcher = async (itemIds = getCartItemKeys().map((key) => {
    const item = JSON.parse(localStorage.getItem(key));
    return item["Item ID"];
  }).filter(Boolean)) => {
    setItemValidationStatus(Object.fromEntries(itemIds.map((id) => [id, "pending"])));
    const result = await checkCartItemAvailability(itemIds);
    setItemValidationStatus(result.statuses);
    setOutOfStock(new Set(result.unavailableIds));
    return result;
  };

  const retryAvailabilityCheck = async () => {
    setIsRetryingAvailability(true);
    await idFetcher(itemIds);
    setIsRetryingAvailability(false);
  };

  const updateRequestParty = (nextParty) => {
    localStorage.setItem("partner", nextParty.partnerName);
    setRequestParty(nextParty);
    setSelectedPartner(nextParty.partnerName);
    setShowPartyEditor(false);
  };




useEffect(() => {
  if (!selectedPartner || !hasValidRequestParty) navigate("/partner");
}, [hasValidRequestParty, navigate, selectedPartner]);



  const requestButton = async (event) => {
    if (!hasValidRequestParty) {
      navigate("/partner");
      return;
    }
    setIsLoading(true);

    const itemIds = getCartItemKeys().map((key) => {
      const item = JSON.parse(localStorage.getItem(key));
      return item["Item ID"];
    }).filter(Boolean);
    const stockCheck = await idFetcher(itemIds);

    if (stockCheck.unavailableIds.length > 0) {
      Toast({
        message:
          "Sorry but one or more of your items are unavailable, please remove to checkout.",
        type: "is-danger",
      });
      setIsLoading(false);
      return;
    }

    if (stockCheck.failedIds.length > 0) {
      Toast({
        message: "We couldn't verify inventory availability. Please try again.",
        type: "is-danger",
      });
      setIsLoading(false);
      return;
    }

    const tableName = "Requests";
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${tableName}`;
    const data = {
      records: [
        {
          fields: createRequestFields({
            requestName: generateRandomHexadecimal(),
            requestParty,
            itemIds,
            notes,
            numOfPatients,
            numOfChildren,
          }),
        },
      ],
      typecast: true,
    };

    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
  if (data.error) {
    console.error("Error:", data.error);
  } else {
    setNotes("");
    setCartCount(0);
    setNumOfChildren("");
    setNumOfPatients("");
    clearCartItems();
    clearRequestParty();
    setSelectedPartner("");
    // Invalidate the cached master inventory list: the items just requested are
    // no longer available, so the next Home visit must rebuild a fresh list
    // instead of reusing the stale session cache.
    sessionStorage.removeItem("allInventoryItems");
    setIsLoading(false);
    Toast({
      message:
        "Thank you for your time, we will get back to you as soon as possible!",
      type: "is-info",
    });
    navigate("/"); // ✅ Redirect to main page
  }
})

      .catch((error) => {
        console.error("Error:", error);
        setNotes("Error");
      });
  };

  const missingInfo = () => {
    !notes &&
    getCartItemKeys().length === 0
      ? Toast({
          message: "Please add additional notes, and add items to your cart",
          type: "is-danger",
        })
      : !notes
      ? Toast({
          message: "Please add additional notes",
          type: "is-danger",
        })
      : Toast({
          message: "Please add items to your cart",
          type: "is-danger",
        });
  };

  const requestDisabled =
    isCartEmpty || hasValidationErrors || hasUnavailableItems;

    return (
    <>
      <div id="text-section">
        <h1 className="mt-6 text-center text-3xl font-semibold">
          Cart
        </h1>
      </div>

      {isLoading ? (
  <BigSpinner size={75} />
) : (
  <>
    <Drawer
      open={showPartyEditor}
      onOpenChange={setShowPartyEditor}
      swipeDirection="right"
    >
      <DrawerContent className="w-[min(520px,94vw)] border-white/40 bg-white/95 backdrop-blur-xl sm:w-[520px]">
        <DrawerHeader className="relative border-b border-black/5 px-6 pb-4 pt-5">
          <DrawerTitle className="text-lg font-semibold">
            Select partner clinic
          </DrawerTitle>
          <DrawerDescription>
            Choose the partner clinic for this request. Some clinics also require a clinician.
          </DrawerDescription>
          <DrawerClose
            aria-label="Close partner clinic selector"
            className="absolute right-3 top-3 flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#F3F4F6]"
          >
            <X className="size-5" aria-hidden="true" />
          </DrawerClose>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {showPartyEditor && (
            <RequestPartyPicker
              initialParty={requestParty}
              onSave={updateRequestParty}
              onCancel={() => setShowPartyEditor(false)}
              submitLabel="Save changes"
              submitAriaLabel="Save partner clinic"
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>

    {isCartEmpty ? (
      <section className="cart-empty-state" aria-labelledby="empty-cart-title">
        <h2 id="empty-cart-title">Your cart is empty</h2>
        <p>Browse available inventory and add the items you want to request.</p>
        <Button
          type="button"
          size="lg"
          className="cart-action-button rounded-full bg-[#35b0fb] px-5 text-white hover:bg-[#159ee8]"
          onClick={() => navigate("/")}
        >
          Browse inventory
        </Button>
      </section>
    ) : (
      <div className="cart-workspace">
        <div className="cart-workspace__items">
          <CartLister
            outOfStock={outOfStock}
            setOutOfStock={setOutOfStock}
            itemValidationStatus={itemValidationStatus}
          />

          {hasValidationErrors && (
            <div className="cart-validation-alert" role="alert">
              <div>
                <strong>Some items couldn't be verified.</strong>
                <p>Check your connection, then retry before submitting your request.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={isRetryingAvailability}
                onClick={retryAvailabilityCheck}
              >
                {isRetryingAvailability ? "Checking..." : "Retry availability check"}
              </Button>
            </div>
          )}
        </div>

        <aside className="cart-request-context" aria-label="Request summary">
          <div className="cart-request-context__header">
            <h2 className="cart-request-context__title">Request summary</h2>
          </div>
          <div className="cart-request-context__identity">
            <div className="min-w-0">
              <h3 className="cart-request-context__partner">{selectedPartner}</h3>
              {requestParty?.clinicianName && (
                <p className="cart-request-context__clinician">
                  {requestParty.clinicianName}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="cart-action-button size-11 shrink-0 rounded-full text-[#4B5563] hover:bg-[#EEF8FD] hover:text-[#1679AD]"
              aria-label="Change partner clinic"
              title="Change partner clinic"
              onClick={() => setShowPartyEditor(true)}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="cart-request-context__form">
            <label htmlFor="patients-helped">
              How many patients do you plan to help with this request?
            </label>
            <Input
              id="patients-helped"
              className="h-11"
              type="number"
              min="0"
              placeholder="Enter a number"
              value={numOfPatients}
              onChange={(e) => setNumOfPatients(e.target.value)}
            />
            <label htmlFor="children-helped">
              How many of the patients are children (under 21 years old)?
            </label>
            <Input
              id="children-helped"
              className="h-11"
              type="number"
              min="0"
              placeholder="Enter a number"
              value={numOfChildren}
              onChange={(e) => setNumOfChildren(e.target.value)}
            />
            <label htmlFor="request-notes">
              Additional notes <span>(optional)</span>
            </label>
            <Textarea
              id="request-notes"
              className="min-h-28"
              placeholder="Add any helpful context"
              value={notes}
              onChange={handleNotesChange}
            />
          </div>

          <div className="cart-submit-action" aria-label="Cart submission">
            <span className="cart-submit-action__count">
              {itemKeys.length} {itemKeys.length === 1 ? "item" : "items"}
            </span>
            <div className="cart-submit-action__buttons">
              <Button
                aria-label="ResetCart"
                type="button"
                variant="ghost"
                className="cart-request-context__reset text-[#6B7280] hover:bg-transparent hover:text-[#B42318]"
                onClick={handleResetCart}
              >
                Clear
              </Button>
              <Button
                aria-label="Confirm"
                type="button"
                size="lg"
                className="cart-action-button rounded-full border-[#35b0fb] bg-[#35b0fb] px-5 text-white hover:border-[#159ee8] hover:bg-[#159ee8]"
                disabled={requestDisabled}
                onClick={handleConfirmOrder}
              >
                Request items
              </Button>
            </div>
          </div>
        </aside>
      </div>
    )}

          {showResetModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <p className="mb-3">
                  Are you sure you want to clear your cart?
                </p>
                <div
                  className="is-flex is-justify-content-center"
                  style={{ gap: "1.5rem", marginTop: "1rem" }}
                >
                  <Button className="cart-action-button" variant="destructive" onClick={confirmResetCart}>
                    Clear
                  </Button>

                  <Button
                    className="cart-action-button"
                    variant="outline"
                    onClick={() => setShowResetModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Cart;