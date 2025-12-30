import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import ImportRecipeForm from "../../Components/ImportRecipeForm";
import "./RecipesPage.css";

export default function RecipePage({ session, username = "user" }) {
  const [toastMessage, setToastMessage] = useState("");
  const [importedRecipes, setImportedRecipes] = useState([]);

  const currentUserId = session.user.id;

  const cleanIngredient = (text) => text.replace(/^[▢•\-–—_]+\s*/g, "").trim();

  useEffect(() => {
    if (session?.user?.id) {
      const fetchRecipes = async () => {
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setImportedRecipes(data);
        }
      };

      fetchRecipes();
    }
  }, [currentUserId]);

  const addRecipe = async (recipe) => {
    const isDatebaseRecord =
      typeof recipe.id === "string" && recipe.id.length > 30;

    if (isDatebaseRecord) {
      setImportedRecipes((prev) => {
        if (!prev.some((r) => r.id === recipe.id)) {
          return [recipe, ...prev];
        }
        return prev;
      });
      return;
    }

    const { data, error } = await supabase
      .from("recipes")
      .insert([
        {
          user_id: currentUserId,
          title: recipe.title,
          ingredients: recipe.ingredients?.map(cleanIngredient),
          instructions: recipe.instructions,
          servings: recipe.servings,
          prep_time: recipe.time,
          image_url: recipe.image_url || recipe.image,
          source_url: recipe.sourceUrl || recipe.source_url || null,
          nutrition: recipe.nutrition || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving manual recipe:", error);
      alert("Could not save recipe to database");
    } else {
      setImportedRecipes((prev) => [data, ...prev]);
    }
  };

  const handleDelete = async (recipe) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipe.id);

      if (!error) {
        setImportedRecipes(importedRecipes.filter((r) => r.id !== recipe.id));
      }
    }
  };

  const handleFavorite = async (recipe) => {
    const newFavoriteStatus = !recipe.is_favorite;

    const { error } = await supabase
      .from("recipes")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", recipe.id);

    if (!error) {
      setImportedRecipes((prev) =>
        prev.map((r) =>
          r.id === recipe.id ? { ...r, is_favorite: newFavoriteStatus } : r
        )
      );

      showToast(
        newFavoriteStatus
          ? `"${recipe.title}" added to favorites!`
          : `"${recipe.title}" removed from favorites.`
      );
    } else {
      console.error("Failed to update favorite:", error);
      showToast("Could not update favorite status. Please try again");
    }
  };

  const handleShare = async (recipe) => {
    const recipeDetails = `
      Check out this recipe: ${recipe.title}
      Ingredients: ${recipe.ingredients?.join(", ")}
      Instructions: ${recipe.instructions?.join(" ")}
      `;

    const subject = encodeURIComponent(`Recipe: ${recipe.title}`);
    const body = encodeURIComponent(recipeDetails);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;

    try {
      await navigator.clipboard.writeText(recipeDetails);
      alert("Recipe details copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const addToCalendar = (recipe) => {
    const date = prompt("Enter a date (MM-DD-YYYY) for this meal:");
    if (date) {
      alert(`Scheduled ${recipe.title} for ${date}`);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
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
            rows="10"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />
        </label>

        <label>
          Instructions (One per Line)
          <textarea
            rows="10"
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
      {toastMessage && <div className="toast">{toastMessage}</div>}
      <div className="recipes-layout">
        <div className="recipes-left">
          <ImportRecipeForm
            onRecipeImported={addRecipe}
            userId={currentUserId}
          />

          {importedRecipes.length > 0 && (
            <div className="imported-recipes">
              <h2>Imported Recipes</h2>
              {importedRecipes.map((recipe, idx) => (
                <div key={idx} className="recipe-display">
                  <div className="recipe-actions">
                    <button
                      className={`action-btn fav ${
                        recipe.is_favorite ? "active" : ""
                      }`}
                      onClick={() => handleFavorite(recipe)}
                      title="Favorite"
                    >
                      {recipe.is_favorite ? "❤️" : "🤍"}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => addToCalendar(recipe)}
                      title="Add to Calendar"
                    >
                      📅
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleShare(recipe)}
                      title="Share"
                    >
                      🔗
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleDelete(recipe)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>

                  <h3>{recipe.title || "Untitled Recipe"}</h3>

                  {(recipe.image_url || recipe.image) && (
                    <img
                      src={recipe.image_url || recipe.image}
                      alt={recipe.title || "Recipe Image"}
                      className="recipe-main-img"
                      onError={(e) => (e.target.style.display = "none")}
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
                          {(recipe.prep_time || recipe.time)?.replace(
                            /\n/g,
                            " "
                          )}
                        </>
                      )}
                    </p>
                  )}

                  {recipe.nutrition &&
                    Object.keys(recipe.nutrition).length > 0 && (
                      <div className="recipe-nutrition">
                        <h4>Nutrition Information</h4>
                        <div className="nutrition-grid">
                          {Object.entries(recipe.nutrition).map(
                            ([key, val]) => (
                              <span key={key} className="nutrition-item">
                                {val}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {recipe.ingredients?.length > 0 && (
                    <>
                      <h4>Ingredients</h4>
                      <ul>
                        {recipe.ingredients.map((ing, i) => {
                          if (ing.startsWith("**") && ing.endsWith("**")) {
                            return (
                              <li
                                key={i}
                                className="recipe-ingredient-group-header"
                              >
                                {ing.replace(/\*\*/g, "")}
                              </li>
                            );
                          }
                          return <li key={i}>{ing}</li>;
                        })}
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

                  {(recipe.sourceUrl || recipe.source_url) && (
                    <p>
                      <a
                        href={recipe.source_url || recipe.sourceUrl}
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
