import { useEffect, useRef, useState } from "react";
import { Boxes } from "lucide-react";
import { trimTransparentImage } from "../../lib/trimTransparentImage";

const CYCLE_MS = 1400;

const InventoryGroupCard = ({ group, onSelect }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayImageUrls, setDisplayImageUrls] = useState([]);
  const intervalRef = useRef(null);

  const imageUrls =
    group.imageUrls?.length ? group.imageUrls : group.imageUrl ? [group.imageUrl] : [];
  const showImages = imageUrls.length > 0 && !imageFailed;
  const hasMultiple = showImages && imageUrls.length > 1;
  const imageUrlKey = imageUrls.join("\u0000");

  useEffect(() => {
    let cancelled = false;
    setDisplayImageUrls(imageUrls);
    Promise.all(imageUrls.map(trimTransparentImage)).then((processedUrls) => {
      if (!cancelled) setDisplayImageUrls(processedUrls);
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrlKey]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const stopCycling = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveIndex(0);
  };

  const startCycling = () => {
    if (!hasMultiple || intervalRef.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Advance immediately so the hover feels responsive, then keep cycling.
    setActiveIndex((current) => (current + 1) % imageUrls.length);
    intervalRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % imageUrls.length);
    }, CYCLE_MS);
  };

  return (
    <button
      type="button"
      className="inventory-group-card fade-in"
      onClick={() => onSelect(group)}
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
      onFocus={startCycling}
      onBlur={stopCycling}
      aria-label={`Browse ${group.title}`}
    >
      <span className="inventory-group-card__media">
        {showImages ? (
          <>
            <span className="inventory-group-card__frame">
              {displayImageUrls.map((url, index) => (
                <img
                  key={url}
                  src={url}
                  className="inventory-group-card__slide"
                  style={{ opacity: index === activeIndex ? 1 : 0 }}
                  alt={
                    hasMultiple
                      ? `${group.title} inventory ${index + 1}`
                      : `${group.title} inventory`
                  }
                  onError={() => setImageFailed(true)}
                />
              ))}
            </span>
            {hasMultiple && (
              <span className="inventory-group-card__dots" aria-hidden="true">
                {imageUrls.map((url, index) => (
                  <span
                    key={url}
                    className={`inventory-group-card__dot${
                      index === activeIndex ? " is-active" : ""
                    }`}
                  />
                ))}
              </span>
            )}
          </>
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
