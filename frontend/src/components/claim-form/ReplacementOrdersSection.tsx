import type { LookupItem } from "../../types";
import { FormField } from "../FormField";
import { Button } from "../ui/Button";

type ReplacementOrder = {
  orderId: string;
  parts: Array<{
    partSerial: string;
    qty: string;
  }>;
};

type ReplacementPartSerial = {
  serial: string;
  orderId: string;
  name: string;
};

type Props = {
  isVisible: boolean;
  isInternalErrorFixedWithReplacement: boolean;
  replacementOrders: ReplacementOrder[];
  orderSuggestions: LookupItem[];
  replacementPartSerials: ReplacementPartSerial[];
  onAddOrder: () => void;
  onRemoveOrder: (cardIndex: number) => void;
  onSetOrder: (cardIndex: number, value: string) => void;
  onAddPart: (cardIndex: number) => void;
  onRemovePart: (cardIndex: number, partIndex: number) => void;
  onSetPart: (cardIndex: number, partIndex: number, field: "partSerial" | "qty", value: string) => void;
};

export function ReplacementOrdersSection({
  isVisible,
  isInternalErrorFixedWithReplacement,
  replacementOrders,
  orderSuggestions,
  replacementPartSerials,
  onAddOrder,
  onRemoveOrder,
  onSetOrder,
  onAddPart,
  onRemovePart,
  onSetPart,
}: Props) {
  if (!isVisible) return null;

  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3>{isInternalErrorFixedWithReplacement ? "Replacment used in fix" : "Replacment Orders"}</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAddOrder} title="Add order">
          + Order
        </Button>
      </div>

      <div className="grid gap-2.5 xl:grid-cols-3">
        {replacementOrders.map((card, cardIndex) => (
          <article
            className="grid content-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm"
            key={`replacement-card-${cardIndex}`}
          >
            <div className="flex items-center justify-between">
              <h4 className="m-0 text-[13px]">Order {cardIndex + 1}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                onClick={() => onRemoveOrder(cardIndex)}
                disabled={replacementOrders.length === 1}
                title="Remove order card"
              >
                Remove
              </Button>
            </div>

            <FormField label="Order">
              <input
                className="max-w-full h-[34px]"
                type="search"
                list={`replacement-orders-${cardIndex}`}
                value={card.orderId}
                onChange={(e) => onSetOrder(cardIndex, e.target.value)}
                placeholder="Select order"
              />
              <datalist id={`replacement-orders-${cardIndex}`}>
                {orderSuggestions.map((x) => (
                  <option key={x.id} value={x.name} />
                ))}
              </datalist>
            </FormField>

            {card.parts.map((part, partIndex) => (
              <div
                className="grid items-end gap-2 [grid-template-columns:minmax(150px,1fr)_78px_auto] max-[900px]:grid-cols-1"
                key={`replacement-${cardIndex}-${partIndex}`}
              >
                <FormField label={`Serial #${partIndex + 1}`}>
                  <input
                    className="max-w-full h-[34px]"
                    type="search"
                    list={`replacement-part-serials-${cardIndex}-${partIndex}`}
                    value={part.partSerial}
                    onChange={(e) => onSetPart(cardIndex, partIndex, "partSerial", e.target.value)}
                    placeholder="Part serial"
                    disabled={!card.orderId.trim()}
                  />
                  <datalist id={`replacement-part-serials-${cardIndex}-${partIndex}`}>
                    {replacementPartSerials
                      .filter((x) => x.orderId === card.orderId)
                      .map((x) => (
                        <option key={`${x.serial}-${cardIndex}-${partIndex}`} value={x.serial}>
                          {x.name}
                        </option>
                      ))}
                  </datalist>
                </FormField>

                <FormField label="Qty">
                  <input
                    className="h-[34px] w-[78px] max-w-[78px]"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={part.qty}
                    onChange={(e) => onSetPart(cardIndex, partIndex, "qty", e.target.value)}
                    placeholder="0"
                    disabled={!card.orderId.trim()}
                  />
                </FormField>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-[30px] w-[30px] border-red-200 bg-red-50 p-0 text-red-800 hover:bg-red-100"
                  onClick={() => onRemovePart(cardIndex, partIndex)}
                  disabled={card.parts.length === 1}
                  title="Remove part"
                >
                  -
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={() => onAddPart(cardIndex)} title="Add part">
              + Part
            </Button>
          </article>
        ))}
      </div>

      <p className="text-xs text-slate-500">Add multiple order cards when the same issue affects multiple orders.</p>
    </section>
  );
}
