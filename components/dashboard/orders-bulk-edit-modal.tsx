"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { productionSizes } from "@/lib/constants";
import { t } from "@/lib/i18n";
import type { Language, ProductionOrder, ProductionSize } from "@/types/production";

type EditableOrder = Omit<ProductionOrder, "orderQuantity" | "sizePlan"> & {
  orderQuantity: string;
  sizePlan: Record<ProductionSize, string>;
};

type OrdersBulkEditModalProps = {
  language: Language;
  open: boolean;
  orders: ProductionOrder[];
  onOpenChange: (open: boolean) => void;
  onSave: (orders: ProductionOrder[]) => void;
};

function toEditable(order: ProductionOrder): EditableOrder {
  return {
    ...order,
    orderQuantity: String(order.orderQuantity),
    sizePlan: productionSizes.reduce(
      (acc, size) => ({ ...acc, [size]: String(order.sizePlan[size]) }),
      {} as Record<ProductionSize, string>,
    ),
  };
}

function toOrder(order: EditableOrder): ProductionOrder {
  return {
    ...order,
    orderQuantity: Math.max(Number(order.orderQuantity) || 0, 0),
    sizePlan: productionSizes.reduce(
      (acc, size) => ({ ...acc, [size]: Math.max(Number(order.sizePlan[size]) || 0, 0) }),
      {} as ProductionOrder["sizePlan"],
    ),
  };
}

export function OrdersBulkEditModal({ language, open, orders, onOpenChange, onSave }: OrdersBulkEditModalProps) {
  const [drafts, setDrafts] = useState<EditableOrder[]>([]);

  useEffect(() => {
    if (open) setDrafts(orders.map(toEditable));
  }, [open, orders]);

  function updateField(orderId: string, field: keyof Omit<EditableOrder, "sizePlan">, value: string) {
    setDrafts((current) =>
      current.map((order) => (order.id === orderId ? { ...order, [field]: value } : order)),
    );
  }

  function updateSize(orderId: string, size: ProductionSize, value: string) {
    setDrafts((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, sizePlan: { ...order.sizePlan, [size]: value } } : order,
      ),
    );
  }

  function addOrderRow() {
    const nextIndex = drafts.length + 1;
    setDrafts((current) => [
      ...current,
      {
        id: `ord-new-${crypto.randomUUID()}`,
        code: `NEW-${String(nextIndex).padStart(3, "0")}`,
        orderQuantity: "0",
        etd: new Date().toISOString().slice(0, 10),
        style: "",
        color: "",
        technology: "",
        sizePlan: productionSizes.reduce(
          (acc, size) => ({ ...acc, [size]: "0" }),
          {} as Record<ProductionSize, string>,
        ),
      },
    ]);
  }

  function deleteOrderRow(orderId: string) {
    setDrafts((current) => current.filter((order) => order.id !== orderId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(drafts.map(toOrder));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>{t(language, "edit")} {t(language, "mainTable")}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{t(language, "bulkEditHint")}</p>
            <Button type="button" size="sm" onClick={addOrderRow}>
              <Plus className="h-4 w-4" />
              {t(language, "addRow")}
            </Button>
          </div>
          <div className="production-table-scroll max-h-[62vh] overflow-auto rounded-xl border">
            <table className="min-w-[2300px] border-separate border-spacing-0 text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
                <tr>
                  {[t(language, "orderCode"), t(language, "orderQuantity"), t(language, "etd"), t(language, "style"), t(language, "color"), t(language, "technology"), ...productionSizes, t(language, "actions")].map((head) => (
                    <th key={head} className="h-8 whitespace-nowrap border-b border-r border-slate-200 px-2 text-left font-semibold last:border-r-0">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drafts.map((order) => (
                  <tr key={order.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border-b border-r border-slate-200 p-1">
                      <Input className="h-8 px-2 text-xs font-semibold text-blue-700" value={order.code} onChange={(event) => updateField(order.id, "code", event.target.value)} />
                    </td>
                    <td className="border-b border-r border-slate-200 p-1">
                      <Input className="h-8 px-2 text-right text-xs font-semibold" type="number" min={0} value={order.orderQuantity} onChange={(event) => updateField(order.id, "orderQuantity", event.target.value)} />
                    </td>
                    <td className="border-b border-r border-slate-200 p-1">
                      <Input className="h-8 px-2 text-xs" type="date" value={order.etd} onChange={(event) => updateField(order.id, "etd", event.target.value)} />
                    </td>
                    <td className="border-b border-r border-slate-200 p-1">
                      <Input className="h-8 px-2 text-xs" value={order.style} onChange={(event) => updateField(order.id, "style", event.target.value)} />
                    </td>
                    <td className="border-b border-r border-slate-200 p-1">
                      <Input className="h-8 px-2 text-xs" value={order.color} onChange={(event) => updateField(order.id, "color", event.target.value)} />
                    </td>
                    <td className="border-b border-r border-slate-200 p-1">
                      <Input className="h-8 px-2 text-xs" value={order.technology} onChange={(event) => updateField(order.id, "technology", event.target.value)} />
                    </td>
                    {productionSizes.map((size) => (
                      <td key={size} className="border-b border-r border-slate-200 p-1 last:border-r-0">
                        <Input className="h-8 px-2 text-right text-xs" type="number" min={0} value={order.sizePlan[size]} onChange={(event) => updateSize(order.id, size, event.target.value)} />
                      </td>
                    ))}
                    <td className="border-b border-slate-200 p-1">
                      <button
                        type="button"
                        title={t(language, "delete")}
                        onClick={() => deleteOrderRow(order.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">{t(language, "cancel")}</Button>
            </DialogClose>
            <Button type="submit">{t(language, "save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
