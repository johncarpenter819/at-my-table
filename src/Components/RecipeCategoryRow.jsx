// import { useEffect, useState } from "react";
// import { searchRecipes } from "../api/spoonacular";
// import RecipeCard from "../Components/RecipeCard";

// const normalizeRecipe = (recipe) => ({
//   id: recipe.id,
//   title: recipe.title,
//   image: recipe.image,
//   readyInMinutes: recipe.readyInMinutes,
//   servings: recipe.servings,
// });

// const RecipeCategoryRow = ({ title, params, categoryId }) => {
//   const [recipes, setRecipes] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       try {
//         const data = await searchRecipes("", params);
//         setRecipes((data.results || []).map(normalizeRecipe));
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, [params]);

//   return (
//     <section className="recipe-category">
//       <div className="category-header">
//         <h2>{title}</h2>
//         <a href={`/recipes/category/${categoryId}`}>View all →</a>
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="recipe-row">
//           {recipes.slice(0, 6).map((recipe) => (
//             <RecipeCard key={recipe.id} recipe={recipe} />
//           ))}
//         </div>
//       )}
//     </section>
//   );
// };

// export default RecipeCategoryRow;
