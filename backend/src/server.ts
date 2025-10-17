import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import {
  getCategories,
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
} from './controllers/todoController';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// API Routes
app.get('/categories', getCategories);
app.post('/todos', createTodo);
app.get('/todos', getTodos);
app.patch('/todos/:id', updateTodo);
app.delete('/todos/:id', deleteTodo);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
