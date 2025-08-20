import React, { useContext, useState } from "react";
import RemoveCartLogo from "../../assets/RemoveCartLogo";
import AddCartLogo from "../../assets/AddCartLogo";
import PentaContext from "../../context/PentaContext";
import ImageIcon from "../../assets/ImageIcon";
import CardBody from "./CardBody";
import QuantityModal from "./QuantityModal";
import MessageModal from "./MessageModal";
import Toast from "../Toast";

const InStockCard = ({ item, onRemove, inCart, allVisibleItems }) => {
  const { setCartCount, cartCount, setIsCartPressed } = useContext(PentaContext);
  const [discard, setDiscard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [hasSizeField, setHasSizeField] = useState(false);

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

  const handleAddToCart = () => {
    const hasSize = !!item?.Size;
    setHasSizeField(hasSize);

    const name =
      item?.["Description (from SKU)"]?.[0] ||
      item?.["Item Name"] ||
      item?.["Name"] ||
      item?.["Component"] ||
      item?.["Model"] ||
      item?.["SKU"]?.[0] ||
      "Unnamed Item";

    if (name === "Unnamed Item") {
      alert("Item Name is missing. Cannot proceed.");
      return;
    }

    setItemName(name);
    setShowModal(true);
  };

 const handleQuantitySubmit = (unitsRequested, selectedSize = null, currentItemId) => {
  if (isNaN(unitsRequested) || unitsRequested <= 0) {
    setShowModal(false);
    return;
  }

  const allItems = JSON.parse(sessionStorage.getItem("allInventoryItems") || "[]");
    if (!Array.isArray(allItems) || allItems.length === 0) {
  setMessageContent(
    `"${itemName}" inventory is still loading. Please wait a moment and try again.`
  );
  setShowMessage(true);
  setShowModal(false);
  return;
}

  const matchingItems = allItems.filter(
    (entry) =>
      entry?.["Description (from SKU)"]?.[0] === itemName ||
      entry?.["Item Name"] === itemName ||
      entry?.["Name"] === itemName ||
      entry?.["Component"] === itemName ||
      entry?.["Model"] === itemName ||
      entry?.["SKU"]?.[0] === itemName
  );

  const availableItems = matchingItems.filter((entry) => {
    const saved = localStorage.getItem(entry["Item ID"]);
    if (saved) return false;

    const itemSize = parseFloat(entry?.["Size"]);

    if (selectedSize?.exact) {
      return itemSize === parseFloat(selectedSize.exact);
    }

    if (selectedSize?.range) {
      return (
        itemSize >= selectedSize.range[0] &&
        itemSize <= selectedSize.range[1]
      );
    }

    return true;
  });

  if (unitsRequested > availableItems.length) {
    setMessageContent(
      `Only ${availableItems.length} unit(s) of "${itemName}" are currently in stock. Please lower your quantity.`
    );
    setShowMessage(true);
    setShowModal(false);
    return;
  }

  let addedCount = 0;

  // ✅ STEP 1: Add the clicked item first (regardless of FIFO)
  const clickedItem = availableItems.find((entry) => entry["Item ID"] === currentItemId);
  if (clickedItem) {
    localStorage.setItem(
      currentItemId,
      JSON.stringify({
        ...clickedItem,
        ["Qty."]: 1,
        ...(selectedSize && { ["Selected Size"]: selectedSize })
      })
    );
    setCartCount((prev) => prev + 1);
    addedCount++;
  }

  // ✅ STEP 2: Continue with FIFO for the remaining quantity
  for (let i = 0; i < availableItems.length && addedCount < unitsRequested; i++) {
    const entry = availableItems[i];
    const entryId = entry["Item ID"];

    if (entryId === currentItemId || localStorage.getItem(entryId)) continue; // Skip already added item or duplicates

    localStorage.setItem(
      entryId,
      JSON.stringify({
        ...entry,
        ["Qty."]: 1,
        ...(selectedSize && { ["Selected Size"]: selectedSize })
      })
    );
    setCartCount((prev) => prev + 1);
    addedCount++;
  }

  setShowModal(false);
  setIsCartPressed(true);
  setTimeout(() => setIsCartPressed(false), 1000);
  Toast({ message: `"${itemName}" added to cart`, type: "is-success" });
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
        <div className={`card fade-in ${onRemove || (discard && inCart) ? "fade-out" : ""}`} key={item["Item ID"]}>
          <CardBody item={item} centered={true} />

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
              <>
                <button
                  className="button card-footer-item remove-button"
                  aria-label="DecrementQty"
                  style={{ color: "white" }}
                  onClick={handleRemoveOneFromCart}
                >
                  <RemoveCartLogo />
                </button>
                <button
                  className="button card-footer-item add-button"
                  aria-label="IncrementQty"
                  style={{ color: "white" }}
                  onClick={handleAddToCart}
                >
                  <AddCartLogo />
                </button>
              </>
            ) : (
              <button
                className="button card-footer-item add-button"
                aria-label="AddToCart"
                style={{ color: "white" }}
                onClick={handleAddToCart}
              >
                <AddCartLogo />
              </button>
            )}
          </footer>
        </div>

        {qtyInCart > 0 && <div className="card-badge">{qtyInCart} pcs</div>}
      </div>

      {showModal && (
        <QuantityModal
          itemName={itemName}
          currentItemId={item["Item ID"]}
          hasSize={hasSizeField}
          onSubmit={(unitsRequested, selectedSize) =>
            handleQuantitySubmit(unitsRequested, selectedSize, item["Item ID"])
          }
          onClose={() => setShowModal(false)}
        />
      )}

      {showMessage && (
        <MessageModal
          message={messageContent}
          onClose={() => setShowMessage(false)}
        />
      )}
    </>
  );
};

export default InStockCard;
