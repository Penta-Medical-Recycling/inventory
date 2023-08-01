import CartLister from "../Components/CartLister";

function Cart({cartCount, setCartCount}) {
  return (
    <>
      <div id="text-section">
        <h1>CART PAGE</h1>
      </div>
      <CartLister cartCount={cartCount} setCartCount={setCartCount}/>
    </>
  );
}

export default Cart;
