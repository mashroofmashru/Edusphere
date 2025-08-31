import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios";
function App() {
  axios.get("http://localhost:5000/hello")
     .then(res => console.log(res.data));

  return (
    <>
    </>
  )
}

export default App
