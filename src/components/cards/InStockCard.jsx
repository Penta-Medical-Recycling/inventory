import RemoveCartLogo from "../../assets/RemoveCartLogo";
import AddCartLogo from "../../assets/AddCartLogo";
import PentaContext from "../../context/PentaContext";
import React, { useContext, useState } from "react";
import ImageIcon from "../../assets/ImageIcon";
import CardBody from "./CardBody";

// InStockCard component renders individual item cards

const InStockCard = ({ item, onRemove, inCart }) => {
  const { setCartCount, cartCount, setIsCartPressed } =
    useContext(PentaContext);

  // Local state to manage card discard animation
  const [discard, setDiscard] = useState(false);

  return (
    <div
      className={`outer-card fade-in ${
        onRemove || (discard && inCart) ? "fade-out" : ""
      }`}
    >
      <div
        className={`card fade-in ${
          onRemove || (discard && inCart) ? "fade-out" : ""
        }`}
        key={item["Item ID"]}
      >
        {/* Render the card body with item details */}
        <CardBody item={item} centered={true}></CardBody>
        {/* Footer holds Google Image Search, and Add/Remove to Cart Buttons */}
        {/* Button colors swap depending on whether items is in cart or not */}
        <footer className="card-footer">
          {/* Button to open a Google image search based on item's information */}
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

          {/* Conditional rendering of Add to Cart or Remove from Cart button */}
          {!localStorage.getItem([item["Item ID"]]) ? (
            <button
              className="button card-footer-item add-button"
              aria-label="AddToCart"
              role="button"
              style={{
                color: "white",
              }}
              onClick={() => {
                // Add item to local storage cart
                localStorage.setItem(item["Item ID"], JSON.stringify(item));
                // Update cart count
                setCartCount(cartCount + 1);
                // Trigger cart animation
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
                  // If user is on cart page, remove it with animation
                  setCartCount(cartCount - 1);
                  setDiscard(true);
                  setIsCartPressed(true);
                  setTimeout(() => {
                    localStorage.removeItem(item["Item ID"]);
                    setIsCartPressed(false);
                  }, 1000);
                } else {
                  // If user is on home page, remove it immediately
                  localStorage.removeItem(item["Item ID"]);
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

      {/* Badge to display item quantity if greater than 1 */}
      {item["Qty."] > 1 ? (
        <div className="card-badge">{item["Qty."]} pcs</div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default InStockCard;
