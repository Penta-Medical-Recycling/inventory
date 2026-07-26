import HomeLister from "../components/home/HomeLister";
import { useEffect, useContext, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PentaContext from "../context/PentaContext";
import Pagination from "../components/home/Pagination";
import Tags from "../components/home/Tags";
import Search from "../components/home/Search";

function Home() {
  const {
    isSideBarActive,
    inventoryGroups,
    areInventoryGroupsLoading,
    offset,
    setOffset,
    offsetArray,
    setOffsetArray,
    setIsLoading,
  } = useContext(PentaContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const groupKey = searchParams.get("group");
  const activeGroup = inventoryGroups.find((group) => group.key === groupKey) || null;
  const previousGroupKey = useRef(groupKey);
  const overviewPagination = useRef({ offset: 0, offsetArray: [""] });

  // State to control card removal animation.
  const [onRemove, setOnRemove] = useState(false);

  useEffect(() => {
    if (!areInventoryGroupsLoading && groupKey && !activeGroup) {
      const next = new URLSearchParams(searchParams);
      next.delete("group");
      setSearchParams(next, { replace: true });
    }
  }, [activeGroup, areInventoryGroupsLoading, groupKey, searchParams, setSearchParams]);

  useEffect(() => {
    const previous = previousGroupKey.current;
    if (!previous && groupKey) {
      overviewPagination.current = { offset, offsetArray: [...offsetArray] };
      setOffset(0);
      setOffsetArray([""]);
    } else if (previous && !groupKey) {
      setOffset(overviewPagination.current.offset);
      setOffsetArray(overviewPagination.current.offsetArray);
    } else if (previous && groupKey && previous !== groupKey) {
      setOffset(0);
      setOffsetArray([""]);
    }
    previousGroupKey.current = groupKey;
  }, [groupKey]);

  const openGroup = (group) => {
    setIsLoading(true);
    const next = new URLSearchParams(searchParams);
    next.set("group", group.key);
    setSearchParams(next);
  };

  const closeGroup = () => {
    setIsLoading(true);
    const next = new URLSearchParams(searchParams);
    next.delete("group");
    setSearchParams(next);
  };

  return (
    <div className={isSideBarActive ? "sidebar-active" : ""}>
      <div id="text-section">
        {/* Page title */}
        <h1
          className="is-size-2 has-text-weight-bold has-text-centered"
          id="penta-title"
        >
          Penta Medical Recycling Inventory
        </h1>

        {/* Search Bar with filter button to its left */}
        <div id="search-row">
          {/* Filter button */}
          <Tags></Tags>
          <Search></Search>
        </div>
      </div>
      {activeGroup && (
        <div className="group-context" aria-label="Current inventory group">
          <div className="group-context__inner">
            <button type="button" className="group-context__back" onClick={closeGroup}>
              <ArrowLeft size={16} aria-hidden="true" />
              All items
            </button>
            <h2 className="group-context__title">{activeGroup.title}</h2>
          </div>
        </div>
      )}
      {/* Top Pagination*/}
      <Pagination bottom={false} onRemove={onRemove}></Pagination>
      {/* List of Inventory Items */}
      <HomeLister
        onRemove={onRemove}
        setOnRemove={setOnRemove}
        activeGroup={activeGroup}
        onSelectGroup={openGroup}
      />
      {/* Bottom Pagination */}
      <Pagination bottom={true} onRemove={onRemove}></Pagination>
    </div>
  );
}

export default Home;
