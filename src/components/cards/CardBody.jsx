import React from "react";

// CardBody renders the information display for an inventory item.
// variant: "stock" (default) or "cart". The "cart" variant adds top spacing so the
// content clears the "Unavailable" status pill in OutOfStockCard.
const CardBody = ({ item, variant = "stock" }) => {
  const rawTags = item["Tag"];
  const tags = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];

  const description = item["Description (from SKU)"];
  const itemId = item["Item ID"];
  const manufacturer = item["Name (from Manufacturer)"];
  const size = item["Size"];
  const model = item["Model/Type"];

  const specs = [
    manufacturer && { label: "Manufacturer", value: manufacturer },
    model && { label: "Model", value: model },
    size !== undefined && size !== null && size !== "" && { label: "Size", value: size },
  ].filter(Boolean);

  return (
    <div
      className={`card-body-content ${
        variant === "cart" ? "card-body-content--cart" : ""
      }`}
    >
      {tags.length > 0 && (
        <div className="card-tag-row">
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="card-tag-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-heading">
        <h3 className="card-title">{description}</h3>
        {itemId && <p className="card-item-id">{itemId}</p>}
      </div>

      {specs.length > 0 && (
        <dl className="card-specs">
          {specs.map((spec) => (
            <React.Fragment key={spec.label}>
              <dt className="card-spec-label">{spec.label}</dt>
              <dd className="card-spec-value">{spec.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
    </div>
  );
};

export default CardBody;
