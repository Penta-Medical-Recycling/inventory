import RemoveCartLogo from "../../assets/RemoveCartLogo";
import AddCartLogo from "../../assets/AddCartLogo";
import PentaContext from "../../context/PentaContext";
import React, { useContext, useState, useEffect } from "react";
import ImageIcon from "../../assets/ImageIcon";
import CardBody from "./CardBody";

const InStockCard = ({ item, setButton, button, onR, inCart }) => {
  const { setCartCount, cartCount, setIsCartPressed, isLoading } =
    useContext(PentaContext);

  const [discard, setDiscard] = useState(false);

  return (
    <div
      className={`outer-card fade-in ${
        onR || (discard && inCart) ? "fade-out" : ""
      }`}
    >
      <div
        className={`card fade-in ${
          onR || (discard && inCart) ? "fade-out" : ""
        }`}
        key={item["Item ID"]}
      >
        <CardBody item={item} centered={true}></CardBody>
        <footer className="card-footer">
          <a
            className={`button card-footer-item ${
              !localStorage.getItem([item["Item ID"]])
                ? "images-button-red"
                : "images-button-blue"
            }`}
            href={`https://www.google.com/search?q=${encodeURIComponent(
              item.ImageSearch
            )}&tbm=isch`}
            target="_blank"
            aria-label={`Google Search: ${item.ImageSearch}`}
          >
            <ImageIcon color={"black"}></ImageIcon>
          </a>
          {!localStorage.getItem([item["Item ID"]]) && button ? (
            <button
              className="button card-footer-item add-button"
              aria-label="AddToCart"
              role="button"
              style={{
                color: "white",
              }}
              onClick={() => {
                localStorage.setItem(item["Item ID"], JSON.stringify(item));
                setButton(button + 1);
                setCartCount(cartCount + 1);
                setIsCartPressed(true);
                setTimeout(() => {
                  setIsCartPressed(false);
                }, 1000);
              }}
            >
              <AddCartLogo></AddCartLogo>
            </button>
          ) : (
            <button
              className="button card-footer-item remove-button"
              aria-label="RemoveFromCart"
              role="button"
              style={{
                color: "white",
              }}
              onClick={() => {
                if (inCart) {
                  setButton(button + 1);
                  setCartCount(cartCount - 1);
                  setDiscard(true);
                  setIsCartPressed(true);
                  setTimeout(() => {
                    localStorage.removeItem(item["Item ID"]);
                    setIsCartPressed(false);
                  }, 1000);
                } else {
                  localStorage.removeItem(item["Item ID"]);
                  setButton(button + 1);
                  setCartCount(cartCount - 1);
                  setDiscard(true);
                  setIsCartPressed(true);
                  setTimeout(() => {
                    setIsCartPressed(false);
                  }, 1000);
                }
              }}
            >
              <RemoveCartLogo></RemoveCartLogo>
            </button>
          )}
        </footer>
      </div>
      {item["Qty."] > 1 ? (
        <div className="card-badge">{item["Qty."]} pcs</div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default InStockCard;
