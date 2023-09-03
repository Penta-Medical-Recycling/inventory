import RemoveCartLogo from "../../assets/RemoveCartLogo";
import AddCartLogo from "../../assets/AddCartLogo";
import PentaContext from "../../context/PentaContext";
import React, { useContext, useState, useEffect } from "react";
import ImageIcon from "../../assets/ImageIcon";
import CardBody from "./CardBody";

const InStockCard = ({ item, setButton, button, onR, setR }) => {
  const { setCartCount, cartCount, setIsCartPressed, isLoading } =
    useContext(PentaContext);

  return (
    <div
      className={`card fade-in ${onR ? "fade-out" : ""}`}
      key={item["Item ID"]}
    >
      {/* <div className={`card loading-effect`} key={item["Item ID"]}> */}
      {/* <div className={`card ${isL ? "visible" : ""}`} key={item["Item ID"]}> */}
      <CardBody item={item} centered={true}></CardBody>
      <footer className="card-footer">
        <a
          className={`button card-footer-item ${
            !localStorage.getItem([item["Item ID"]])
              ? "images-button-red"
              : "images-button-blue"
          }`}
          href={`https://www.google.com/search?q=${encodeURIComponent(
            item.StringSearch
          )}&tbm=isch`}
          target="_blank"
        >
          <ImageIcon color={"black"}></ImageIcon>
        </a>
        {!localStorage.getItem([item["Item ID"]]) && button ? (
          <button
            className="button card-footer-item add-button"
            style={{
              color: "white",
            }}
            onClick={() => {
              localStorage.setItem(item["Item ID"], JSON.stringify(item));
              setButton(button + 1);
              setCartCount(cartCount + 1);
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
            style={{
              color: "white",
            }}
            onClick={() => {
              localStorage.removeItem(item["Item ID"]);
              setButton(button + 1);
              setCartCount(cartCount - 1);
              setIsCartPressed(true);
              setTimeout(() => {
                setIsCartPressed(false);
              }, 1000);
            }}
          >
            <RemoveCartLogo></RemoveCartLogo>
          </button>
        )}
      </footer>
    </div>
  );
};

export default InStockCard;
