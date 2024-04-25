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

  const [serverStatus, setServerStatus] = useState("Online")

  useEffect(() => {
    const apiKey = "patEd00q4REEnaMAs.893047f939ee5d324f5c26d1b5cb4491e1ec6e86ce78ce2cf604b47f0cb98631";
    const fetchStatus = async () => {
      //changeGP
      const data = await fetch("https://api.airtable.com/v0/appZM47xckWRqZ8RH/Site-Status", {
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
