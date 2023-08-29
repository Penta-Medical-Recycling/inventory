import React, { useContext } from "react";
import PentaContext from "../../context/PentaContext";

const Pagination = ({ bottom }) => {
  const { page, offset, setOffset } = useContext(PentaContext);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <>
      {page === "Next" ? (
        <div className="is-flex is-justify-content-center is-align-items-center">
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
        <div className="is-flex is-justify-content-center is-align-items-center">
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
        <div className="is-flex is-justify-content-center is-align-items-center">
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
    </>
  );
};

export default Pagination;
