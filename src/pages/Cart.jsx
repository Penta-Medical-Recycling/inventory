import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import BigSpinner from "../assets/BigSpinner";
import CartLister from "../components/CartLister";
import Toast from "../components/Toast";
import PentaContext from "../context/PentaContext";

// You should implement or import this method properly
const getTotalInStockBySKU = async (sku) => {
  // TODO: Replace with actual API call
  return 10;
};

function Cart() {
  const { fulfillCartItems, selectedPartner, setCartCount } = useContext(PentaContext);
  const [quantities, setQuantities] = useState({});
  const [outOfStock, setOutOfStock] = useState();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [numOfPatients, setNumOfPatients] = useState(0);
  const [numOfChildren, setNumOfChildren] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const APIKey = import.meta.env.VITE_REACT_APP_API_KEY;

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
    const cartItems = Object.entries(quantities).map(([sku, quantity]) => ({
      sku,
      quantity: parseInt(quantity)
    }));

    if (await validateCartQuantities() && window.confirm("Are you sure you want to place this order?")) {
      fulfillCartItems(cartItems);
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

  const idFetcher = async () => {
    const ids = [];
    for (let [key, value] of Object.entries(localStorage)) {
      if (key !== "partner" && key !== "notes") {
        const parse = JSON.parse(value);
        const itemID = parse["Item ID"];
        if (itemID !== undefined) {
          ids.push(itemID);
        }
      }
    }

    const idSet = new Set();

    for (const id of ids) {
      const url = `https://api.airtable.com/v0/appHFwcwuXLTNCjtN/Inventory?filterByFormula=AND({Requests}=BLANK(),{Shipment Status}=BLANK(),NOT({SKU}=""),AND({Item ID}='${encodeURIComponent(
        id
      )}'))&maxRecords=1`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${APIKey}`,
          },
        });

        const data = await response.json();
        if (data.records && data.records.length === 0) {
          idSet.add(id);
        }
      } catch (error) {
        console.error(`Error fetching data for ID ${id}:`, error);
      }
    }

    setOutOfStock(idSet);
    return idSet.size > 0;
  };

  useEffect(() => {
    if (!selectedPartner) navigate("/partner");
    idFetcher();
  }, []);

  const requestButton = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    setOutOfStock(new Set());
    const stockCheck = await idFetcher();

    if (stockCheck) {
      Toast({
        message:
          "Sorry but one or more of your items are unavailable, please remove to checkout.",
        type: "is-danger",
      });
      setIsLoading(false);
      return;
    }

    const BaseID = "appHFwcwuXLTNCjtN";
    const tableName = "Requests";
    const items = [];
    Object.entries(localStorage).forEach(([key, value]) => {
      if (key !== "partner" && key !== "notes")
        items.push(JSON.parse(value)["Item ID"]);
    });
    const url = `https://api.airtable.com/v0/${BaseID}/${tableName}`;
    const data = {
      records: [
        {
          fields: {
            Name: generateRandomHexadecimal(),
            Partner: localStorage["partner"],
            "Additional Notes": notes,
            "Items You Would Like": items,
            "Number of patients helped": numOfPatients,
            "Number of children helped": numOfChildren
          },
        },
      ],
      typecast: true,
    };

    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${APIKey}`,
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
          setNumOfChildren(0);
          setNumOfPatients(0);
          const partner = localStorage["partner"];
          localStorage.clear();
          localStorage.setItem("partner", partner);
          setIsLoading(false);
          Toast({
            message:
              "Thank you for your time, we will get back to you as soon as possible!",
            type: "is-info",
          });
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
        <h1 className="title has-text-centered mt-6 loading-effect" style={{ animationDelay: "0.23s" }}>
          MY CART
        </h1>
      </div>
      {isLoading ? (
        <BigSpinner size={75} />
      ) : (
        <>
          <h1 className="has-text-centered is-size-5 my-4 loading-effect" style={{ animationDelay: "0.46s" }}>
            Hello, {selectedPartner} Member!
          </h1>
          <Link to="/partner" className="is-flex is-justify-content-center my-3 loading-effect" style={{ animationDelay: "0.66s" }}>
            <button className="button is-rounded" id="partner-button" aria-label="ChangePartner" role="button">
              Change Partner
            </button>
          </Link>
          {outOfStock ? (
            <CartLister outOfStock={outOfStock} setOutOfStock={setOutOfStock} />
          ) : (
            <BigSpinner size={75} />
          )}
          <div style={{ width: "60vw", margin: "auto" }}>
            <p>How many patients do you plan to help with this request?</p>
            <input
              className="input is-normal"
              type="number"
              placeholder="Please input a number"
              value={numOfPatients}
              onChange={(e) => setNumOfPatients(e.target.value)}
            />
            <p>How many of the patients are children (under 21 years old)?</p>
            <input
              className="input is-normal"
              type="number"
              placeholder="Please input a number"
              value={numOfChildren}
              onChange={(e) => setNumOfChildren(e.target.value)}
            />
          </div>
          <div style={{ width: "60vw", margin: "auto" }}>
            <textarea
              id="cart-textarea"
              className="textarea my-4 is-rounded loading-effect"
              style={{ animationDelay: "0.83s" }}
              placeholder="Additional Notes"
              value={notes}
              onChange={handleNotesChange}
            ></textarea>
          </div>
          <div className="is-flex is-justify-content-center loading-effect" style={{ animationDelay: "1.2s" }}>
            <button
              id="confirm-button"
              aria-label="Confirm"
              role="button"
              className="button mb-1 is-rounded is-primary"
              type="button"
              style={{
              backgroundColor: "#78d3fb"
              }}
              onClick={handleConfirmOrder}
            >
             Request Items
            </button>
          </div>
          <div className="is-flex is-justify-content-center loading-effect" style={{ animationDelay: "1.3s" }}>
  <button
    id="reset-button"
    aria-label="ResetCart"
    role="button"
    className="button mb-4 is-rounded is-danger"
    type="button"
    style={{
    minWidth: "142px", // match width
    padding: "0.75rem 1.5rem", // match padding
    fontSize: "1rem",
    backgroundColor: "#ff5c47e8" // match font size
  }}
    onClick={handleResetCart}
  >
    Reset Cart
  </button>
  </div>
  {showResetModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <p className="mb-3">Are you sure you want to reset your cart?</p>
      <div
  className="is-flex is-justify-content-center"
  style={{ gap: "1.5rem", marginTop: "1rem" }}
>
  <button
  className="button is-danger is-light custom-reset"
  onClick={confirmResetCart}
>
  Reset
</button>

  <button className="button is-light" onClick={() => setShowResetModal(false)}>
    Cancel
  </button>
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
