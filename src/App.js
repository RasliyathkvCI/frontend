// src/App.js
import React from "react";
import VastManager from "./components/VastManager.jsx";
import "./App.css";
import VmapCreator from "./components/VmapCreator";

function App() {
  return (
    <div className="App">
      <div className="container">
        <h1>🎞️ VAST & VMAP Generator</h1>
        <VastManager  />
        <VmapCreator />
      </div>
    </div>
  );
}

export default App;
