import logo from "../assets/PentaLogo.png";
import { Link } from "react-router-dom";
import React, { useContext, useState } from "react";
import PentaContext from "../context/PentaContext";
import CartLogo from "../assets/CartLogo";
import Cookies from "js-cookie";
import NotificationLogo from "../assets/NotificationLogo";
import PopUpCard from "../components/cards/PopUpCard";

const NavBar = () => {
  const { selectedPartner, cartCount, isCartPressed, isSideBarActive, popUpStatus } = useContext(PentaContext);
  const [showModal, setShowModal] = useState(popUpStatus === "Offline" ? false : Cookies.get('hasVisited') ? false : true);

  // Checking for first-visit of user on webpage and state for toggling the pop-up content
  const hasVisited = Cookies.get('hasVisited');
  if (!hasVisited) {
    let in1Hour = 1/24;
    Cookies.set('hasVisited', true, { expires : in1Hour })
  }


  return (
    <>
      {showModal && <PopUpCard showModal = {showModal} setShowModal = {setShowModal} />}
      <div>
        <nav id="nav" className={isSideBarActive ? "sidebar-active" : ""}>
          {/* Link to the home page or cart page */}
          <Link to="/" id="logo">
            <div className="logo-container">
              {/* Display the Penta logo */}
              <img src={logo} className="logo" alt="logo"></img>
            </div>
          </Link>
          
          { popUpStatus === "Online" && 
            <div className= "logo" style={{ marginLeft : "45%" }} onClick={() => setShowModal(!showModal)}>
            <NotificationLogo />
          </div> 
          }

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
      
    </>
  );
};

export default NavBar;
