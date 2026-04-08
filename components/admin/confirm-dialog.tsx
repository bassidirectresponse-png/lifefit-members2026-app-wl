"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Supprimer",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-secondary border border-border rounded-card p-6 w-full max-w-md"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-pink-dark/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-pink-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-semibold text-text-primary mb-1">
              {title}
            </h3>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 rounded-[10px] text-[14px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="h-9 px-4 rounded-[10px] text-[14px] font-semibold bg-pink-dark text-pink-rose hover:bg-pink-primary transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
