import RemoveCartLogo from "../../assets/RemoveCartLogo";
import PentaContext from "../../context/PentaContext";
import CardBody from "./CardBody";
import React, { useContext } from "react";
const OutOfStockCard = ({ item, setButton, button }) => {
  const { setCartCount, cartCount, setIsCartPressed } =
    useContext(PentaContext);
  return (
    <div className={`card visible`} key={item.id}>
      <div className="ribbon-wrapper">
        <div className="ribbon ribbon-top-left">
          <span>Out Of Stock</span>
        </div>
        <CardBody item={item} centered={false}></CardBody>
      </div>
      <footer className="card-footer">
        <button
          className="button card-footer-item remove-button out-btn"
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
  );
};

export default OutOfStockCard;
