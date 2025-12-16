import { useState } from "react";
import ImportRecipeForm from "../../Components/ImportRecipeForm";

export default function RecipePage() {
  const [importedRecipes, setImportedRecipes] = useState([]);

  const addRecipe = (recipe) => {
    if (!importedRecipes.some((r) => r.sourceUrl === recipe.sourceUrl)) {
      setImportedRecipes([recipe, ...importedRecipes]);
    }
  };

  return (
    <div className="recipe-page">
      <h1>Import Recipe From Your Favorite Sites</h1>
      <ImportRecipeForm onRecipeImported={addRecipe} />

      {importedRecipes.length > 0 && (
        <div className="imported-recipes">
          <h2>Imported Recipes</h2>
          {importedRecipes.map((recipe, idx) => (
            <div key={idx} className="recipe-display">
              <h3>{recipe.title || "Untitled Recipe"}</h3>

              {recipe.image && !recipe.image.startsWith("data:image/svg") && (
                <img src={recipe.image} alt={recipe.title || "Recipe Image"} />
              )}

              {(recipe.servings || recipe.time) && (
                <p>
                  {recipe.servings && (
                    <>
                      <strong>Servings:</strong> {recipe.servings} <br />
                    </>
                  )}
                  {recipe.time && (
                    <>
                      <strong>Time:</strong> {recipe.time.replace(/\n/g, " ")}
                    </>
                  )}
                </p>
              )}

              {recipe.ingredients?.length > 0 && (
                <>
                  <h4>Ingredients</h4>
                  <ul>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </>
              )}

              {recipe.instructions?.length > 0 && (
                <>
                  <h4>Instructions</h4>
                  <ol>
                    {recipe.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </>
              )}

              {recipe.sourceUrl && (
                <p>
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Original Recipe
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
