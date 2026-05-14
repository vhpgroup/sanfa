"use client";

import { CalendarPlus, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { getDayTotal } from "@/store/production-store";
import type { Language, ProductionDay, ProductionEntry, ProductionOrder } from "@/types/production";

type DayPanelProps = {
  language: Language;
  days: ProductionDay[];
  entries: ProductionEntry[];
  orders: ProductionOrder[];
  selectedDayId: string;
  totalOrderQuantity: number;
  onSelectDay: (dayId: string) => void;
  onAddDay: () => void;
  onEditDay: (dayId: string) => void;
  onDeleteDay: (dayId: string) => void;
  onEditEntry: (entry: ProductionEntry) => void;
  onDeleteEntry: (entryId: string) => void;
};

export function DayPanel({
  language,
  days,
  entries,
  orders,
  selectedDayId,
  totalOrderQuantity,
  onSelectDay,
  onAddDay,
  onEditDay,
  onDeleteDay,
  onEditEntry,
  onDeleteEntry,
}: DayPanelProps) {
  const selectedEntries = entries.filter((entry) => entry.dayId === selectedDayId);

  return (
    <aside className="flex min-h-0 w-[420px] shrink-0 flex-col gap-4">
      <Card className="rounded-xl border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle>{t(language, "productionDays")}</CardTitle>
          <Button size="sm" className="rounded-lg" onClick={onAddDay}>
            <CalendarPlus className="h-4 w-4" />
            {t(language, "addProductionDay")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {days.map((day) => {
            const total = getDayTotal(day.id, entries);
            const percent = totalOrderQuantity > 0 ? (total / totalOrderQuantity) * 100 : 0;
            const active = selectedDayId === day.id;
            return (
              <div
                key={day.id}
                className={cn(
                  "rounded-xl border p-3 transition-all duration-200",
                  active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
                )}
              >
                <button className="flex w-full items-center justify-between text-left" onClick={() => onSelectDay(day.id)}>
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{day.label}</div>
                    <div className="text-xs text-slate-500">{day.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-700 tabular-nums">{formatNumber(total)}</div>
                    <div className="text-xs font-medium text-emerald-700">{formatPercent(percent)}</div>
                  </div>
                </button>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(percent, 100)}%` }} />
                  </div>
                  <button title={t(language, "edit")} onClick={() => onEditDay(day.id)} className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-blue-700">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title={t(language, "delete")}
                    onClick={() => {
                      if (window.confirm(t(language, "confirmDelete"))) onDeleteDay(day.id);
                    }}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="min-h-0 flex-1 rounded-xl border-slate-200">
        <CardHeader className="p-4">
          <CardTitle>{t(language, "dayDetail")}</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 overflow-hidden p-0">
          <div className="max-h-[390px] overflow-auto smooth-scroll">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
                <tr>
                  {[t(language, "orderCode"), t(language, "style"), t(language, "size"), t(language, "quantity"), t(language, "worker"), t(language, "time"), t(language, "actions")].map((head) => (
                    <th key={head} className="h-9 border-b border-r border-slate-200 px-2 text-left font-semibold last:border-r-0">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="h-20 text-center text-slate-500">{t(language, "noEntries")}</td>
                  </tr>
                ) : (
                  selectedEntries.map((entry) => {
                    const order = orders.find((item) => item.code === entry.orderId || item.id === entry.orderId);
                    return (
                      <tr key={entry.id} className="odd:bg-white even:bg-slate-50 hover:bg-blue-50">
                        <td className="h-9 border-b border-r border-slate-200 px-2 font-semibold text-blue-700">{order?.code}</td>
                        <td className="border-b border-r border-slate-200 px-2">{order?.style}</td>
                        <td className="border-b border-r border-slate-200 px-2">{entry.size}</td>
                        <td className="border-b border-r border-slate-200 px-2 text-right font-semibold tabular-nums">{formatNumber(entry.quantity)}</td>
                        <td className="border-b border-r border-slate-200 px-2">{entry.worker}</td>
                        <td className="border-b border-r border-slate-200 px-2">
                          {new Date(entry.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="border-b border-slate-200 px-2">
                          <div className="flex items-center gap-1">
                            <button title={t(language, "edit")} onClick={() => onEditEntry(entry)} className="rounded-md p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              title={t(language, "delete")}
                              onClick={() => {
                                if (window.confirm(t(language, "confirmDelete"))) onDeleteEntry(entry.id);
                              }}
                              className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
