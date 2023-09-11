import React from "react";
import OutOfStockCard from "./cards/OutOfStockCard";
import InStockCard from "./cards/InStockCard";

const CartLister = ({ outOfStock, setOutOfStock }) => {
  return (
    <div id="cardDiv">
      {Object.entries(localStorage).map(([key, value]) => {
        let item = "";
        if (key !== "partner" && key !== "notes") {
          // Parse the stored JSON items from localStorage
          item = JSON.parse(value);
        }
        return (
          item &&
          (outOfStock.has(item["Item ID"]) ? (
            // Render an OutOfStockCard if the item is unavailable
            <OutOfStockCard
              item={item}
              setOutOfStock={setOutOfStock}
              key={item["Item ID"]}
            />
          ) : (
            // Render an InStockCard if the item is in stock
            <InStockCard item={item} key={item["Item ID"]} inCart={true} />
          ))
        );
      })}
    </div>
  );
};

export default CartLister;
