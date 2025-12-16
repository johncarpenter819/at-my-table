import { useState } from "react";
import { importRecipe } from "../services/recipes";

export default function ImportRecipeForm({ onRecipeImported }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    try {
      let importedRecipe = await importRecipe(url);
      if (importedRecipe.ingredients) {
        importedRecipe.ingredients = importedRecipe.ingredients.map((ing) =>
          ing.replace(/^▢\s*/, "")
        );
      }
      if (onRecipeImported) {
        onRecipeImported(importedRecipe);
      }
      setUrl("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to import recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-recipe-form">
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Paste recipe URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Importing..." : "Import Recipe"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
