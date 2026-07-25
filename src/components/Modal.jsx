import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-forest-dark/50 backdrop-blur-sm" />

      {/* Modal box */}
      <div
        className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl ring-1 ring-brown/10 overflow-hidden animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-forest-dark">{title}</h3>
          <button
            onClick={onClose}
            className="text-forest-dark/70 hover:text-forest-dark text-xl leading-none font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-brown/8 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
