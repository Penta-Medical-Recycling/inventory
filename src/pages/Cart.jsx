import React, { useEffect, useState } from "react";
import CartLister from "../Components/CartLister";
import { useNavigate } from "react-router-dom";

function Cart({ cartCount, setCartCount }) {
  const navigate = useNavigate()
  useEffect(()=>{
    if(!localStorage.getItem('partner')) navigate('/partner')
  },[])
  const [errorMessage, setErrorMessage] = useState();
  const [notes, setNotes] = useState("");

  const handleNotesChange = (event) => {
    setNotes(event.target.value); // Update notes when changed
  };

  const requestButton = (event) => {
    event.preventDefault();
    const BaseID = "appBrTbPbyamI0H6Z";
    const APIKey = "keyi3gjKvW7SaqhE4";
    const tableName = "Requests";
    setErrorMessage("");
    const items = [];
    Object.values(localStorage).forEach(([key, value]) => {
      if (key !== 'partner') items.push(JSON.parse(value)["Item ID"]);
    }
    );
    const url = `https://api.airtable.com/v0/${BaseID}/${tableName}`;
    const data = {
      records: [
        {
          fields: {
            Name: "temp value",
            Partner: localStorage['partner'],
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
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    setNotes("");
    const partner = localStorage['partner'];
    localStorage.clear();
    localStorage.setItem('partner', partner);
  };

  const missingInfo = () => {
    !notes && localStorage.length === 1 ?
      setErrorMessage("Please add additional notes, and add items to your cart") :
      !notes ?
        setErrorMessage("Please add additional notes") :
        setErrorMessage("Please add items to your cart");
  };

  return (
    <>
      <div id="text-section">
        <h1 className="title has-text-centered my-6">CART</h1>
      </div>

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
            notes && localStorage.length > 1
              ? requestButton
              : missingInfo
          }
        >
          Request Items
        </button>
      </div>
      <p className="has-text-centered has-text-danger mb-4">{errorMessage}</p>
    </>
  );
}

export default Cart;
