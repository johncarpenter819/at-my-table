import express from "express";
import { importRecipeFromUrl } from "../utils/parseRecipe.js";

const router = express.Router();

router.post("/import", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const recipe = await importRecipeFromUrl(url);
    console.log("Imported recipe:", recipe);
    res.json({ success: true, recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
