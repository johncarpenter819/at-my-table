import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/recipes", recipeRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
