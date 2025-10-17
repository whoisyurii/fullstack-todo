"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { api, Todo, Category } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";

// Form data type
interface TodoFormData {
  text: string;
  category: string;
}

// Transient state for undo functionality
interface TransientTodo {
  todo: Todo;
  action: "complete" | "delete";
  timeoutId: NodeJS.Timeout;
}

export default function TodoApp() {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const transientTodosRef = useRef<Map<number, TransientTodo>>(new Map());

  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError: setFormError,
  } = useForm<TodoFormData>();

  // Fetch categories on mount
  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories");
      console.error(err);
    }
  }, []);

  // Fetch todos (with optional category filter)
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const category =
        selectedCategory === "All" ? undefined : selectedCategory;
      const data = await api.getTodos(category);
      setTodos(data);
    } catch (err) {
      setError("Failed to fetch todos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchTodos();
  }, [fetchCategories, fetchTodos]);

  // Create new todo
  const onSubmit = async (data: TodoFormData) => {
    try {
      await api.createTodo(data);
      reset();
      fetchTodos();
      addToast({ message: "Task created successfully!" });
    } catch (err: unknown) {
      // Handle 5-task limit error from backend
      const error = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.error || "Failed to create task";
        setFormError("root", { message: errorMessage });
      } else {
        setError("Failed to create task");
      }
      console.error(err);
    }
  };

  // Undo transient action
  const handleUndo = useCallback(
    (todoId: number) => {
      const transient = transientTodosRef.current.get(todoId);
      if (!transient) return;

      // Clear timeout so the queued API call never fires
      clearTimeout(transient.timeoutId);

      // Restore original state based on action type
      if (transient.action === "delete") {
        setTodos((prev) =>
          [...prev, transient.todo].sort((a, b) => b.id - a.id)
        );
      } else {
        setTodos((prev) =>
          prev.map((t) => (t.id === todoId ? transient.todo : t))
        );
      }

      // Drop transient entry now that it has been restored
      transientTodosRef.current.delete(todoId);

      addToast({ message: "Action cancelled!" });
    },
    [addToast]
  );

  // Handle completion with transient state (5s delay + undo)
  const handleToggleComplete = useCallback(
    (todo: Todo) => {
      const newCompleted = !Boolean(todo.completed);

      // Optimistically update UI
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: newCompleted ? 1 : 0 } : t
        )
      );

      // Track if this action was undone
      let wasUndone = false;

      // Set up transient state with undo option
      const timeoutId = setTimeout(async () => {
        if (wasUndone) return; // Check if undo was clicked
        try {
          await api.updateTodo(todo.id, newCompleted);
          transientTodosRef.current.delete(todo.id);
          addToast({
            message: `Task ${newCompleted ? "completed" : "reopened"}!`,
          });
        } catch (err) {
          // Revert on error
          setTodos((prev) =>
            prev.map((t) =>
              t.id === todo.id ? { ...t, completed: todo.completed } : t
            )
          );
          setError("Failed to update task");
          console.error(err);
        }
      }, 5000);

      // Store transient state with undo flag
      transientTodosRef.current.set(todo.id, {
        todo,
        action: "complete",
        timeoutId,
      });

      // Show undo toast with callback that sets the flag
      addToast({
        message: `Task will be ${newCompleted ? "completed" : "reopened"}`,
        action: {
          label: "Undo",
          onClick: () => {
            wasUndone = true;
            handleUndo(todo.id);
          },
        },
      });
    },
    [addToast, handleUndo]
  );

  // Handle deletion with transient state (5s delay + undo)
  const handleDelete = useCallback(
    (todo: Todo) => {
      // Optimistically remove from UI
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));

      // Track if this action was undone
      let wasUndone = false;

      // Set up transient state with undo option
      const timeoutId = setTimeout(async () => {
        if (wasUndone) return; // Check if undo was clicked
        try {
          await api.deleteTodo(todo.id);
          transientTodosRef.current.delete(todo.id);
          addToast({ message: "Task deleted!" });
        } catch (err) {
          // Revert on error
          setTodos((prev) => [...prev, todo].sort((a, b) => b.id - a.id));
          setError("Failed to delete task");
          console.error(err);
        }
      }, 5000);

      // Store transient state
      transientTodosRef.current.set(todo.id, {
        todo,
        action: "delete",
        timeoutId,
      });

      // Show undo toast with callback that sets the flag
      addToast({
        message: "Task will be deleted",
        action: {
          label: "Undo",
          onClick: () => {
            wasUndone = true;
            handleUndo(todo.id);
          },
        },
      });
    },
    [addToast, handleUndo]
  );

  // Filtered todos for display
  const displayTodos = todos;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Todo App with Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {/* New Task Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Enter task..."
                    {...register("text", { required: "Task text is required" })}
                  />
                  {errors.text && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.text.message}
                    </p>
                  )}
                </div>
                <div>
                  <Select
                    {...register("category", {
                      required: "Category is required",
                    })}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Show 5-task limit error */}
              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full sm:w-auto">
                Add Task
              </Button>
            </form>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Filter by Category
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-50"></div>
              </div>
            )}

            {/* Task List */}
            {!loading && (
              <>
                {displayTodos.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No tasks yet! Add your first task above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayTodos.map((todo) => {
                      return (
                        <div
                          key={todo.id}
                          className={`flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg border ${
                            todo.completed
                              ? "border-green-200 dark:border-green-800"
                              : "border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={Boolean(todo.completed)}
                              onChange={() => handleToggleComplete(todo)}
                            />
                            <span
                              className={`flex-1 ${
                                todo.completed
                                  ? "line-through text-neutral-500"
                                  : ""
                              }`}
                            >
                              {todo.text}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-700">
                              {todo.category}
                            </span>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(todo)}
                            className="ml-4"
                          >
                            Delete
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
