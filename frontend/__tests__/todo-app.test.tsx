import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TodoApp from "@/app/page";
import { api } from "@/lib/api";

const addToastMock = jest.fn();

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    addToast: addToastMock,
    removeToast: jest.fn(),
    toasts: [],
  }),
}));

jest.mock("@/lib/api", () => {
  const originalModule = jest.requireActual("@/lib/api");
  return {
    __esModule: true,
    ...originalModule,
    api: {
      getCategories: jest.fn(),
      getTodos: jest.fn(),
      createTodo: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
      bulkUpdateTodos: jest.fn(),
    },
  };
});

describe("TodoApp bulk actions", () => {
  const categories = [{ name: "Work" }];
  const todos = [
    { id: 1, text: "Task A", category: "Work", completed: 0 },
    { id: 2, text: "Task B", category: "Work", completed: 0 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getCategories as jest.Mock).mockResolvedValue(categories);
    (api.getTodos as jest.Mock).mockResolvedValue(todos);
    (api.bulkUpdateTodos as jest.Mock).mockResolvedValue(
      todos.map((todo) => ({ ...todo, completed: 1 }))
    );
  });

  it("allows selecting all tasks and marking them done", async () => {
    const user = userEvent.setup();

    render(<TodoApp />);

    expect(await screen.findByText("Task A")).toBeInTheDocument();

    const selectAllButton = screen.getByRole("button", { name: /select all/i });
    await user.click(selectAllButton);

    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(selectAllButton).toHaveTextContent(/clear selection/i);

    const bulkCompleteButton = screen.getByRole("button", {
      name: /mark selected done/i,
    });

    expect(bulkCompleteButton).not.toBeDisabled();

    await user.click(bulkCompleteButton);

    await waitFor(() => {
      expect(api.bulkUpdateTodos).toHaveBeenCalledWith([1, 2], true);
    });

    await waitFor(() => {
      expect(screen.getByText("Task A")).toHaveClass("line-through");
      expect(screen.getByText("Task B")).toHaveClass("line-through");
    });

    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();
  });
});
