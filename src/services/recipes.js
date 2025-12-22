const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://at-my-table.onrender.com";

export async function importRecipe(url, userId) {
  const res = await fetch(`${API_BASE}/api/recipes/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, userId }),
  });

  const contentType = res.headers.get("content-type");
  if (!res.ok || !contentType || !contentType.includes("application/json")) {
    const errorText = await res.text();
    console.error("Server raw error:", errorText);
    throw new Error(`Server Error: ${res.status}. Check backend logs.`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to import recipe");
  return data.recipe;
}
