import { useState } from "react";
import ImportRecipeForm from "../../Components/ImportRecipeForm";
import "./RecipesPage.css";

export default function RecipePage({ username = "user" }) {
  const [importedRecipes, setImportedRecipes] = useState([]);

  const addRecipe = (recipe) => {
    if (!importedRecipes.some((r) => r.sourceUrl === recipe.sourceUrl)) {
      setImportedRecipes([recipe, ...importedRecipes]);
    }
  };

  function ManualRecipeForm({ onSave }) {
    const [title, setTitle] = useState("");
    const [servings, setServings] = useState("");
    const [time, setTime] = useState("");
    const [ingredientsText, setIngredientsText] = useState("");
    const [instructionsText, setInstructionsText] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();

      const newRecipe = {
        title,
        servings,
        time,
        ingredients: ingredientsText
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean),
        instructions: instructionsText
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean),
        sourceUrl: null,
      };

      onSave?.(newRecipe);

      setTitle("");
      setServings("");
      setTime("");
      setIngredientsText("");
      setInstructionsText("");
    };

    return (
      <form className="manual-recipe-form" onSubmit={handleSubmit}>
        <label>
          Recipe Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Servings
          <input
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </label>

        <label>
          Time
          <input value={time} onChange={(e) => setTime(e.target.value)} />
        </label>

        <label>
          Ingredients (One per Line)
          <textarea
            rows="50"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />
        </label>

        <label>
          Instructions (One per Line)
          <textarea
            rows="50"
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
          />
        </label>

        <button type="submit">Save Recipe</button>
      </form>
    );
  }

  return (
    <div className="recipe-page">
      <h1>{username}'s Recipes</h1>
      <div className="recipes-layout">
        <div className="recipes-left">
          <ImportRecipeForm onRecipeImported={addRecipe} />

          {importedRecipes.length > 0 && (
            <div className="imported-recipes">
              <h2>Imported Recipes</h2>
              {importedRecipes.map((recipe, idx) => (
                <div key={idx} className="recipe-display">
                  <h3>{recipe.title || "Untitled Recipe"}</h3>

                  {recipe.image &&
                    !recipe.image.startsWith("data:image/svg") && (
                      <img
                        src={recipe.image}
                        alt={recipe.title || "Recipe Image"}
                      />
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
                          <strong>Time:</strong>{" "}
                          {recipe.time.replace(/\n/g, " ")}
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

        <div className="recipes-right">
          <h1>Create Your Own Recipes With Ease!</h1>
          <ManualRecipeForm onSave={addRecipe} />
        </div>
      </div>
    </div>
  );
}
