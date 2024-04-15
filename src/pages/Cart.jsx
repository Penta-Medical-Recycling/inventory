import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import BigSpinner from "../assets/BigSpinner";
import CartLister from "../components/CartLister";
import Toast from "../components/Toast";
import PentaContext from "../context/PentaContext";

function Cart() {
  const { selectedPartner, setCartCount } = useContext(PentaContext);

  // Initialize an array to store item IDs that are out of stock
  const ids = [];

  // State variables to manage out-of-stock items, notes, and loading status
  const [outOfStock, setOutOfStock] = useState();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const [isLoading, setIsLoading] = useState(false);

  // API key obtained from environment variables
  const APIKey = import.meta.env.VITE_REACT_APP_API_KEY;

  // Function to generate a random hexadecimal code
  function generateRandomHexadecimal() {
    return (
      "#" +
      Math.floor(Math.random() * 16777216)
        .toString(16)
        .toUpperCase()
    );
  }

  // Handle changes to the additional notes textarea
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
    localStorage.setItem("notes", event.target.value);
  };

  // Function to fetch and check the stock status of item IDs in localStorage
  const idFetcher = async () => {
    // Iterate through localStorage to extract item IDs
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

    // Check the stock status of each item ID
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
        // if a record is not returned, it means that it became unavailable since it was added to the cart, its id will be added to the set
        if (data.records && data.records.length === 0) {
          idSet.add(id);
        }
      } catch (error) {
        console.error(`Error fetching data for ID ${id}:`, error);
      }
    }

    // Adds out of stock banner to those item cards
    setOutOfStock(idSet);

    // When requesting, stops post request if false is returned.
    if (idSet.size > 0) {
      return true;
    } else {
      return false;
    }
  };

  // Ensure that a partner is selected and checks all cart item availability status when the component mounts
  useEffect(() => {
    if (!selectedPartner) navigate("/partner");
    idFetcher();
  }, []);

  // Function to handle the request button click
  const requestButton = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    setOutOfStock(new Set());
    const stockCheck = await idFetcher();

    // if any item is out of stock, toast is displayed and request is cancelled
    if (stockCheck) {
      Toast({
        message:
          "Sorry but one or more of your items are unavailable, please remove to checkout.",
        type: "is-danger",
      });
      setIsLoading(false);
      return;
    }

    // Otherwise construct the request data
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
            Name: generateRandomHexadecimal(), // unique temporary name for the request for AirTable management and stock checking purposes
            Partner: localStorage["partner"],
            "Additional Notes": notes,
            "Items You Would Like": items,
          },
        },
      ],
      typecast: true,
    };

    // Send the request data to the AirTable
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
          setErrorMessage("Error: " + data.error.message);
        } else {
          // Clear notes and cart after successful request
          setNotes("");
          setCartCount(0);
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

  // Function to handle missing information when requesting
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
        {/* Title */}
        <h1
          className="title has-text-centered mt-6 loading-effect"
          style={{ animationDelay: "0.23s" }}
        >
          MY CART
        </h1>
      </div>
      {isLoading ? (
        // Display a loading spinner while loading
        <BigSpinner size={75} />
      ) : (
        <>
          <h1
            className="has-text-centered is-size-5 my-4 loading-effect"
            style={{ animationDelay: "0.46s" }}
          >
            Hello, {selectedPartner} Member!
          </h1>
          <Link
            to="/partner"
            className="is-flex is-justify-content-center my-3 loading-effect"
            style={{ animationDelay: "0.66s" }}
          >
            {/* Button to change navigate to Partner Select */}
            <button
              className="button is-rounded"
              id="partner-button"
              aria-label="ChangePartner"
              role="button"
            >
              Change Partner
            </button>
          </Link>

          {/* Render the CartLister component with out-of-stock items */}
          {outOfStock ? (
            <CartLister outOfStock={outOfStock} setOutOfStock={setOutOfStock} />
          ) : (
            // Display a loading spinner while loading
            <BigSpinner size={75} />
          )}
          <div style={{ width: "60vw", margin: "auto" }}>
            {/* Additional notes textarea */}
            <textarea
              id="cart-textarea"
              className="textarea my-4 is-rounded loading-effect"
              style={{ animationDelay: "0.83s" }}
              placeholder="Additional Notes"
              value={notes}
              onChange={handleNotesChange}
            ></textarea>
          </div>
          <div
            className="is-flex is-justify-content-center loading-effect"
            style={{ animationDelay: "1s" }}
          >
            {/* Request button */}
            <button
              id="partner-button"
              aria-label="Request"
              role="button"
              className="button mb-1 is-rounded"
              type="button"
              onClick={
                notes &&
                Object.keys(localStorage).filter(
                  (k) => k !== "partner" && k !== "notes"
                ).length >= 1
                  ? requestButton
                  : missingInfo
              }
            >
              Request Items
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default Cart;
