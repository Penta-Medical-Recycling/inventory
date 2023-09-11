import React, { useContext, useState } from "react";
import PentaContext from "../../context/PentaContext";

// Pagination component sets the buttons for page navigation.

const Pagination = ({ bottom, onRemove }) => {
  const { page, offset, setOffset } = useContext(PentaContext);

  // State to disable pagination clicks while loading
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Scroll to the top of the page when navigating to the next page
  const scrollToTop = () => {
    setTimeout(() => {
      const navbarHeight = document.querySelector("#nav").offsetHeight;
      const targetDiv = document.querySelector("#paginator");

      if (targetDiv) {
        const targetPosition = targetDiv.offsetTop - navbarHeight;
        window.scrollTo({
          top: targetPosition,
        });
      }
    }, 1750);
  };

  /**
   * Handle page navigation when a page button is clicked.
   *
   * @param {boolean} nextPage - Indicates whether the user clicked "Next" (true) or "Previous" (false) page button.
   */
  const pageClick = (nextPage) => {
    // Check if the button is disabled; if it is, do nothing
    if (isButtonDisabled) return;

    // Disable the button to prevent rapid clicks and multiple navigations
    setIsButtonDisabled(true);

    // Adjust the offset based on whether the user clicked "Next" or "Previous"
    if (nextPage === true) {
      setOffset(offset + 1); // Increment offset for "Next" page
    } else {
      setOffset(offset - 1); // Decrement offset for "Previous" page
    }

    // Scroll to the top of the page when navigating to the next page if 'bottom' is true
    if (bottom === true) scrollToTop();

    // Enable the button again after a delay to prevent rapid changes
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1000); // Delay in milliseconds (1 second)
  };

  return (
    <div id="paginator">
      {page === "Next" ? (
        // Display only the "Next" page button
        <div
          className={`is-flex is-justify-content-center is-align-items-center fade-in ${
            onRemove ? "fade-out" : ""
          }`}
        >
          <div
            style={{ marginLeft: "44px" }}
            className="is-flex is-justify-content-center is-align-items-center has-text-weight-bold is-size-5 num-pag"
          >
            <p>{offset + 1}</p>
          </div>
          <p
            className={`is-size-4 ml-1 is-text-weight-bold pag-btn ${
              isButtonDisabled ? "disabled" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => {
              pageClick(true);
            }}
          >
            <i className="fas fas fa-angle-double-right"></i>
          </p>
        </div>
      ) : page === "Previous" ? (
        // Display only the "Previous" page button
        <div
          className={`is-flex is-justify-content-center is-align-items-center fade-in ${
            onRemove ? "fade-out" : ""
          }`}
        >
          <p
            className={`is-size-4 mr-1 is-text-weight-bold pag-btn ${
              isButtonDisabled ? "disabled" : ""
            }`}
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
        // Display both "Next" and "Previous" page buttons
        <div
          className={`is-flex is-justify-content-center is-align-items-center fade-in ${
            onRemove ? "fade-out" : ""
          }`}
        >
          <p
            className={`is-size-4 mr-1 is-text-weight-bold pag-btn ${
              isButtonDisabled ? "disabled" : ""
            }`}
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
            className={`is-size-4 ml-1 is-text-weight-bold pag-btn ${
              isButtonDisabled ? "disabled" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => {
              pageClick(true);
            }}
          >
            <i className="fas fas fa-angle-double-right"></i>
          </p>
        </div>
      ) : (
        // No page buttons displayed if page is not "Next," "Previous," or "Next/Previous" (When there is 36 or less results)
        <></>
      )}
    </div>
  );
};

export default Pagination;
