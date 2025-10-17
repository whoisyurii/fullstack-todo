import { Request, Response } from "express";
import db from "../db";

// Interface definitions
interface Todo {
  id: number;
  text: string;
  category: string;
  completed: number;
}

interface Category {
  name: string;
}

// GET /categories - Retrieve all categories
export function getCategories(req: Request, res: Response) {
  try {
    const categories = db
      .prepare("SELECT name FROM categories")
      .all() as Category[];
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /todos - Create a new task with 5-task limit validation
export function createTodo(req: Request, res: Response) {
  try {
    const { text, category } = req.body;

    // Validate input
    if (!text || !category) {
      return res.status(400).json({ error: "Text and category are required" });
    }

    // CRITICAL: Check 5-task limit for the category
    const countStmt = db.prepare(
      "SELECT COUNT(*) as count FROM todos WHERE category = ? AND completed = 0"
    );
    const result = countStmt.get(category) as { count: number };

    if (result.count >= 5) {
      return res
        .status(400)
        .json({ error: "Category limit of 5 tasks reached." });
    }

    // Insert the new task
    const insertStmt = db.prepare(
      "INSERT INTO todos (text, category, completed) VALUES (?, ?, 0)"
    );
    const info = insertStmt.run(text, category);

    // Return the created task
    const newTodo = db
      .prepare("SELECT * FROM todos WHERE id = ?")
      .get(info.lastInsertRowid) as Todo;
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /todos - Retrieve all todos (optionally filter by category)
export function getTodos(req: Request, res: Response) {
  try {
    const { category } = req.query;

    let todos: Todo[];
    if (category) {
      todos = db
        .prepare("SELECT * FROM todos WHERE category = ? ORDER BY id DESC")
        .all(category) as Todo[];
    } else {
      todos = db
        .prepare("SELECT * FROM todos ORDER BY id DESC")
        .all() as Todo[];
    }

    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /todos/:id - Update task completion status
export function updateTodo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ error: "Completed field must be a boolean" });
    }

    const updateStmt = db.prepare(
      "UPDATE todos SET completed = ? WHERE id = ?"
    );
    const info = updateStmt.run(completed ? 1 : 0, id);

    if (info.changes === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const updatedTodo = db
      .prepare("SELECT * FROM todos WHERE id = ?")
      .get(id) as Todo;
    res.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /todos/:id - Permanently delete a task
export function deleteTodo(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const deleteStmt = db.prepare("DELETE FROM todos WHERE id = ?");
    const info = deleteStmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
