import React from "react";
import OutOfStockCard from "./cards/OutOfStockCard";
import InStockCard from "./cards/InStockCard";

const CartLister = ({ outOfStock, setOutOfStock, itemValidationStatus }) => {
  return (
    <div id="cardDiv">
      {Object.entries(localStorage).map(([key, value]) => {
        let item = "";
        if (key !== "partner" && key !== "notes") {
          item = JSON.parse(value);
        }

        const itemId = item?.["Item ID"];
        const loading = itemValidationStatus[itemId] !== "done";

        const cardStyle = {
          opacity: loading ? 0.4 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 0.3s ease"
        };

        return (
          item &&
          (outOfStock.has(itemId) ? (
            <div style={cardStyle} key={itemId}>
              <OutOfStockCard
                item={item}
                setOutOfStock={setOutOfStock}
              />
            </div>
          ) : (
            <div style={cardStyle} key={itemId}>
              <InStockCard item={item} inCart={true} />
            </div>
          ))
        );
      })}
    </div>
  );
};


export default CartLister;
