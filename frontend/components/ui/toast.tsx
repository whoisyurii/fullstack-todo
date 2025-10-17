"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Toast context and hook
type ToastProps = {
  id: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
};

type ToastContextType = {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => string;
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = toast.duration || 5000;
    setToasts((prev) => [...prev, { ...toast, id, duration }]);

    // Auto-remove toast after its duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Toast component
function Toast({
  message,
  action,
  duration,
  onClose,
}: ToastProps & { onClose: () => void }) {
  const [countdown, setCountdown] = React.useState(duration ? duration / 1000 : 0);

  React.useEffect(() => {
    if (duration) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [duration]);

  const handleActionClick = () => {
    if (action) {
      action.onClick();
      onClose(); // Close the toast after the action is performed
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-950"
      )}
    >
      <div className="flex-1 p-4">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {message} {countdown > 0 && `(${countdown}s)`}
        </p>
      </div>
      <div className="flex border-l border-neutral-200 dark:border-neutral-800">
        {action && (
          <button
            onClick={handleActionClick}
            className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-neutral-900 hover:text-neutral-700 dark:text-neutral-50 dark:hover:text-neutral-300"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-neutral-400 hover:text-neutral-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
