import logo from "../assets/PentaLogo.png";
import { Link } from "react-router-dom";
import React, { useContext } from "react";
import PentaContext from "../context/PentaContext";
import CartLogo from "../assets/CartLogo";

const NavBar = () => {
  const { selectedPartner, cartCount, isCartPressed, isSideBarActive } =
    useContext(PentaContext);

  return (
    <div>
      <nav id="nav" className={isSideBarActive ? "sidebar-active" : ""}>
        {/* Link to the home page or cart page */}
        <Link to="/" id="logo">
          <div className="logo-container">
            {/* Display the Penta logo */}
            <img src={logo} className="logo" alt="logo"></img>
          </div>
        </Link>

        {/* Link to the cart page if a partner is selected, or partner selection page otherwise */}
        <Link to={selectedPartner ? "/cart" : "/partner"} id="shopping-cart">
          {/* Display the cart icon */}
          <CartLogo></CartLogo>
          <div className={`badge ${isCartPressed ? "animate" : ""}`}>
            {/* Display the cart count with badge animation if cart is pressed */}
            <p>{cartCount}</p>
          </div>
        </Link>
      </nav>
      <div style={{ width: "100%", height: "120px" }}></div>
    </div>
  );
};

export default NavBar;
