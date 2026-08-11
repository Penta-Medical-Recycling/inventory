import { useContext, useState } from "react";
import { ChevronDown, Package, Trash2 } from "lucide-react";
import PentaContext from "../context/PentaContext";
import { getItemDisplayName } from "../lib/cartBulkAdd";

const naturalCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const firstValue = (value) => (Array.isArray(value) ? value[0] : value);

const compareSizes = (left, right) => {
  const leftMissing = left == null || left === "";
  const rightMissing = right == null || right === "";
  if (leftMissing !== rightMissing) return leftMissing ? 1 : -1;
  if (leftMissing) return 0;

  const leftNumber = Number(left);
  const rightNumber = Number(right);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber;
  }
  return naturalCollator.compare(String(left), String(right));
};

const groupCartItems = (items) => {
  const groups = new Map();

  items.forEach((item) => {
    const name = String(getItemDisplayName(item));
    const skuCode = firstValue(item?.["SKU Item Code"]);
    const skuId = firstValue(item?.SKU);
    const key = skuCode ? `code:${skuCode}` : skuId ? `sku:${skuId}` : `name:${name}`;

    if (!groups.has(key)) {
      groups.set(key, { key, name, items: [] });
    }
    groups.get(key).items.push(item);
  });

  return Array.from(groups.values())
    .map((group) => {
      group.items.sort((left, right) => {
        const sizeOrder = compareSizes(left?.Size, right?.Size);
        if (sizeOrder !== 0) return sizeOrder;
        return naturalCollator.compare(String(left?.["Item ID"] || ""), String(right?.["Item ID"] || ""));
      });

      const sizeGroups = new Map();
      const unsizedItems = [];
      group.items.forEach((item) => {
        const size = item?.Size;
        if (size == null || size === "") {
          unsizedItems.push(item);
          return;
        }

        const sizeKey = `size:${size}`;
        if (!sizeGroups.has(sizeKey)) {
          sizeGroups.set(sizeKey, {
            key: sizeKey,
            label: `Size ${size}`,
            size,
            items: [],
          });
        }
        sizeGroups.get(sizeKey).items.push(item);
      });

      return { ...group, sizeGroups: Array.from(sizeGroups.values()), unsizedItems };
    })
    .sort((left, right) => {
      const nameOrder = naturalCollator.compare(left.name, right.name);
      return nameOrder || naturalCollator.compare(left.key, right.key);
    });
};

// eslint-disable-next-line react-refresh/only-export-components
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

// eslint-disable-next-line react/prop-types
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

