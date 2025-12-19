import "dotenv/config";
import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://at-my-table.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
