import RemoveCartLogo from "../../assets/RemoveCartLogo";
import PentaContext from "../../context/PentaContext";
import CardBody from "./CardBody";
import React, { useContext, useState } from "react";

// OutOfStockCard component displays inventory item with an "out of stock" banner

const OutOfStockCard = ({ item }) => {
  const { setCartCount, cartCount, setIsCartPressed } =
    useContext(PentaContext);

  const [discard, setDiscard] = useState(false);

  return (
    <div className={`card fade-in ${discard ? "fade-out" : ""}`} key={item.id}>
      {/* Muted status pill indicating the item is no longer available */}
      <div className="card-status-pill">
        <svg
          className="card-status-icon"
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Unavailable
      </div>
      {/* Display item details */}
      <CardBody item={item} variant="cart"></CardBody>
      <footer className="card-footer">
        {/* Single button to remove the item from the cart */}
        <button
          className="button card-footer-item remove-button out-btn"
          aria-label="RemoveFromCart"
          role="button"
          style={{
            color: "white",
          }}
          onClick={() => {
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
