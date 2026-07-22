"use client";

import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const SIZE_MAX: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export default function Modal({ open, onClose, title, eyebrow, size = "md", children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div
        className={`relative bg-surface-solid border border-rule rounded-2xl w-full ${SIZE_MAX[size]} max-h-[90vh] overflow-y-auto`}
        style={{
          boxShadow: "0 20px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px var(--rule)",
        }}
      >
        <div className="px-6 py-5 border-b border-rule flex items-start justify-between sticky top-0 bg-surface-solid z-10 rounded-t-2xl">
          <div>
            {eyebrow ? <div className="eyebrow eyebrow-primary">{eyebrow}</div> : null}
            <h2 className="text-xl font-semibold tracking-tight mt-0.5">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-muted hover:text-fg text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 -mt-1 transition"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
