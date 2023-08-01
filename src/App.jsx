import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import NavBar from './Components/NavBar';

function App() {

  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='cart' element={<Cart />}></Route>
      </Routes>
    </>
  )
}

export default App
