const RecipeCard = ({ recipe }) => {
  return (
    <div className="recipe-card">
      <img src={recipe.image} alt={recipe.title} />
      <h3>{recipe.title}</h3>

      <div className="recipe-actions">
        <button>❤️ Favorite</button>
        <button>➕ Add to Calendar</button>
        <button>🥗 Nutrition Information</button>
        <button>📤 Share</button>
      </div>
    </div>
  );
};

export default RecipeCard;
