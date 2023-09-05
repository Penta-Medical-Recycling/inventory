import RemoveCartLogo from "../../assets/RemoveCartLogo";
import PentaContext from "../../context/PentaContext";
import CardBody from "./CardBody";
import React, { useContext, useState, useEffect } from "react";
const OutOfStockCard = ({ item, setButton, button }) => {
  const { setCartCount, cartCount, setIsCartPressed } =
    useContext(PentaContext);

  const [discard, setDiscard] = useState(false);

  return (
    <div className={`card fade-in ${discard ? "fade-out" : ""}`} key={item.id}>
      <div className="ribbon-wrapper">
        <div className="ribbon ribbon-top-left">
          <span>Unavailable</span>
        </div>
        <CardBody item={item} centered={false}></CardBody>
      </div>
      <footer className="card-footer">
        <button
          className="button card-footer-item remove-button out-btn"
          aria-label="RemoveFromCart"
          role="button"
          style={{
            color: "white",
          }}
          onClick={() => {
            setButton(button + 1);
            setCartCount(cartCount - 1);
            setDiscard(true);
            setIsCartPressed(true);
            setTimeout(() => {
              localStorage.removeItem(item["Item ID"]);
              setIsCartPressed(false);
            }, 1000);
          }}
        >
          <RemoveCartLogo></RemoveCartLogo>
        </button>
      </footer>
    </div>
  );
};

export default OutOfStockCard;
