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

  useEffect(() => {
    if (!selectedPartner) navigate("/partner");
  }, []);

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
    localStorage.setItem("notes", event.target.value);
  };

  const idFetcher = async () => {
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
      const searchString = `SEARCH("${id}", {StringSearch})`;
      const url = `https://api.airtable.com/v0/appBrTbPbyamI0H6Z/Requests?filterByFormula=${encodeURIComponent(
        searchString
      )}&maxRecords=1`;

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
          "Sorry but one or more of your items are out of stock, please remove to checkout.",
        type: "is-danger",
      });
      setIsLoading(false);
      return;
    }
    const BaseID = "appBrTbPbyamI0H6Z";
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
            Name: "temp value",
            Partner: localStorage["partner"],
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
          CART
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
            <button className="button is-rounded" id="partner-button">
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
