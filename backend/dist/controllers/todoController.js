"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.createTodo = createTodo;
exports.getTodos = getTodos;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
const db_1 = __importDefault(require("../db"));
// GET /categories - Retrieve all categories
function getCategories(req, res) {
    try {
        const categories = db_1.default.prepare('SELECT name FROM categories').all();
        res.json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// POST /todos - Create a new task with 5-task limit validation
function createTodo(req, res) {
    try {
        const { text, category } = req.body;
        // Validate input
        if (!text || !category) {
            return res.status(400).json({ error: 'Text and category are required' });
        }
        // CRITICAL: Check 5-task limit for the category
        const countStmt = db_1.default.prepare('SELECT COUNT(*) as count FROM todos WHERE category = ? AND completed = 0');
        const result = countStmt.get(category);
        if (result.count >= 5) {
            return res.status(400).json({ error: 'Category limit of 5 tasks reached.' });
        }
        // Insert the new task
        const insertStmt = db_1.default.prepare('INSERT INTO todos (text, category, completed) VALUES (?, ?, 0)');
        const info = insertStmt.run(text, category);
        // Return the created task
        const newTodo = db_1.default.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newTodo);
    }
    catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET /todos - Retrieve all todos (optionally filter by category)
function getTodos(req, res) {
    try {
        const { category } = req.query;
        let todos;
        if (category) {
            todos = db_1.default.prepare('SELECT * FROM todos WHERE category = ? ORDER BY id DESC').all(category);
        }
        else {
            todos = db_1.default.prepare('SELECT * FROM todos ORDER BY id DESC').all();
        }
        res.json(todos);
    }
    catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// PATCH /todos/:id - Update task completion status
function updateTodo(req, res) {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        if (typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'Completed field must be a boolean' });
        }
        const updateStmt = db_1.default.prepare('UPDATE todos SET completed = ? WHERE id = ?');
        const info = updateStmt.run(completed ? 1 : 0, id);
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        const updatedTodo = db_1.default.prepare('SELECT * FROM todos WHERE id = ?').get(id);
        res.json(updatedTodo);
    }
    catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// DELETE /todos/:id - Permanently delete a task
function deleteTodo(req, res) {
    try {
        const { id } = req.params;
        const deleteStmt = db_1.default.prepare('DELETE FROM todos WHERE id = ?');
        const info = deleteStmt.run(id);
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
