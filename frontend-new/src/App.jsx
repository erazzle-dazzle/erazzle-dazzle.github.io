import React from "react";
import { Routes, Route } from "react-router-dom";
import StartPage from "./pages/Startpage.jsx";
import GamePage from "./pages/Gamepage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  );
}


export default App;