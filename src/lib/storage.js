export const ANNOUNCEMENT_DISMISSAL_KEY = "penta:announcement-dismissed";
export const REQUEST_PARTY_KEY = "penta:request-party";

export const getRequestParty = (storage = localStorage) => {
  const stored = storage.getItem(REQUEST_PARTY_KEY);
  if (!stored) return null;

  try {
    const party = JSON.parse(stored);
    if (
      typeof party?.partnerId !== "string" ||
      typeof party?.partnerName !== "string" ||
      typeof party?.clinicianRequired !== "boolean"
    ) {
      return null;
    }
    if (
      party.clinicianRequired &&
      (typeof party.clinicianId !== "string" ||
        typeof party.clinicianName !== "string")
    ) {
      return null;
    }
    return party;
  } catch {
    return null;
  }
};

export const setRequestParty = (party, storage = localStorage) => {
  storage.setItem(REQUEST_PARTY_KEY, JSON.stringify(party));
};

export const clearRequestParty = (storage = localStorage) => {
  storage.removeItem(REQUEST_PARTY_KEY);
  storage.removeItem("partner");
};

export const isCartItemStorageKey = (key) =>
  key !== "notes" && key !== "partner" && !key.startsWith("penta:");

export const getCartItemKeys = (storage = localStorage) =>
  Object.keys(storage).filter(isCartItemStorageKey);

export const clearCartItems = (storage = localStorage) => {
  getCartItemKeys(storage).forEach((key) => storage.removeItem(key));
  storage.removeItem("notes");
};