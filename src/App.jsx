import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import NavBar from './Components/NavBar';
import {useState} from 'react'
import { useEffect } from 'react';

function App() {
  const [cartCount, setCartCount] = useState(localStorage.length)
  return (
    <>
      <NavBar cartCount={cartCount}/>
      <Routes>
        <Route path='/' element={<Home cartCount={cartCount} setCartCount={setCartCount}/>}></Route>
        <Route path='/cart' element={<Cart cartCount={cartCount} setCartCount={setCartCount}/>}></Route>
      </Routes>
    </>
  )
}

export default App
