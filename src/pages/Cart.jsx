import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import BigSpinner from "../assets/BigSpinner";
import CartLister from "../components/CartLister";
import Toast from "../components/Toast";
import PentaContext from "../context/PentaContext";

function Cart() {
  const { selectedPartner, setCartCount } = useContext(PentaContext);

  const ids = [];
  const [outOfStock, setOutOfStock] = useState();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const [isLoading, setIsLoading] = useState(false);
  const APIKey = import.meta.env.VITE_REACT_APP_API_KEY;

  function generateRandomHexadecimal() {
    return (
      "#" +
      Math.floor(Math.random() * 16777216)
        .toString(16)
        .toUpperCase()
    );
  }

  function getCurrentDateAsString() {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const year = String(currentDate.getFullYear());
    return `${month}/${day}/${year}`;
  }

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
    localStorage.setItem("notes", event.target.value);
  };

  const idFetcher = async () => {
    for (let [key, value] of Object.entries(localStorage)) {
      console.log(key, value);
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
      const searchString = `SEARCH("${id}", {Items You Would Like})`;
      const url = `https://api.airtable.com/v0/appBrTbPbyamI0H6Z/Requests?filterByFormula=${encodeURIComponent(
        searchString
      )}&maxRecords=1`;

      // const searchString = `AND(OR(AND({Requests}=BLANK(),{Shipment Status}=BLANK(),NOT({SKU}=""),{Qty.}=1),AND(NOT({SKU}=""),{Qty.}>1)),{Item ID}='${id}')`;
      // const url = `https://api.airtable.com/v0/appnx8gtnlQx5b7nI/Inventory?filterByFormula=${encodeURIComponent(
      //   searchString
      // )}&maxRecords=1`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${APIKey}`,
          },
        });

        const data = await response.json();

        if (data.records && data.records.length > 0) {
          idSet.add(id);
        }

        // if (data.records && data.records.length === 0) {
        //   idSet.add(id);
        // }
      } catch (error) {
        console.error(`Error fetching data for ID ${id}:`, error);
      }
    }

    setOutOfStock(idSet);
    if (idSet.size > 0) {
      return true;
    } else {
      return false;
    }
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

    // we also need to update the quantities
    // if the quantity is 1, and has never been requested, then quantity is not effected
    // if quantity is greater than 2, we subtract quanity by 1 and it still appears in the pool
    // if quantity is equal to 3, we make quanityt 0 and still show up
    // if quanity is 0 and gets checked out we add 1
    const BaseID = "appBrTbPbyamI0H6Z";
    const tableName = "Requests";
    const items = [];
    Object.entries(localStorage).forEach(([key, value]) => {
      if (key !== "partner" && key !== "notes")
        items.push(JSON.parse(value)["Item ID"]);
    });
    console.log(`${localStorage["partner"]} ${generateRandomHexadecimal()}`);
    const url = `https://api.airtable.com/v0/${BaseID}/${tableName}`;
    const data = {
      records: [
        {
          fields: {
            Name: generateRandomHexadecimal(),
            Partner: localStorage["partner"],
            Created: getCurrentDateAsString(),
            "Additional Notes": notes,
            "Items You Would Like": items,
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
          setErrorMessage("Error: " + data.error.message);
        } else {
          console.log("Success:", data);
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
        <h1
          className="title has-text-centered mt-6 loading-effect"
          style={{ animationDelay: "0.23s" }}
        >
          MY CART
        </h1>
      </div>
      {isLoading ? (
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
            <button
              className="button is-rounded"
              id="partner-button"
              aria-label="ChangePartner"
              role="button"
            >
              Change Partner
            </button>
          </Link>

          {outOfStock ? (
            <CartLister outOfStock={outOfStock} setOutOfStock={setOutOfStock} />
          ) : (
            <BigSpinner size={75} />
          )}
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
          <div
            className="is-flex is-justify-content-center loading-effect"
            style={{ animationDelay: "1s" }}
          >
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
