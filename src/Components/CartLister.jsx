import React, { useState, useEffect } from "react";

const CartLister = ({ cartCount, setCartCount }) => {
  const [button, setButton] = useState(1);

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
    </>
  );
};

export default CartLister;
