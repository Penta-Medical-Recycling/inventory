import React, { useState } from "react";
import OutOfStockCard from "./cards/OutOfStockCard";
import InStockCard from "./cards/InStockCard";

const CartLister = ({ outOfStock, setOutOfStock }) => {
  const [button, setButton] = useState(1);
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
              button={button}
              setButton={setButton}
              setOutOfStock={setOutOfStock}
              key={item["Item ID"]}
            />
          ) : (
            <InStockCard
              item={item}
              button={button}
              setButton={setButton}
              key={item["Item ID"]}
            />
          ))
        );
      })}
    </div>
  );
};

export default CartLister;
