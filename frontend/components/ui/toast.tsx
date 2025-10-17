'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

// Toast context and hook
type ToastProps = {
  id: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

type ToastContextType = {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => string
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.Node }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    const duration = toast.duration || 5000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)

    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Toast component
function Toast({ message, action, onClose }: ToastProps & { onClose: () => void }) {
  return (
    <div className={cn(
      "pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-950"
    )}>
      <div className="flex-1 p-4">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{message}</p>
      </div>
      <div className="flex border-l border-neutral-200 dark:border-neutral-800">
        {action && (
          <button
            onClick={() => {
              action.onClick()
              onClose()
            }}
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
  )
}
