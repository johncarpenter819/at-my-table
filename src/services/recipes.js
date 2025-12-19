const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://at-my-table.onrender.com";

export async function importRecipe(url, userId) {
  const res = await fetch(`${API_BASE}/api/recipes/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, userId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to import recipe");
  return data.recipe;
}
