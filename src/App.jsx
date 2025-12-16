import React from "react";
import { Routes, Route } from "react-router-dom";
import "./global.css";
import LandingPage from "./Pages/LandingPage/LandingPage";
import UserLandingPage from "./Pages/UserLandingPage/UserLandingPage";
import RecipesPage from "./Pages/Recipes/RecipesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/user" element={<UserLandingPage username="John" />} />
      <Route path="/recipes" element={<RecipesPage username="John" />} />
    </Routes>
  );
}

export default App;
