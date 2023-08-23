import React, { useEffect, useState } from "react";
import CartLister from "../Components/CartLister";
import { useNavigate, Link } from "react-router-dom";
import LoadingScreen from "../Components/LoadingScreen";
import Toast from "../Components/Toast";

function Cart({ cartCount, setCartCount, selectedPartner }) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState();
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedPartner) navigate("/partner");
  }, []);

  const handleNotesChange = (event) => {
    setNotes(event.target.value); // Update notes when changed
    localStorage.setItem("notes", event.target.value); // Notes save across pages or reload
  };

  const requestButton = (event) => {
    event.preventDefault();
    setIsLoading(true)
    const BaseID = "appBrTbPbyamI0H6Z";
    // const APIKey = config.SECRET_API_KEY;
    const APIKey = import.meta.env.VITE_REACT_APP_API_KEY;
    const tableName = "Requests";
    setErrorMessage("");
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
          setIsLoading(false)
          Toast({ message: 'Thank you for working with us, we will get back to you as soon as possible!' });
        }
        
      })
      .catch((error) => {
        console.error("Error:", error);
        setNotes("Error");
      });

    //items like 23-2086 are still appearing despite already having been in some orders?
    //This is a problem for Mija, the data seems dirty, we need to clean it up.
    //also a message to show that the order was successful should show.
    //Maybe should we send an automatic email notification? the message also includes the order number to look for in email.
  };

  const missingInfo = () => {
    !notes &&
      Object.keys(localStorage).filter((k) => k !== "partner" && k !== "notes")
        .length === 0
      ? setErrorMessage(
        "Please add additional notes, and add items to your cart"
      )
      : !notes
        ? setErrorMessage("Please add additional notes")
        : setErrorMessage("Please add items to your cart");
  };

  return (
    <>
      <div id="text-section">
        <h1 className="title has-text-centered mt-6">CART</h1>
      </div>
      {isLoading? <LoadingScreen />: (<>
        <h1 className="has-text-centered is-size-5 my-4">
        Hello, {selectedPartner} Member!
      </h1>
      <Link to="/partner" className="is-flex is-justify-content-center my-3">
        <button className="button">Change Partner</button>
      </Link>

      <CartLister cartCount={cartCount} setCartCount={setCartCount} />

      <div style={{ width: "60vw", margin: "auto" }}>
        <textarea
          className="textarea my-4"
          placeholder="Additional Notes"
          value={notes}
          onChange={handleNotesChange}
        ></textarea>
      </div>
      <div className="is-flex is-justify-content-center">
        <button
          className="button mb-1"
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
      <p className="has-text-centered has-text-danger mb-4">{errorMessage}</p>
      </>)}
    </>
  );
}

export default Cart;
