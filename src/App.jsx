import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import NavBar from "./Components/NavBar";
import { useState } from "react";
import SideBar from "./Components/SideBar";

function App() {
  const [cartCount, setCartCount] = useState(localStorage.length);
  const [isActive, setIsActive] = useState(false);
  const [selected, setSelected] = useState([]);
  return (
    <>
      <SideBar
        isActive={isActive}
        setIsActive={setIsActive}
        selected={selected}
        setSelected={setSelected}
      />
      <NavBar cartCount={cartCount} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              cartCount={cartCount}
              setCartCount={setCartCount}
              isActive={isActive}
              setIsActive={setIsActive}
              selected={selected}
              setSelected={setSelected}
            />
          }
        ></Route>
        <Route
          path="/cart"
          element={<Cart cartCount={cartCount} setCartCount={setCartCount} />}
        ></Route>
      </Routes>
    </>
  );
}

export default App;
