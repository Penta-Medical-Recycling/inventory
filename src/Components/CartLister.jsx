import React, { useState, useEffect, useContext } from "react";
import PentaContext from "../context/PentaContext";
import RemoveCartLogo from "../assets/RemoveCartLogo";
import ImageIcon from "../assets/ImageIcon";
import OutOfStockCard from "./OutOfStockCard";
const CartLister = ({ outOfStock, setOutOfStock }) => {
  const { cartCount, setCartCount, setIsCartPressed } =
    useContext(PentaContext);

  const [button, setButton] = useState(1);

  return (
    <div id="cardDiv">
      {Object.entries(localStorage).map(([key, value]) => {
        let item = "";
        if (key !== "partner" && key !== "notes") {
          item = JSON.parse(value);
        }
        return (
          item &&
          (outOfStock.has(item["Item ID"]) ? (
            <OutOfStockCard
              item={item}
              button={button}
              setButton={setButton}
              setOutOfStock={setOutOfStock}
              key={item["Item ID"]}
            />
          ) : (
            <div
              // className={`card ${cardsVisible ? "visible" : ""}`}
              className="card visible"
              key={item["Item ID"]}
            >
              <div>
                <header className="card-header">
                  <div className="has-text-centered" style={{ width: "100%" }}>
                    <p
                      className="has-text-weight-bold ml-3 my-3"
                      style={{ fontSize: "18px" }}
                    >
                      {item["Description (from SKU)"]}
                    </p>
                    <p
                      style={{ marginTop: "-12px" }}
                      className="has-text-grey ml-3 mb-3"
                    >
                      {item["Item ID"]}
                    </p>
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
                    <div className="has-text-centered" style={{ width: "50%" }}>
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
                    <div className="has-text-centered" style={{ width: "50%" }}>
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
                <a
                  className={`button card-footer-item ${
                    !localStorage.getItem([item["Item ID"]])
                      ? "images-button-red"
                      : "images-button-blue"
                  }`}
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    item.StringSearch
                  )}&tbm=isch`}
                  target="_blank"
                >
                  <ImageIcon color={"black"}></ImageIcon>
                </a>
                <button
                  className="button card-footer-item remove-button"
                  style={{
                    color: "white",
                  }}
                  onClick={() => {
                    localStorage.removeItem(item["Item ID"]);
                    setButton(button + 1);
                    setCartCount(cartCount - 1);
                    setIsCartPressed(true);
                    setTimeout(() => {
                      setIsCartPressed(false);
                    }, 1000);
                  }}
                >
                  <RemoveCartLogo></RemoveCartLogo>
                </button>
              </footer>
            </div>
          ))
        );
      })}
    </div>
  );
};

export default CartLister;
