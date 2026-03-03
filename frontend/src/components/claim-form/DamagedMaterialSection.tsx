import type { LookupItem } from "../../types";
import { FormField } from "../FormField";

type MaterialArticle = {
  id: string;
  name: string;
  categoryId: string;
  qtyUnit: string;
};

type Props = {
  isVisible: boolean;
  articleQuery: string;
  articleId: string;
  categoryId: string;
  qty: string;
  qtyUnit: string;
  materialArticles: MaterialArticle[];
  materialCategories: LookupItem[];
  onArticleQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onQtyChange: (value: string) => void;
};

export function DamagedMaterialSection({
  isVisible,
  articleQuery,
  articleId,
  categoryId,
  qty,
  qtyUnit,
  materialArticles,
  materialCategories,
  onArticleQueryChange,
  onCategoryChange,
  onQtyChange,
}: Props) {
  if (!isVisible) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm grid gap-3">
      <h3>Damaged Material</h3>
      <div className="grid gap-2.5 md:grid-cols-3">
        <FormField label="Search damaged article">
          <input
            type="search"
            list="damaged-material-articles"
            value={articleQuery}
            onChange={(e) => onArticleQueryChange(e.target.value)}
            placeholder="Search by article id or name"
          />
          <datalist id="damaged-material-articles">
            {materialArticles.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </datalist>
        </FormField>
        <FormField label="Category">
          <select value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="">Select category</option>
            {materialCategories.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </FormField>
        {articleId || categoryId ? (
          <FormField label={`Damaged qty${qtyUnit ? ` (${qtyUnit})` : ""}`}>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={qty}
              onChange={(e) => onQtyChange(e.target.value)}
              placeholder={qtyUnit ? `Qty in ${qtyUnit}` : "Qty"}
            />
          </FormField>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">
        Search article to auto-fill category and qty unit. If unknown, choose category and continue with message.
      </p>
    </section>
  );
}
