import { useState, useEffect, useCallback } from "react";

let toastIdCounter = 0;

const toastState = { listeners: [], toasts: [] };

function notify(message, type = "success") {
  const id = ++toastIdCounter;
  const toast = { id, message, type };
  toastState.toasts = [...toastState.toasts, toast];
  toastState.listeners.forEach((fn) => fn(toastState.toasts));
  setTimeout(() => {
    toastState.toasts = toastState.toasts.filter((t) => t.id !== id);
    toastState.listeners.forEach((fn) => fn(toastState.toasts));
  }, 3500);
}

export function toast(message) { notify(message, "success"); }
toast.error = (message) => notify(message, "error");
toast.info = (message) => notify(message, "info");

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (t) => setToasts([...t]);
    toastState.listeners.push(listener);
    return () => {
      toastState.listeners = toastState.listeners.filter((l) => l !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  const bgMap = {
    success: "bg-[#3F6E52]",
    error: "bg-[#A6452F]",
    info: "bg-gold-dark",
  };

  const iconMap = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${bgMap[t.type] || bgMap.success} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2.5 pointer-events-auto animate-toast-in`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {iconMap[t.type]}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
