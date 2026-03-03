import type { ReactNode } from "react";

export function FormField({
  label,
  children,
  asLabel = true,
}: {
  label: string;
  children: ReactNode;
  asLabel?: boolean;
}) {
  if (!asLabel) {
    return (
      <div className="grid gap-1.5 text-xs">
        <span>{label}</span>
        {children}
      </div>
    );
  }

  return (
    <label className="grid gap-1.5 text-xs">
      <span>{label}</span>
      {children}
    </label>
  );
}
