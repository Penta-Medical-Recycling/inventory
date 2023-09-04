import React from "react";

const CardBody = ({ item, centered }) => {
  return (
    <>
      <header className="card-header">
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
          <p style={{ marginTop: "-12px" }} className="has-text-grey ml-3 mb-3">
            {item["Item ID"]}
          </p>
        </div>
      </header>
      <p
        className="has-text-weight-bold has-text-centered mt-4"
        style={{ fontSize: "18px" }}
      >
        {item["Tag"]}
      </p>
      <hr className="mb-4 mt-3" style={{ margin: "0 auto", width: "80%" }}></hr>
      <div className="content mx-5 mb-5">
        {item["Manufacturer"] && (
          <div className="mb-4 has-text-centered" style={{ width: "50%" }}>
            <p className="has-text-weight-bold" style={{ margin: "0" }}>
              Manufacturer
            </p>
            <p>{item["Manufacturer"]}</p>
          </div>
        )}
        {item["Size"] && (
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
