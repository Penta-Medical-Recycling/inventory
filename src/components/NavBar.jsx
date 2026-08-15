import logo from "../assets/PentaLogo.png";
import { Link } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import PentaContext from "../context/PentaContext";
import CartLogo from "../assets/CartLogo";
import NotificationLogo from "../assets/NotificationLogo";
import PopUpCard from "../components/cards/PopUpCard";
import HowItWorks from "./home/HowItWorks";
import { ANNOUNCEMENT_DISMISSAL_KEY } from "../lib/storage";

const BULK_ORDER_ANNOUNCEMENT_ID = "bulk-order-workflow-v2";

const NavBar = () => {
  const {
    selectedPartner,
    cartCount,
    isCartPressed,
    isSideBarActive,
    popUpStatus,
    message,
  } = useContext(PentaContext);
  const [showModal, setShowModal] = useState(false);
  const announcementId = /bulk order/i.test(message)
    ? BULK_ORDER_ANNOUNCEMENT_ID
    : message;

  useEffect(() => {
    if (popUpStatus !== "Online" || !announcementId) {
      setShowModal(false);
      return;
    }

    setShowModal(
      localStorage.getItem(ANNOUNCEMENT_DISMISSAL_KEY) !== announcementId
    );
  }, [announcementId, popUpStatus]);

  const dismissAnnouncement = () => {
    if (announcementId) {
      localStorage.setItem(ANNOUNCEMENT_DISMISSAL_KEY, announcementId);
    }
    setShowModal(false);
  };

  return (
    <>
      {showModal && <PopUpCard showModal onClose={dismissAnnouncement} />}
      <nav id="nav" className={isSideBarActive ? "sidebar-active" : ""}>
          {/* Link to the home page or cart page */}
          <Link to="/" id="logo">
            <div className="logo-container">
              {/* Display the Penta logo */}
              <img src={logo} className="logo" alt="logo"></img>
            </div>
          </Link>
          
          {/* Right-aligned group containing the help, notification and cart icons */}
          <div className="nav-icons">
            {/* On-demand explanation of the request flow */}
            <HowItWorks />

            {popUpStatus === "Online" && (
              <button
                type="button"
                className="logo nav-icon-hover size-11 border-0 bg-transparent p-0"
                aria-label="Announcements"
                onClick={() =>
                  showModal ? dismissAnnouncement() : setShowModal(true)
                }
              >
                <NotificationLogo />
              </button>
            )}

            {/* Link to the cart page if a partner is selected, or partner selection page otherwise */}
            <Link
              to={selectedPartner ? "/cart" : "/partner"}
              id="shopping-cart"
              className="size-11 items-center justify-center"
            >
              {/* Display the cart icon */}
              <span className="nav-icon-hover">
                <CartLogo></CartLogo>
              </span>
              <div className={`badge ${isCartPressed ? "animate" : ""}`}>
                {/* Display the cart count with badge animation if cart is pressed */}
                <p>{cartCount}</p>
              </div>
            </Link>
          </div>
      </nav>
      
    </>
  );
};

export default NavBar;
