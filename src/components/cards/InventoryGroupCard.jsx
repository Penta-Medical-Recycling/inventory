import { useState } from "react";
import { Boxes } from "lucide-react";

const InventoryGroupCard = ({ group, onSelect }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = group.imageUrl && !imageFailed;

  return (
    <button
      type="button"
      className="inventory-group-card fade-in"
      onClick={() => onSelect(group)}
      aria-label={`Browse ${group.title}`}
    >
      <span className="inventory-group-card__media">
        {showImage ? (
          <img
            src={group.imageUrl}
            alt={`${group.title} inventory`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="inventory-group-card__placeholder" aria-hidden="true">
            <Boxes size={52} strokeWidth={1.5} />
          </span>
        )}
      </span>
      <span className="inventory-group-card__title">{group.title}</span>
    </button>
  );
};

export default InventoryGroupCard;
