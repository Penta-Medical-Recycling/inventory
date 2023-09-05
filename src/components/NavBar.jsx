import logo from "../assets/PentaLogo.png";
import { Link } from "react-router-dom";
import React, { useContext } from "react";
import PentaContext from "../context/PentaContext";
import CartLogo from "../assets/CartLogo";

const NavBar = () => {
  const { selectedPartner, cartCount, isCartPressed, isActive } =
    useContext(PentaContext);

  return (
    <div>
      <nav id="nav" className={isActive ? "sidebar-active" : ""}>
        <Link to="/" id="logo">
          <div className="logo-container">
            <img src={logo} className="logo" alt="logo"></img>
          </div>
        </Link>

        <Link to={selectedPartner ? "/cart" : "/partner"} id="shopping-cart">
          <CartLogo></CartLogo>
          <div className={`badge ${isCartPressed ? "animate" : ""}`}>
            <p>{cartCount}</p>
          </div>
        </Link>
      </nav>
      <div style={{ width: "100%", height: "120px" }}></div>
    </div>
  );
};

export default NavBar;
