export const INVENTORY_PAGE_SIZE = 36;

export function getInventoryPagePlan(pageIndex, groups, pageSize = INVENTORY_PAGE_SIZE) {
  const safePage = Math.max(0, pageIndex);
  const groupStart = safePage * pageSize;
  const pageGroups = groups.slice(groupStart, groupStart + pageSize);
  const individualCount = pageSize - pageGroups.length;
  const individualStart = Math.max(0, groupStart - groups.length);

  return {
    groups: pageGroups,
    individualCount,
    individualStart,
    hasMoreGroups: groupStart + pageGroups.length < groups.length,
  };
}
