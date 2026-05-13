"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productionSizes } from "@/lib/constants";
import { t } from "@/lib/i18n";
import type { Language, NewProductionEntry, ProductionDay, ProductionEntry, ProductionOrder, ProductionSize } from "@/types/production";

type ProductionEntryModalProps = {
  language: Language;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: ProductionDay[];
  orders: ProductionOrder[];
  selectedDayId: string;
  editingEntry?: ProductionEntry | null;
  onSave: (entry: NewProductionEntry) => void;
};

export function ProductionEntryModal({
  language,
  open,
  onOpenChange,
  days,
  orders,
  selectedDayId,
  editingEntry,
  onSave,
}: ProductionEntryModalProps) {
  const defaultOrderId = orders[0]?.id ?? "";
  const [dayId, setDayId] = useState(selectedDayId);
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [size, setSize] = useState<ProductionSize>("40");
  const [quantity, setQuantity] = useState("100");
  const [worker, setWorker] = useState("Nguyễn Văn A");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setDayId(editingEntry?.dayId ?? selectedDayId);
    setOrderId(editingEntry?.orderId ?? defaultOrderId);
    setSize(editingEntry?.size ?? "40");
    setQuantity(String(editingEntry?.quantity ?? 100));
    setWorker(editingEntry?.worker ?? "Nguyễn Văn A");
    setNote(editingEntry?.note ?? "");
  }, [defaultOrderId, editingEntry, open, selectedDayId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);

    if (!dayId || !orderId || !size || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    onSave({
      dayId,
      orderId,
      size,
      quantity: Math.round(parsedQuantity),
      worker: worker.trim() || "N/A",
      note: note.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t(language, "inputProduction")}</DialogTitle>
        </DialogHeader>
        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            {t(language, "chooseDay")}
            <Select value={dayId} onValueChange={setDayId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day.id} value={day.id}>
                    {day.label} / {day.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {t(language, "chooseOrder")}
            <Select value={orderId} onValueChange={setOrderId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.code} - {order.style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {t(language, "chooseSize")}
            <Select value={size} onValueChange={(value) => setSize(value as ProductionSize)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productionSizes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {t(language, "enterQuantity")}
            <Input min={1} type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {t(language, "worker")}
            <Input value={worker} onChange={(event) => setWorker(event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {t(language, "note")}
            <Input value={note} onChange={(event) => setNote(event.target.value)} />
          </label>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t(language, "cancel")}
              </Button>
            </DialogClose>
            <Button type="submit">{t(language, "save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
