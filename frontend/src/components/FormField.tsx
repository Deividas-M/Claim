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
      <div className="field">
        <span>{label}</span>
        {children}
      </div>
    );
  }

  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
