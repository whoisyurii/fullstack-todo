"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const todoController_1 = require("./controllers/todoController");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize database
(0, db_1.initializeDatabase)();
// API Routes
app.get('/categories', todoController_1.getCategories);
app.post('/todos', todoController_1.createTodo);
app.get('/todos', todoController_1.getTodos);
app.patch('/todos/:id', todoController_1.updateTodo);
app.delete('/todos/:id', todoController_1.deleteTodo);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
