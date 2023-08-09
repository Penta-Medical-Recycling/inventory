import React, { useState, useEffect } from "react";

const CartLister = ({ cartCount, setCartCount }) => {
  const BaseID = "appBrTbPbyamI0H6Z";
  const APIKey = "keyi3gjKvW7SaqhE4";
  const tableName = "Requests";
  const [button, setButton] = useState(1);

  const items = [];
  Object.values(localStorage).forEach((x) =>
    items.push(JSON.parse(x)["Item ID"])
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const url = `https://api.airtable.com/v0/${BaseID}/${tableName}`;

    const data = {
      records: [
        {
          fields: {
            Name: "Centrodsds de Protesis",
            Partner: "Centrodsds de Protesis",
            "Additional Notes":
              "EXAMPLE Items requested will be used in our next prosthetic clinic for new patients as well as for replacing some parts from old devices.",
            "Items You Would Like": items,
            Created: "2021-12-10",
            Status: "Filled",
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
  };

  return (
    <>
      <div id="cardDiv">
        {Object.values(localStorage).map((data) => {
          const item = JSON.parse(data);
          return (
            <div className="card" key={item.id}>
              <div className="card-content">
                <div className="content">
                  <p>ID: {item["Item ID"]}</p>
                  <p>Description: {item["Description (from SKU)"]}</p>
                  {item["Size"] ? <p>Size: {item["Size"]}</p> : <></>}
                  {item["Model/Type"] ? (
                    <p>Model: {item["Model/Type"]}</p>
                  ) : (
                    <></>
                  )}
                  {item["Manufacturer"] ? (
                    <p>Manufacturer: {item["Manufacturer"]}</p>
                  ) : (
                    <></>
                  )}
                  <p>STATUS:{item["Shipment Status"]}</p>
                  <button
                    className="button"
                    style={{ backgroundColor: "#ff5c47", color: "white" }}
                    onClick={() => {
                      localStorage.removeItem(item["Item ID"]);
                      setButton(button + 1);
                      setCartCount(cartCount - 1);
                    }}
                  >
                    Remove From Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit}>
        <label>Partners</label>
        <input type="text"></input>
        <label>Additional Notes</label>
        <input type="dropdown"></input>
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default CartLister;
