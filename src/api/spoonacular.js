const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;
const BASE_URL = "https://api.spoonacular.com";

export async function searchRecipes(query) {
  const res = await fetch(
    `${BASE_URL}/recipes/complexSearch?query=${query}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`
  );
  if (!res.ok) {
    throw new Error("Failed to search recipes");
  }
  return res.json();
}

export async function getRecipeNutrition(id) {
  const res = await fetch(
    `${BASE_URL}/recipes/${id}/nutritionWidget.json?apiKey=${API_KEY}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch nutrition data");
  }
  return res.json();
}

export async function getRecipeDetails(id) {
  const res = await fetch(
    `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=false`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch recipe details");
  }
  return res.json();
}
