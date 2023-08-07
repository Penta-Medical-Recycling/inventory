import React, { useState, useEffect } from "react";
import CartLister from "../Components/CartLister";

function Cart({ cartCount, setCartCount }) {
  const partner = "CFINS";
  const notes = "nada";

  return (
    <>
      <div id="text-section">
        <h1 className='title has-text-centered my-6'>CART</h1>
      </div>
      <CartLister cartCount={cartCount} setCartCount={setCartCount} />
    </>
  );
}

export default Cart;
