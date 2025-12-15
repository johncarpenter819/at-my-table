import React, { useState } from "react";
import { searchRecipes } from "../../api/spoonacular";
import RecipeCard from "../../Components/RecipeCard";

const RecipePage = () => {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    const data = await searchRecipes(query);
    setRecipes((data.results || []).map(normalizeRecipe));
    setLoading(false);
  };

  const normalizeRecipe = (recipe) => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    summary: recipe.summary,
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings,
  });

  return (
    <div className="recipes-page">
      <h1>Find Recipes</h1>

      <div className="recipe-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Recipes..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default RecipePage;
