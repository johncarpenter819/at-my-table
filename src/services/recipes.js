export async function importRecipe(url, userId) {
  const res = await fetch("http://localhost:5000/api/recipes/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, userId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to import recipe");
  return data.recipe;
}
