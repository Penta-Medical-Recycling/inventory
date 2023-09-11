import HomeLister from "../components/home/HomeLister";
import { useEffect, useContext, useRef, useState } from "react";
import PentaContext from "../context/PentaContext";
import Pagination from "../components/home/Pagination";
import Tags from "../components/home/Tags";
import Search from "../components/home/Search";

function Home() {
  const { isSideBarActive } = useContext(PentaContext);

  const [onR, setR] = useState(false);

  return (
    <div className={isSideBarActive ? "sidebar-active" : ""}>
      <div id="text-section">
        <h1
          className="is-size-2 has-text-weight-bold has-text-centered loading-effect"
          id="penta-title"
          style={{ animationDelay: "0.107s" }}
        >
          Penta Prosthetics Current Inventory
        </h1>
        <p
          className="my-6 mx-6 is-size-5 has-text-centered loading-effect"
          style={{ width: "60%", animationDelay: "0.214s" }}
        >
          To submit a request, simply click the 'Add to Cart' button on the
          item's card and proceed to the cart above. Once there, select your
          partner affiliation and click 'Request Items.'
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <Search></Search>
        </div>
        <Tags></Tags>
        <p
          className="my-6 mx-6 has-text-centered loading-effect"
          id="scroll-to"
          style={{ animationDelay: "0.642s" }}
        >
          If you would like to download a copy of the current page click the
          icon to the right of the search bar.
        </p>
      </div>
      <Pagination bottom={false} onR={onR}></Pagination>
      <HomeLister onR={onR} setR={setR} />
      <Pagination bottom={true} onR={onR}></Pagination>
    </div>
  );
}

export default Home;