// eslint-disable-next-line react/prop-types
const CartLister = ({ outOfStock, setOutOfStock, itemValidationStatus }) => {
  const { inventoryGroups, setCartCount } = useContext(PentaContext);
  const cartItems = Object.entries(localStorage)
    .filter(([key]) => key !== "partner" && key !== "notes")
    .map(([, value]) => JSON.parse(value))
    .filter(Boolean);
  const cartGroups = groupCartItems(cartItems);
  const [, setRevision] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState(
    () => new Set(cartGroups.map((group) => group.key))
  );
  const unavailableIds = outOfStock || new Set();
  const allGroupsExpanded =
    cartGroups.length > 0 && cartGroups.every((group) => expandedGroups.has(group.key));

  const toggleGroup = (groupKey) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const toggleAllGroups = () => {
    setExpandedGroups(
      allGroupsExpanded ? new Set() : new Set(cartGroups.map((group) => group.key))
    );
  };

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
        {cartGroups.length > 1 && (
          <button type="button" className="cart-list__expand-all" onClick={toggleAllGroups}>
            {allGroupsExpanded ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>
      <div className="cart-list__rows">
        {cartGroups.map((group, groupIndex) => {
          const expanded = expandedGroups.has(group.key);
          const unavailableCount = group.items.filter((item) =>
            unavailableIds.has(item?.["Item ID"])
          ).length;
          const verificationFailedCount = group.items.filter(
            (item) => itemValidationStatus?.[item?.["Item ID"]] === "error"
          ).length;
          const regionId = `cart-sku-group-${groupIndex}`;
          const toggleId = `${regionId}-toggle`;
          const renderItemRow = (item) => {
            const itemId = item?.["Item ID"];
            const loading = itemValidationStatus?.[itemId] === "pending";
            const verificationFailed = itemValidationStatus?.[itemId] === "error";
            const unavailable = unavailableIds.has(itemId);
            const manufacturer = firstValue(item["Name (from Manufacturer)"]);
            const details = [manufacturer, item["Model/Type"]].filter(Boolean);

            return (
              <div
                className={`cart-list__row${unavailable ? " is-unavailable" : ""}${loading ? " is-loading" : ""}`}
                key={itemId}
              >
                <div className="cart-list__content">
                  <div className="cart-list__title-line">
                    <h4 className="cart-list__item-id">{itemId}</h4>
                    {unavailable && <span className="cart-list__status">Unavailable</span>}
                    {verificationFailed && (
                      <span className="cart-list__status is-warning">
                        {"Couldn't verify"}
                      </span>
                    )}
                  </div>
                  {details.length > 0 && (
                    <p className="cart-list__details">{details.join(" · ")}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="cart-list__remove"
                  aria-label={`Remove ${getItemDisplayName(item)} ${itemId} from cart`}
                  title="Remove from cart"
                  disabled={loading}
                  onClick={() => removeItem(itemId)}
                >
                  <Trash2 size={19} aria-hidden="true" />
                </button>
              </div>
            );
          };

          return (
            <article className="cart-sku" key={group.key}>
              <button
                type="button"
                className="cart-sku__toggle"
                id={toggleId}
                aria-expanded={expanded}
                aria-controls={regionId}
                aria-label={`${expanded ? "Collapse" : "Expand"} ${group.name}, ${group.items.length} ${group.items.length === 1 ? "item" : "items"}`}
                onClick={() => toggleGroup(group.key)}
              >
                <ChevronDown className="cart-sku__chevron" size={20} aria-hidden="true" />
                <CartItemImage item={group.items[0]} inventoryGroups={inventoryGroups} />
                <span className="cart-sku__summary">
                  <span className="cart-sku__name">{group.name}</span>
                  {(unavailableCount > 0 || verificationFailedCount > 0) && (
                    <span className="cart-sku__statuses">
                      {unavailableCount > 0 && (
                        <span className="cart-list__status">{unavailableCount} unavailable</span>
                      )}
                      {verificationFailedCount > 0 && (
                        <span className="cart-list__status is-warning">
                          {verificationFailedCount} {"couldn't verify"}
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className="cart-sku__count">
                  <strong>{group.items.length}</strong>
                  {group.items.length === 1 ? "item" : "items"}
                </span>
              </button>

              {expanded && (
                <div
                  className="cart-sku__contents"
                  id={regionId}
                  role="region"
                  aria-labelledby={toggleId}
                >
                  {group.sizeGroups.map((sizeGroup) => (
                    <section className="cart-size-group" key={sizeGroup.key}>
                      <div className="cart-size-group__header">
                        <h3>{sizeGroup.label}</h3>
                        <span>
                          {sizeGroup.items.length} {sizeGroup.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      {sizeGroup.items.map(renderItemRow)}
                    </section>
                  ))}
                  {group.unsizedItems.length > 0 && (
                    <section className="cart-size-group">
                      <div className="cart-size-group__header">
                        <h3>Universal size</h3>
                        <span>
                          {group.unsizedItems.length}{" "}
                          {group.unsizedItems.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      {group.unsizedItems.map(renderItemRow)}
                    </section>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
      {cartItems.length === 0 && <p className="cart-list__empty">Your cart is empty.</p>}
    </section>
  );
};


export default CartLister;
