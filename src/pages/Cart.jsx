import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import BigSpinner from "../assets/BigSpinner";
import CartLister from "../components/CartLister";
import Toast from "../components/Toast";
import PentaContext from "../context/PentaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AIRTABLE_API_KEY,
  AIRTABLE_API_URL,
  AIRTABLE_BASE_ID,
} from "../config/airtable";

// You should implement or import this method properly
const getTotalInStockBySKU = async (sku) => {
  // TODO: Replace with actual API call
  return 10;
};

export const getCartItemKeys = (storage = localStorage) =>
  Object.keys(storage).filter((key) => key !== "notes" && key !== "partner");

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

function Cart() {
  const { fulfillCartItems, selectedPartner, setCartCount } = useContext(PentaContext);
  const [quantities, setQuantities] = useState({});
  const [outOfStock, setOutOfStock] = useState();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [numOfPatients, setNumOfPatients] = useState("");
  const [numOfChildren, setNumOfChildren] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
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
  const partner = localStorage.getItem("partner");
  localStorage.clear();
  if (partner) {
    localStorage.setItem("partner", partner);
  }
  setCartCount(0);
  Toast({ message: "Cart has been reset.", type: "is-info" });
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




useEffect(() => {
  if (!selectedPartner) navigate("/partner");
}, []);



  const requestButton = async (event) => {
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
          fields: {
            Name: generateRandomHexadecimal(),
            Partner: localStorage["partner"],
            "Additional Notes": notes,
            "Items You Would Like": itemIds,
            "Number of patients helped": Number(numOfPatients) || 0,
            "Number of children helped": Number(numOfChildren) || 0
          },
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
    const partner = localStorage["partner"];
    localStorage.clear();
    localStorage.setItem("partner", partner);
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
    Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
      .length === 0
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

    return (
    <>
      <div id="text-section">
        <h1 className="mt-6 text-center text-3xl font-semibold">
          MY CART
        </h1>
      </div>

      {isLoading ? (
  <BigSpinner size={75} />
) : (
  <>
    <h1 className="has-text-centered is-size-5 my-4">
      Hello, {selectedPartner} Member!
    </h1>

    <div className="is-flex is-justify-content-center my-3">
      <Button render={<Link to="/partner" />} variant="outline" size="lg" className="rounded-full w-[142px]">
        Change Partner
      </Button>
    </div>

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

          <div style={{ width: "60vw", margin: "auto" }}>
            <p>How many patients do you plan to help with this request?</p>
            <Input
              className="my-2"
              type="number"
              placeholder="Please input a number"
              value={numOfPatients}
              onChange={(e) => setNumOfPatients(e.target.value)}
            />
            <p>How many of the patients are children (under 21 years old)?</p>
            <Input
              className="my-2"
              type="number"
              placeholder="Please input a number"
              value={numOfChildren}
              onChange={(e) => setNumOfChildren(e.target.value)}
            />
          </div>

          <div style={{ width: "60vw", margin: "auto" }}>
            <Textarea
              className="my-4 min-h-40"
              placeholder="Additional Notes"
              value={notes}
              onChange={handleNotesChange}
            />
          </div>

          <div
            className="is-flex is-justify-content-center"
          >
            <Button
              aria-label="Confirm"
              type="button"
              size="lg"
              className="mb-4 w-[142px] rounded-full bg-[#78d3fb] text-white hover:bg-[#78d3fb]/90"
              disabled={isCartEmpty || hasValidationErrors || hasUnavailableItems}
              onClick={handleConfirmOrder}
            >
              Request Items
            </Button>
          </div>

          <div
            className="is-flex is-justify-content-center"
          >
            <Button
              aria-label="ResetCart"
              type="button"
              size="lg"
              className="mb-4 w-[142px] rounded-full bg-[#ff5c47] text-white hover:bg-[#ff5c47]/90"
              onClick={handleResetCart}
            >
              Reset Cart
            </Button>
          </div>

          {showResetModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <p className="mb-3">
                  Are you sure you want to reset your cart?
                </p>
                <div
                  className="is-flex is-justify-content-center"
                  style={{ gap: "1.5rem", marginTop: "1rem" }}
                >
                  <Button variant="destructive" onClick={confirmResetCart}>
                    Reset
                  </Button>

                  <Button
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