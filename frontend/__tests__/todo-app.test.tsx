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
    },
  };
});

describe("TodoApp interactions", () => {
  const categories = [{ name: "Work" }];
  const todos = [
    { id: 1, text: "Task A", category: "Work", completed: 0 },
    { id: 2, text: "Task B", category: "Work", completed: 0 },
  ];

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getCategories as jest.Mock).mockResolvedValue(categories);
    (api.getTodos as jest.Mock).mockResolvedValue(todos);
    (api.updateTodo as jest.Mock).mockResolvedValue({
      ...todos[0],
      completed: 1,
    });
  });

  it("marks a task as completed when the checkbox is toggled", async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime.bind(jest),
    });

    render(<TodoApp />);

    expect(await screen.findByText("Task A")).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);

    await user.click(checkboxes[0]);

  jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(api.updateTodo).toHaveBeenCalledWith(1, true);
    });

    expect(screen.getByText("Task A")).toHaveClass("line-through");
  });
});
