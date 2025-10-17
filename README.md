# Full-Stack Todo Application with Categories

A complete, single-user Full-Stack To-Do application built with Next.js, React, TypeScript, and Express.js with SQLite database. Features category management, task organization, and intelligent transient state handling with undo functionality.

## Features

- **Category-based Task Organization**: Organize tasks into predefined categories (Work, Personal, Shopping, Health)
- **5-Task Category Limit**: Backend-enforced limit of 5 active tasks per category
- **Transient State with Undo**: 5-second delay with undo option for task completion and deletion
- **Real-time Filtering**: Filter tasks by category
- **React Hook Form**: Form validation and management
- **Tailwind CSS v4**: Modern, responsive styling
- **Shadcn/ui Components**: Beautiful, accessible UI components
- **Loading, Error, and Empty States**: Comprehensive UI state management
- **TypeScript**: Full type safety across frontend and backend

## Project Structure

```
fullstack-todo/
├── frontend/           # Next.js React application
│   ├── app/
│   │   ├── layout.tsx  # Root layout with ToastProvider
│   │   ├── page.tsx    # Main todo application
│   │   └── globals.css # Global styles
│   ├── components/ui/  # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── card.tsx
│   │   ├── alert.tsx
│   │   └── toast.tsx
│   ├── lib/
│   │   ├── api.ts      # Axios API client
│   │   └── utils.ts    # Utility functions (cn helper)
│   └── package.json
│
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── server.ts               # Express server setup
│   │   ├── db.ts                   # SQLite database connection
│   │   └── controllers/
│   │       └── todoController.ts   # API endpoint handlers
│   ├── package.json
│   ├── tsconfig.json
│   └── todos.db        # SQLite database (created on first run)
│
└── README.md           # This file
```

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

You need to run both the backend and frontend servers simultaneously.

### Start Backend Server (Terminal 1)

```bash
cd backend
npm run dev
```

The backend API will start on **http://localhost:3001**

### Start Frontend Server (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend application will start on **http://localhost:3000**

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

## API Endpoints

### Backend API (Port 3001)

- `GET /categories` - Retrieve all available categories
- `GET /todos?category={name}` - Get all todos (optionally filtered by category)
- `POST /todos` - Create a new todo (enforces 5-task limit per category)
- `PATCH /todos/:id` - Update todo completion status
- `DELETE /todos/:id` - Permanently delete a todo
- `GET /health` - Health check endpoint

## Critical Business Logic

### 1. Category Limit (5-Task Rule)

- **Backend Enforcement**: The POST `/todos` endpoint validates that a category doesn't exceed 5 active (non-completed) tasks
- **Error Handling**: Returns `400 Bad Request` with error message: "Category limit of 5 tasks reached."
- **Frontend Display**: Shows error prominently using Shadcn Alert component

### 2. Transient State with Undo

When a task is marked completed or deleted:

1. UI updates immediately (optimistic update)
2. A toast notification appears with an "Undo" button
3. The action waits 5 seconds before executing the API call
4. If "Undo" is clicked within 5 seconds, the action is cancelled (no API call made)
5. If 5 seconds elapse, the DELETE or PATCH API call executes
6. Success or error feedback is shown via toast notifications

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4+
- **UI Components**: Shadcn/ui
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useCallback, useEffect)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite with better-sqlite3
- **Middleware**: CORS, express.json()

## Development

### Backend Development

```bash
cd backend
npm run dev      # Run with ts-node (hot reload)
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
```

### Frontend Development

```bash
cd frontend
npm run dev      # Development server with hot reload
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Database Schema

### Categories Table

```sql
CREATE TABLE categories (
  name TEXT PRIMARY KEY
);
```

Default categories: Work, Personal, Shopping, Health

### Todos Table

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (category) REFERENCES categories(name)
);
```

## UI States

The application handles three critical UI states:

1. **Loading State**: Animated spinner while fetching data
2. **Error State**: Red alert banner for API errors
3. **Empty State**: Friendly message with icon when no tasks exist

## Features Checklist

- ✅ Next.js/React & TypeScript
- ✅ Node.js/Express.js & SQLite
- ✅ Shadcn/ui components for all UI elements
- ✅ Tailwind CSS v4+ styling
- ✅ React Hook Form for task creation
- ✅ Full API coverage (POST, GET, PATCH, DELETE, GET /categories)
- ✅ 5-task category limit enforced by backend (400 response)
- ✅ 5-second transient state with Undo/Toast logic on frontend
- ✅ Category filtering using backend query parameter
- ✅ All three UI states (Loading, Error, Empty)
- ✅ Comprehensive code comments

## Troubleshooting

### Backend won't start

- Ensure port 3001 is available
- Check that all dependencies are installed: `cd backend && npm install`
- Verify TypeScript compilation: `cd backend && npm run build`

### Frontend shows connection errors

- Ensure backend is running on port 3001
- Check API_BASE_URL in `frontend/lib/api.ts` matches your backend URL
- Verify CORS is enabled on the backend

### Database errors

- Delete `backend/todos.db` and restart the backend to recreate the database
- Check file permissions in the backend directory
