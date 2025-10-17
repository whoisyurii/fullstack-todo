import axios from 'axios';

// API base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Todo {
  id: number;
  text: string;
  category: string;
  completed: number;
}

export interface Category {
  name: string;
}

export interface CreateTodoInput {
  text: string;
  category: string;
}

// API functions
export const api = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  // Get all todos (optionally filter by category)
  getTodos: async (category?: string): Promise<Todo[]> => {
    const response = await apiClient.get<Todo[]>('/todos', {
      params: category ? { category } : undefined,
    });
    return response.data;
  },

  // Create a new todo
  createTodo: async (data: CreateTodoInput): Promise<Todo> => {
    const response = await apiClient.post<Todo>('/todos', data);
    return response.data;
  },

  // Update todo completion status
  updateTodo: async (id: number, completed: boolean): Promise<Todo> => {
    const response = await apiClient.patch<Todo>(`/todos/${id}`, { completed });
    return response.data;
  },

  // Delete a todo
  deleteTodo: async (id: number): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },
};

export default apiClient;
