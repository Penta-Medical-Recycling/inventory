export const SKU_GROUPS_TABLE = "SKU Groups";

const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeInventoryGroups(records = []) {
  const candidates = [];
  const seenKeys = new Set();

  for (const record of records) {
    const fields = record?.fields || {};
    const title = typeof fields.Name === "string" ? fields.Name.trim() : "";
    const key = typeof fields.Key === "string" ? fields.Key.trim() : "";
    const skuCodes = Array.isArray(fields["SKU Item Codes"])
      ? [...new Set(fields["SKU Item Codes"].map(String).map((code) => code.trim()).filter(Boolean))]
      : [];

    if (!fields.Active || !title || !KEY_PATTERN.test(key) || seenKeys.has(key) || skuCodes.length === 0) {
      continue;
    }

    const images = Array.isArray(fields.Image) ? fields.Image : [];
    const imageUrls = images
      .map((img) => img?.thumbnails?.large?.url || img?.url || null)
      .filter(Boolean);
    candidates.push({
      id: record.id,
      key,
      title,
      skuCodes,
      imageUrl: imageUrls[0] || null,
      imageUrls,
    });

    seenKeys.add(key);
  }

  candidates.sort(
    (left, right) => left.title.localeCompare(right.title) || left.key.localeCompare(right.key)
  );

  const claimedCodes = new Set();
  return candidates.flatMap((group) => {
    const skuCodes = group.skuCodes.filter((code) => !claimedCodes.has(code));
    skuCodes.forEach((code) => claimedCodes.add(code));
    return skuCodes.length ? [{ ...group, skuCodes }] : [];
  });
}
