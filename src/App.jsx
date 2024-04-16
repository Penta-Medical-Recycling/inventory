import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import Partner from "./pages/Partner";
import Maintenance from "./pages/Maintenance";
import { useEffect, useState } from "react";

/**
 * Main application component.
 *
 * This component serves as the main structure of the application, including the sidebar,
 * navigation bar, and routing for different pages.
 *
 * Due to how GitHub Pages URL end in the repository name, a Hash Router is used for routing.
 *
 * @returns {JSX.Element} The main application component.
 */

function App() {
  // // Checking the status of the site from the database
  // const [serverStatus, setServerStatus] = useState("Online")
  // //fetching server status
  // const apiKey = "patn9gZ37SyMZFlpA.a905836b6861c9e07e7672e4a35d021f62fd188a5e6a179e012039f1548f0c1c";
  // const apiUrl = "https://api.airtable.com/v0/appVq0I1h8SzD5K39/tblAmKhDQR8YxQeqG";
  // fetch(apiUrl, {
  //   method: "GET",
  //   headers: {
  //       "Content-Type": "application/json",
  //       "authorization": `Bearer ${apiKey}`
  //   }
  // }).then(response => response.json()).then(msg => setServerStatus(msg.records[0].fields.Status))

  const [serverStatus, setServerStatus] = useState("Online")

  useEffect(() => {
    const apiKey = "patn9gZ37SyMZFlpA.a905836b6861c9e07e7672e4a35d021f62fd188a5e6a179e012039f1548f0c1c";
    const fetchStatus = async () => {
      const data = await fetch("https://api.airtable.com/v0/appVq0I1h8SzD5K39/tblAmKhDQR8YxQeqG", {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "authorization": `Bearer ${apiKey}`
          }
        }
      )

      const response = await data.json()
      setServerStatus(response.records[0].fields.Status)
      console.log(serverStatus)
    }

    fetchStatus()
  })
  
  return serverStatus === "Offline" ?
  (
    <Routes>
        <Route path="*" element={<Maintenance />}></Route>
    </Routes>
  ) :
  (
    <>
      <SideBar />
      <main>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/cart" element={<Cart />}></Route>
          <Route path="/partner" element={<Partner />}></Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
