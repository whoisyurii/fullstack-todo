"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const todoController_1 = require("./controllers/todoController");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize database
(0, db_1.initializeDatabase)();
// API Routes
app.get("/api/categories", todoController_1.getCategories);
app.post("/api/todos", todoController_1.createTodo);
app.get("/api/todos", todoController_1.getTodos);
app.patch("/api/todos/:id", todoController_1.updateTodo);
app.delete("/api/todos/:id", todoController_1.deleteTodo);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// In production, serve static frontend files
if (isProduction) {
    // Serve static files from public directory
    app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
    // Serve index.html for all other routes (SPA fallback)
    app.get("*", (req, res) => {
        // Skip API routes
        if (req.path.startsWith("/api/") || req.path === "/health") {
            return res.status(404).json({ error: "Not found" });
        }
        res.sendFile(path_1.default.join(__dirname, "..", "public", "index.html"));
    });
}
// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    if (isProduction) {
        console.log(`Serving static frontend from public directory`);
    }
});
