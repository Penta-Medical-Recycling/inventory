import React, { useState, useEffect } from "react";

const CardLister = ({ cartCount, setCartCount }) => {
  const [data, setData] = useState([]);
  const apiKey = "keyi3gjKvW7SaqhE4";
  const baseId = "appLiJPf3Iykl3Yui";
  const tableName = "Imported table";
  const [button, setButton] = useState(1);

  // Encode the table name to make it URL-safe
  const encodedTableName = encodeURIComponent(tableName);

  let url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}`;

  const skus = ["RF"]; // add SKUs from frontend
  const manufacturers = ["Ottobock"]; // add manufacturers from frontend

  if (skus.length > 0 || manufacturers.length > 0) {
    url += "?filterByFormula=OR(";

    if (skus.length > 0) {
      url += `${skus.map((sku) => `{SKU}='${sku}'`).join(",")}`;
      if (manufacturers.length !== 0) {
        url += ",";
      }
    }
    if (manufacturers.length > 0) {
      url += `${manufacturers
        .map((manufacturer) => `{Manufacturer}='${manufacturer}'`)
        .join(",")}`;
    }
    url += ")";
  }
  console.log(url);

  async function fetchData() {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // console.log(url);
      return data.records;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  useEffect(() => {
    fetchData().then((records) => {
      setData(records);
      console.log(records);
    });
  }, []);

  return (
    <div id="cardDiv">
      {data.map(
        (item) =>
          item.fields.SKU &&
          item.fields["Shipment Status"] === undefined && (
            <div className="card" key={item.id}>
              <div className="card-content">
                <div className="content">
                  <p>ID: {item.fields["Item ID"]}</p>
                  <p>Description: {item.fields["Description (from SKU)"]}</p>
                  {item.fields["Size"] && <p>Size: {item.fields["Size"]}</p>}
                  {item.fields["Model/Type"] && (
                    <p>Model: {item.fields["Model/Type"]}</p>
                  )}
                  {item.fields["Manufacturer"] && (
                    <p>Manufacturer: {item.fields["Manufacturer"]}</p>
                  )}
                  {/* <p>STATUS:{item.fields["Shipment Status"]}</p> */}
                  {!localStorage.getItem([item.fields["Item ID"]]) && button ? (
                    <button
                      className="button"
                      style={{ backgroundColor: "#78d3fb", color: "white" }}
                      onClick={() => {
                        localStorage.setItem(
                          item.fields["Item ID"],
                          JSON.stringify(item.fields)
                        );
                        setButton(button + 1);
                        setCartCount(cartCount + 1);
                      }}
                    >
                      Add to cart
                    </button>
                  ) : (
                    <button
                      className="button"
                      style={{ backgroundColor: "#ff5c47", color: "white" }}
                      onClick={() => {
                        localStorage.removeItem(item.fields["Item ID"]);
                        setButton(button + 1);
                        setCartCount(cartCount - 1);
                      }}
                    >
                      Remove From Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default CardLister;
