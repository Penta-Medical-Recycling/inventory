import React, { useContext } from "react";
import PentaContext from "../../context/PentaContext";

const Pagination = ({ bottom, onR }) => {
  const { page, offset, setOffset } = useContext(PentaContext);

  const scrollToTop = () => {
    setTimeout(() => {
      const navbarHeight = document.querySelector("#nav").offsetHeight;
      const targetDiv = document.querySelector("#paginator");

      if (targetDiv) {
        const targetPosition = targetDiv.offsetTop - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          // behavior: "smooth",
        });
      }
    }, 1750);
  };

  const pageClick = (nextPage) => {
    if (nextPage === true) {
      setOffset(offset + 1);
    } else {
      setOffset(offset - 1);
    }
    if (bottom === true) scrollToTop();
  };

  return (
    <div id="paginator">
      {page === "Next" ? (
        <div
          className={`is-flex is-justify-content-center is-align-items-center fade-in ${
            onR ? "fade-out" : ""
          }`}
        >
          <div
            style={{ marginLeft: "44px" }}
            className="is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag"
          >
            <p>{offset + 1}</p>
          </div>
          <p
            className="is-size-4 ml-1 is-text-weight-bold pag-btn"
            style={{ cursor: "pointer" }}
            onClick={() => {
              pageClick(true);
            }}
          >
            <i className="fas fas fa-angle-double-right"></i>
          </p>
        </div>
      ) : page === "Previous" ? (
        <div
          className={`is-flex is-justify-content-center is-align-items-center fade-in ${
            onR ? "fade-out" : ""
          }`}
        >
          <p
            className="is-size-4 mr-1 is-text-weight-bold pag-btn"
            style={{ cursor: "pointer" }}
            onClick={() => {
              pageClick(false);
            }}
          >
            <i className="fas fas fa-angle-double-left"></i>
          </p>
          <div
            style={{ marginRight: "44px" }}
            className="is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag"
          >
            <p>{offset + 1}</p>
          </div>
        </div>
      ) : page === "Next/Previous" ? (
        <div
          className={`is-flex is-justify-content-center is-align-items-center fade-in ${
            onR ? "fade-out" : ""
          }`}
        >
          <p
            className="is-size-4 mr-1 is-text-weight-bold pag-btn"
            style={{ cursor: "pointer" }}
            onClick={() => {
              pageClick(false);
            }}
          >
            <i className="fas fas fa-angle-double-left"></i>
          </p>
          <div className="is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag">
            <p>{offset + 1}</p>
          </div>
          <p
            className="is-size-4 ml-1 is-text-weight-bold pag-btn"
            style={{ cursor: "pointer" }}
            onClick={() => {
              pageClick(true);
            }}
          >
            <i className="fas fas fa-angle-double-right"></i>
          </p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Pagination;
