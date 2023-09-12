import React from "react";

// CardBody component displays the details of an inventory item

const CardBody = ({ item, centered }) => {
  // Centered prop is used in the case the item is out of stock, there is an overlayed banner that shifts the text.
  return (
    <>
      <header className="card-header">
        {/* Display item description and ID */}
        <div
          className={centered ? "has-text-centered" : "has-text-right mr-5"}
          style={
            centered ? { width: "100%" } : { width: "50%", marginLeft: "auto" }
          }
        >
          <p
            className="has-text-weight-bold ml-3 my-3"
            style={{ fontSize: "18px" }}
          >
            {item["Description (from SKU)"]}
          </p>
          <p style={{ marginTop: "-12px" }} className="ml-3 mb-3">
            {item["Item ID"]}
          </p>
        </div>
      </header>
      {/* Display item tag */}
      <p
        className="has-text-weight-bold has-text-centered mt-4"
        style={{ fontSize: "18px" }}
      >
        {item["Tag"]}
      </p>
      <hr className="mb-4 mt-3" style={{ margin: "0 auto", width: "80%" }}></hr>
      <div className="content mx-5 mb-5">
        {item["Name (from Manufacturer)"] && (
          // Display item manufacturer if available
          <div className="mb-4 has-text-centered" style={{ width: "50%" }}>
            <p className="has-text-weight-bold" style={{ margin: "0" }}>
              Manufacturer
            </p>
            <p>{item["Name (from Manufacturer)"]}</p>
          </div>
        )}
        {item["Size"] && (
          // Display item size if available
          <div className="has-text-centered" style={{ width: "50%" }}>
            <p
              className="has-text-weight-bold has-text-centered"
              style={{ margin: "0" }}
            >
              Size
            </p>
            <p>{item["Size"]}</p>
          </div>
        )}
        {item["Model/Type"] && (
          // Display item model/type if available
          <div className="has-text-centered" style={{ width: "50%" }}>
            <p
              className="has-text-weight-bold has-text-centered"
              style={{ margin: "0" }}
            >
              Model
            </p>
            <p>{item["Model/Type"]}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CardBody;
