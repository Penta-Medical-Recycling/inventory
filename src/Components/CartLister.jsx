import React, { useState, useEffect } from "react";

const CartLister = ({ cartCount, setCartCount }) => {
  const [button, setButton] = useState(1);

  return (
    <>
      <div id="cardDiv">
        {Object.entries(localStorage).map(([key, value]) => {
          let item = "";
          if (key !== "partner" && key !== "notes") {
            item = JSON.parse(value);
          }
          return item ? (
              <div className="card" key={item.id}>
                <div>
                  <header class="card-header">
                    <div
                      className="has-text-centered"
                      style={{ width: "100%" }}
                    >
                      <p
                        className="has-text-weight-bold ml-3 my-3"
                        style={{ fontSize: "18px" }}
                      >
                        {item["Description (from SKU)"]}
                      </p>
                      {/* <p className="has-text-grey ml-3 mb-3">ID: {item.fields["Item ID"]}</p> */}
                    </div>
                  </header>
                  <div className="">
                    <p
                      className="has-text-weight-bold has-text-centered mt-4"
                      style={{ fontSize: "18px" }}
                    >
                      {item["Tag"]}
                    </p>
                    <hr
                      className="mb-4 mt-3"
                      style={{ margin: "0 auto", width: "80%" }}
                    ></hr>
                  </div>
                  <div className="content mx-5 mb-5">
                    {item["Manufacturer"] && (
                      <div
                        className="mb-4 has-text-centered"
                        style={{ width: "50%" }}
                      >
                        <p
                          className="has-text-weight-bold"
                          style={{ margin: "0" }}
                        >
                          Manufacturer
                        </p>
                        <p>{item["Manufacturer"]}</p>
                      </div>
                    )}
                    {item["Size"] && (
                      <div
                        className="has-text-centered"
                        style={{ width: "50%" }}
                      >
                        <p
                          className="has-text-weight-bold has-text-centered"
                          style={{ margin: "0" }}
                        >
                          Size
                        </p>
                        <p>{item["Size"]}</p>
                      </div>
                    )}
                    {item["Model/Type"] && (
                      <div
                        className="has-text-centered"
                        style={{ width: "50%" }}
                      >
                        <p
                          className="has-text-weight-bold has-text-centered"
                          style={{ margin: "0" }}
                        >
                          Model
                        </p>
                        <p>{item["Model/Type"]}</p>
                      </div>
                    )}
                  </div>
                </div>
                <footer className="card-footer">
                  <button
                    className="button card-footer-item"
                    style={{ backgroundColor: "#ff5c47", color: "white" }}
                    onClick={() => {
                      localStorage.removeItem(item["Item ID"]);
                      setButton(button + 1);
                      setCartCount(cartCount - 1);
                    }}
                  >
                    Remove From Cart
                  </button>
                </footer>
              </div>
            ) : (
            <></>
          );
        })}
      </div>
    </>
  );
};

export default CartLister;
