import HomeLister from "../components/home/HomeLister";
import { useEffect, useContext, useRef } from "react";
import PentaContext from "../context/PentaContext";
import Pagination from "../components/home/Pagination";
import Tags from "../components/home/Tags";
import Search from "../components/home/Search";

function Home() {
  const { isActive } = useContext(PentaContext);

  return (
    <div className={isActive ? "sidebar-active" : ""}>
      <div id="text-section">
        <h1
          className="is-size-2 has-text-weight-bold has-text-centered loading-effect"
          id="penta-title"
          style={{ animationDelay: "0.167s" }}
        >
          Penta Prosthetics Current Inventory
        </h1>
        <p
          className="my-6 mx-6 is-size-5 has-text-centered loading-effect"
          style={{ width: "60%", animationDelay: "0.33s" }}
        >
          To submit a request, please click the “add to cart” button on the
          items card and visit the cart above. Then choose the partner you are
          and click request items.
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
          style={{ animationDelay: "1.16s" }}
        >
          If you would like to download a copy of the current page click the
          icon to the right of the search bar.
        </p>
      </div>
      <Pagination bottom={false}></Pagination>
      <HomeLister />
      <Pagination bottom={true}></Pagination>
    </div>
  );
}

export default Home;
