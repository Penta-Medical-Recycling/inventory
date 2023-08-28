import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import Partner from "./pages/Partner";

function App() {
  return (
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
