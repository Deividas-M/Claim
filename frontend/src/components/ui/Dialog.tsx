import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  children,
  className = "",
  closeOnOverlayClick = true,
}: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-slate-900/35 p-3"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={cn(
          "grid w-full max-w-[760px] gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <h3>{title}</h3>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
