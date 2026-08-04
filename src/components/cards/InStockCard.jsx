import React, { useContext, useState } from "react";
import RemoveCartLogo from "../../assets/RemoveCartLogo";
import AddCartLogo from "../../assets/AddCartLogo";
import PentaContext from "../../context/PentaContext";
import ImageIcon from "../../assets/ImageIcon";
import CardBody from "./CardBody";
import Toast from "../Toast";
import { getItemDisplayName } from "../../lib/cartBulkAdd";

const InStockCard = ({ item, onRemove, inCart, allVisibleItems }) => {
  const { setCartCount, cartCount, setIsCartPressed } = useContext(PentaContext);
  const [discard, setDiscard] = useState(false);

  const isInCart = localStorage.getItem(item["Item ID"]);
  const parsedItem = isInCart ? JSON.parse(isInCart) : null;
  const qtyInCart = parsedItem?.["Qty."] || 0;

  const updateCartQuantity = (itemToUpdate, newQty) => {
    const updatedItem = {
      ...itemToUpdate,
      ["Qty."]: newQty,
    };
    localStorage.setItem(itemToUpdate["Item ID"], JSON.stringify(updatedItem));
  };

  // Instant single add: the happy path. Adds exactly this unit (Qty 1) with no
  // modal and no size prompt, since the card already is a specific sized unit.
  const handleInstantAdd = () => {
    if (localStorage.getItem(item["Item ID"])) return;

    const name = getItemDisplayName(item);
    if (name === "Unnamed Item") {
      alert("Item Name is missing. Cannot proceed.");
      return;
    }

    localStorage.setItem(
      item["Item ID"],
      JSON.stringify({ ...item, ["Qty."]: 1 })
    );
    setCartCount((prev) => prev + 1);
    setIsCartPressed(true);
    setTimeout(() => setIsCartPressed(false), 1000);
    Toast({ message: `"${name}" added to cart`, type: "is-success" });
  };

  const handleRemoveOneFromCart = () => {
    if (qtyInCart === 1) {
      localStorage.removeItem(item["Item ID"]);
      setCartCount(cartCount - 1);
    } else {
      updateCartQuantity(item, qtyInCart - 1);
    }

    setIsCartPressed(true);
    setTimeout(() => setIsCartPressed(false), 1000);
  };

  return (
    <>
      <div className={`outer-card fade-in ${onRemove || (discard && inCart) ? "fade-out" : ""}`}>
        <div className={`card fade-in ${qtyInCart > 0 ? "is-in-cart" : ""} ${onRemove || (discard && inCart) ? "fade-out" : ""}`} key={item["Item ID"]}>
          <CardBody item={item} variant="stock" />

          <footer className="card-footer">
            <a
              className={`button card-footer-item ${!isInCart ? "images-button-red" : "images-button-blue"}`}
              href={`https://www.google.com/search?q=${encodeURIComponent(item.ImageSearch)}&tbm=isch`}
              target="_blank"
              aria-label={`Google Search: ${item.ImageSearch}`}
            >
              <ImageIcon color={"black"} />
            </a>

            {isInCart ? (
              <button
                className="button card-footer-item remove-button"
                aria-label="DecrementQty"
                style={{ color: "white" }}
                onClick={handleRemoveOneFromCart}
              >
                <RemoveCartLogo />
              </button>
            ) : (
              <button
                className="button card-footer-item add-button"
                aria-label="AddToCart"
                style={{ color: "white" }}
                onClick={handleInstantAdd}
              >
                <AddCartLogo />
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
};

export default InStockCard;
