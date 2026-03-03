import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)}
    />
  );
}
