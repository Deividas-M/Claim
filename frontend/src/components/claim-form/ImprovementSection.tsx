import type { LookupItem } from "../../types";
import { FormField } from "../FormField";

type Props = {
  isVisible: boolean;
  value: string;
  categories: LookupItem[];
  onChange: (value: string) => void;
};

export function ImprovementSection({ isVisible, value, categories, onChange }: Props) {
  if (!isVisible) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm grid gap-3">
      <h3>Improvment</h3>
      <FormField label="Category">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </FormField>
    </section>
  );
}
