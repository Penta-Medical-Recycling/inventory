import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CardLister from './Components/CardLister'

function App() {

  return (
    <>
      <h1 className='is-size-2 has-text-weight-bold' id='penta-title'>Penta Prosthetics Current Inventory</h1>
      <p className='my-6 has-text-centered'>To submit a request, please click the button below and complete the form. Please include the IDs from the list below for all of the items you would like to include in your request.</p>
      <button className='button is-info py-3 px-5'>Request Items</button>
      <p className='my-6'>If you would like to download a copy of the current page click the icon to the right of the search bar.</p>
      <CardLister />
    </>
  )
}

export default App
