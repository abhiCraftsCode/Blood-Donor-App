import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-lg text-ink">{title}</h3>
              <button onClick={onClose} className="text-ink-500 hover:text-ink p-1 -m-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink-500 mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-ink-500 hover:bg-ink/5">
          Never mind
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium text-white ${
            danger ? "bg-pulse hover:bg-pulse-600" : "bg-ink hover:bg-ink-600"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
