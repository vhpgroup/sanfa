"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { productionSizes } from "@/lib/constants";
import { normalizeDate } from "@/lib/date-utils";
import { t } from "@/lib/i18n";
import type { Language, ProductionOrder, ProductionSize } from "@/types/production";

type OrderEditModalProps = {
  language: Language;
  open: boolean;
  order: ProductionOrder | null;
  onOpenChange: (open: boolean) => void;
  onSave: (order: ProductionOrder) => void;
};

export function OrderEditModal({ language, open, order, onOpenChange, onSave }: OrderEditModalProps) {
  const [code, setCode] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [etd, setEtd] = useState("");
  const [style, setStyle] = useState("");
  const [color, setColor] = useState("");
  const [technology, setTechnology] = useState("");
  const [sizePlan, setSizePlan] = useState<Record<ProductionSize, string>>(
    productionSizes.reduce((acc, size) => ({ ...acc, [size]: "0" }), {} as Record<ProductionSize, string>),
  );
  const [deliveryPlan, setDeliveryPlan] = useState<Record<ProductionSize, string>>(
    productionSizes.reduce((acc, size) => ({ ...acc, [size]: "0" }), {} as Record<ProductionSize, string>),
  );

  useEffect(() => {
    if (!open || !order) return;
    setCode(order.code);
    setOrderQuantity(String(order.orderQuantity));
    setEtd(normalizeDate(order.etd));
    setStyle(order.style);
    setColor(order.color);
    setTechnology(order.technology);
    setSizePlan(
      productionSizes.reduce(
        (acc, size) => ({ ...acc, [size]: String(order.sizePlan[size]) }),
        {} as Record<ProductionSize, string>,
      ),
    );
    setDeliveryPlan(
      productionSizes.reduce(
        (acc, size) => ({ ...acc, [size]: String(order.deliveryPlan?.[size] ?? 0) }),
        {} as Record<ProductionSize, string>,
      ),
    );
  }, [open, order]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;

    onSave({
      id: order.id,
      code: code.trim(),
      orderQuantity: Math.max(Number(orderQuantity) || 0, 0),
      etd: normalizeDate(etd),
      style: style.trim(),
      color: color.trim(),
      technology: technology.trim(),
      sizePlan: productionSizes.reduce(
        (acc, size) => ({ ...acc, [size]: Math.max(Number(sizePlan[size]) || 0, 0) }),
        {} as ProductionOrder["sizePlan"],
      ),
      producedPlan: order.producedPlan,
      deliveryPlan: productionSizes.reduce(
        (acc, size) => ({ ...acc, [size]: Math.max(Number(deliveryPlan[size]) || 0, 0) }),
        {} as ProductionOrder["sizePlan"],
      ),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t(language, "edit")} {t(language, "mainTable")}</DialogTitle>
        </DialogHeader>
        <form className="grid grid-cols-4 gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            {t(language, "orderCode")}
            <Input value={code} onChange={(event) => setCode(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {t(language, "orderQuantity")}
            <Input type="number" min={0} value={orderQuantity} onChange={(event) => setOrderQuantity(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {t(language, "etd")}
            <Input type="date" value={etd} onChange={(event) => setEtd(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {t(language, "technology")}
            <Input value={technology} onChange={(event) => setTechnology(event.target.value)} />
          </label>
          <label className="col-span-2 grid gap-2 text-sm font-medium">
            {t(language, "style")}
            <Input value={style} onChange={(event) => setStyle(event.target.value)} />
          </label>
          <label className="col-span-2 grid gap-2 text-sm font-medium">
            {t(language, "color")}
            <Input value={color} onChange={(event) => setColor(event.target.value)} />
          </label>

          <div className="col-span-4 grid grid-cols-8 gap-2 rounded-xl border bg-slate-50 p-3">
            {productionSizes.map((size) => (
              <label key={size} className="grid gap-1 text-xs font-medium text-slate-600">
                {size}
                <Input
                  className="h-8 bg-white px-2 text-right text-xs"
                  type="number"
                  min={0}
                  value={sizePlan[size]}
                  onChange={(event) => setSizePlan((current) => ({ ...current, [size]: event.target.value }))}
                />
              </label>
            ))}
          </div>
          <div className="col-span-4 grid grid-cols-8 gap-2 rounded-xl border bg-emerald-50 p-3">
            {productionSizes.map((size) => (
              <label key={size} className="grid gap-1 text-xs font-medium text-emerald-700">
                {size} giao
                <Input
                  className="h-8 bg-white px-2 text-right text-xs"
                  type="number"
                  min={0}
                  value={deliveryPlan[size]}
                  onChange={(event) => setDeliveryPlan((current) => ({ ...current, [size]: event.target.value }))}
                />
              </label>
            ))}
          </div>

          <div className="col-span-4 mt-2 flex justify-end gap-2">
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
