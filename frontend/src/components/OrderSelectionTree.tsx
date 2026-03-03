import type { LookupItem } from "../types";
import { FormField } from "./FormField";

type Props = {
  order: string;
  orderLine: string;
  component: string;
  orderSuggestions: LookupItem[];
  orderLineSuggestions: LookupItem[];
  componentSuggestions: LookupItem[];
  onChange: (scope: "order" | "orderLine" | "component", value: string) => void;
};

export function OrderSelectionTree({
  order,
  orderLine,
  component,
  orderSuggestions,
  orderLineSuggestions,
  componentSuggestions,
  onChange,
}: Props) {
  return (
    <section className="subpanel stack">
      <h3>Choose your order</h3>
      <div className="grid three">
        <FormField label="Order">
          <input
            type="search"
            list="order-tree-suggestions"
            value={order}
            onChange={(e) => onChange("order", e.target.value)}
            placeholder="Search order"
          />
          <datalist id="order-tree-suggestions">
            {orderSuggestions.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Order Line">
          <input
            type="search"
            list="order-line-tree-suggestions"
            value={orderLine}
            onChange={(e) => onChange("orderLine", e.target.value)}
            placeholder="Search order line"
            disabled={!order.trim()}
          />
          <datalist id="order-line-tree-suggestions">
            {orderLineSuggestions.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Component">
          <input
            type="search"
            list="component-tree-suggestions"
            value={component}
            onChange={(e) => onChange("component", e.target.value)}
            placeholder="Search component"
            disabled={!orderLine.trim()}
          />
          <datalist id="component-tree-suggestions">
            {componentSuggestions.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
        </FormField>
      </div>
    </section>
  );
}
