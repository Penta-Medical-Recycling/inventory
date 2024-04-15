import HomeLister from "../components/home/HomeLister";
import { useContext, useState } from "react";
import PentaContext from "../context/PentaContext";
import Pagination from "../components/home/Pagination";
import Tags from "../components/home/Tags";
import Search from "../components/home/Search";
import PopUpCard from "../components/cards/PopUpCard";
import PentaProvider from "../context/PentaProvider";

function Home() {
  const { isSideBarActive, showModal} = useContext(PentaContext);

  // State to control card removal animation.
  const [onRemove, setOnRemove] = useState(false);

  //fetching message for pop-up
  const apiKey = "patn9gZ37SyMZFlpA.a905836b6861c9e07e7672e4a35d021f62fd188a5e6a179e012039f1548f0c1c";
  const apiUrl = "https://api.airtable.com/v0/appVq0I1h8SzD5K39/tblAmKhDQR8YxQeqG";
  const message = fetch(apiUrl, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${apiKey}`
    }
  }).then(response => response.json()).then(msg => console.log(msg.records[0].fields.Message))

  return (
    <>
      {showModal && <PopUpCard />}
      <div className={isSideBarActive ? "sidebar-active" : ""}>
        <div id="text-section">
          {/* Page Title */}
          <h1
            className="is-size-2 has-text-weight-bold has-text-centered loading-effect"
            id="penta-title"
            style={{ animationDelay: "0.107s" }}
          >
            Penta Medical Recycling Inventory
          </h1>
          {/* Introduction Text */}
          <p
            className="my-6 mx-6 is-size-5 has-text-centered loading-effect"
            style={{ width: "60%", animationDelay: "0.214s" }}
          >
            To submit a request, simply click the 'Add to Cart' button on the
            item's card and proceed to the cart above. Once there, select your
            partner affiliation and click 'Request Items.'
          </p>

          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Search></Search>
          </div>
          {/* Tags Filter */}
          <Tags></Tags>
          {/* Download Instructions */}
          <p
            className="my-6 mx-6 has-text-centered loading-effect"
            id="scroll-to"
            style={{ animationDelay: "0.642s" }}
          >
            If you would like to download a copy of the current page click the
            icon to the right of the search bar.
          </p>
        </div>
        {/* Top Pagination*/}
        <Pagination bottom={false} onRemove={onRemove}></Pagination>
        {/* List of Inventory Items */}
        <HomeLister onRemove={onRemove} setOnRemove={setOnRemove} />
        {/* Bottom Pagination */}
        <Pagination bottom={true} onRemove={onRemove}></Pagination>
      </div>
    </>
  );
}

export default Home;
