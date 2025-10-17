import express from "express";
import cors from "cors";
import path from "path";
import { initializeDatabase } from "./db";
import {
  getCategories,
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} from "./controllers/todoController";

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// API Routes
app.get("/api/categories", getCategories);
app.post("/api/todos", createTodo);
app.get("/api/todos", getTodos);
app.patch("/api/todos/:id", updateTodo);
app.delete("/api/todos/:id", deleteTodo);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// In production, serve Next.js frontend
if (isProduction && process.env.FRONTEND_PATH) {
  const frontendPath = process.env.FRONTEND_PATH;

  // Serve Next.js static files
  app.use("/_next", express.static(path.join(frontendPath, ".next")));
  app.use("/public", express.static(path.join(frontendPath, "public")));

  // Serve Next.js app for all other routes
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(
      path.join(frontendPath, ".next", "server", "pages", "index.html")
    );
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  if (isProduction) {
    console.log(`Serving frontend from ${process.env.FRONTEND_PATH}`);
  }
});
