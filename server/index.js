import "dotenv/config";
import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipes.js";

const app = express();

const allowedOrigins = [
  "https://at-my-table.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: ${origin} not allowed`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/recipes/health", (req, res) => {
  console.log("Health check hit");
  res.json({ status: "ok" });
});

app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
