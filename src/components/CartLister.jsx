import React from "react";
import OutOfStockCard from "./cards/OutOfStockCard";
import InStockCard from "./cards/InStockCard";

const CartLister = ({ outOfStock, setOutOfStock }) => {
  return (
    <div id="cardDiv">
      {Object.entries(localStorage).map(([key, value]) => {
        let item = "";
        if (key !== "partner" && key !== "notes") {
          item = JSON.parse(value);
        }
        return (
          item &&
          (outOfStock.has(item["Item ID"]) ? (
            <OutOfStockCard
              item={item}
              setOutOfStock={setOutOfStock}
              key={item["Item ID"]}
            />
          ) : (
            <InStockCard item={item} key={item["Item ID"]} inCart={true} />
          ))
        );
      })}
    </div>
  );
};

export default CartLister;
