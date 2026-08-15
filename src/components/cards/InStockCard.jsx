import { useContext, useState } from "react";
import { ExternalLink, Images, ShoppingCart } from "lucide-react";
import PentaContext from "../../context/PentaContext";
import CardBody from "./CardBody";
import Toast from "../Toast";
import { getItemDisplayName } from "../../lib/cartBulkAdd";

const InStockCard = ({ item, onRemove, inCart, allVisibleItems }) => {
  const { setCartCount, setIsCartPressed } = useContext(PentaContext);
  const [discard, setDiscard] = useState(false);

  const isInCart = localStorage.getItem(item["Item ID"]);
  const parsedItem = isInCart ? JSON.parse(isInCart) : null;
  const qtyInCart = parsedItem?.["Qty."] || 0;
  const itemName = getItemDisplayName(item);

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

    if (itemName === "Unnamed Item") {
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
    Toast({ message: `"${itemName}" added to cart`, type: "is-success" });
  };

  const handleRemoveOneFromCart = () => {
    if (qtyInCart === 1) {
      localStorage.removeItem(item["Item ID"]);
      setCartCount((count) => Math.max(0, count - 1));
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
          {isInCart && (
            <span
              className="sr-only"
              role="status"
              aria-label="In cart"
            >
              In cart
            </span>
          )}
          <CardBody item={item} variant="stock" />

          <footer className="inventory-card-actions">
            {isInCart ? (
              <button
                type="button"
                className="inventory-card-cart-action is-remove"
                aria-label={`Remove ${itemName} from cart`}
                onClick={handleRemoveOneFromCart}
              >
                <ShoppingCart size={14} aria-hidden="true" />
                Remove from cart
              </button>
            ) : (
              <button
                type="button"
                className="inventory-card-cart-action"
                aria-label={`Add ${itemName} to cart`}
                onClick={handleInstantAdd}
              >
                <ShoppingCart size={14} aria-hidden="true" />
                Add to cart
              </button>
            )}

            <a
              className="inventory-card-reference-action"
              href={`https://www.google.com/search?q=${encodeURIComponent(item.ImageSearch || itemName)}&tbm=isch`}
              target="_blank"
              rel="noreferrer"
              aria-label={`View reference images for ${itemName}`}
            >
              <Images size={14} aria-hidden="true" />
              <span>View reference images</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </footer>
        </div>
      </div>
    </>
  );
};

export default InStockCard;
