import React, { useContext, useState } from "react";
import { Package, Trash2 } from "lucide-react";
import PentaContext from "../context/PentaContext";
import { getItemDisplayName } from "../lib/cartBulkAdd";

export const getCartItemImageUrl = (item, inventoryGroups = []) => {
  const attachment = Array.isArray(item.Image) ? item.Image[0] : null;
  const attachmentUrl =
    attachment?.thumbnails?.small?.url ||
    attachment?.thumbnails?.large?.url ||
    attachment?.url;
  if (attachmentUrl) return attachmentUrl;

  const rawSkuCode = item["SKU Item Code"];
  const skuCodes = (Array.isArray(rawSkuCode) ? rawSkuCode : [rawSkuCode])
    .filter(Boolean)
    .map(String);
  const group = inventoryGroups.find((candidate) =>
    candidate.skuCodes?.some((code) => skuCodes.includes(String(code)))
  );
  return group?.imageUrl || group?.imageUrls?.[0] || null;
};

const CartItemImage = ({ item, inventoryGroups }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getCartItemImageUrl(item, inventoryGroups);

  return (
    <div className="cart-list__media">
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Package size={22} strokeWidth={1.75} aria-hidden="true" />
      )}
    </div>
  );
};

const CartLister = ({ outOfStock, setOutOfStock, itemValidationStatus }) => {
  const { inventoryGroups, setCartCount } = useContext(PentaContext);
  const [, setRevision] = useState(0);
  const cartItems = Object.entries(localStorage)
    .filter(([key]) => key !== "partner" && key !== "notes")
    .map(([, value]) => JSON.parse(value))
    .filter(Boolean);

  const removeItem = (itemId) => {
    localStorage.removeItem(itemId);
    setCartCount((count) => Math.max(0, count - 1));
    setOutOfStock?.((items) => {
      const next = new Set(items || []);
      next.delete(itemId);
      return next;
    });
    setRevision((revision) => revision + 1);
  };

  return (
    <section className="cart-list" aria-label="Cart items">
      <div className="cart-list__header">
        <h2>Items</h2>
        <span>{cartItems.length} {cartItems.length === 1 ? "item" : "items"}</span>
      </div>
      <div className="cart-list__rows">
        {cartItems.map((item) => {
        const itemId = item?.["Item ID"];
        const loading = itemValidationStatus[itemId] === "pending";
        const verificationFailed = itemValidationStatus[itemId] === "error";
        const unavailable = outOfStock.has(itemId);
        const manufacturer = item["Name (from Manufacturer)"];
        const details = [
          Array.isArray(manufacturer) ? manufacturer[0] : manufacturer,
          item["Model/Type"],
          item.Size != null && item.Size !== "" ? `Size ${item.Size}` : null,
        ].filter(Boolean);

        return (
          <article
            className={`cart-list__row${unavailable ? " is-unavailable" : ""}${loading ? " is-loading" : ""}`}
            key={itemId}
          >
            <CartItemImage item={item} inventoryGroups={inventoryGroups} />
            <div className="cart-list__content">
              <div className="cart-list__title-line">
                <h3>{getItemDisplayName(item)}</h3>
                {unavailable && <span className="cart-list__status">Unavailable</span>}
                {verificationFailed && (
                  <span className="cart-list__status is-warning">Couldn't verify</span>
                )}
              </div>
              {itemId && <p className="cart-list__item-id">{itemId}</p>}
              {details.length > 0 && <p className="cart-list__details">{details.join(" · ")}</p>}
            </div>
            <button
              type="button"
              className="cart-list__remove"
              aria-label={`Remove ${getItemDisplayName(item)} from cart`}
              title="Remove from cart"
              disabled={loading}
              onClick={() => removeItem(itemId)}
            >
              <Trash2 size={19} aria-hidden="true" />
            </button>
          </article>
        );
      })}
      </div>
      {cartItems.length === 0 && <p className="cart-list__empty">Your cart is empty.</p>}
    </section>
  );
};


export default CartLister;
