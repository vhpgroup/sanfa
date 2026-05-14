"use client";

import { CheckCircle2, ClipboardList, Gauge, PackageOpen, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { DashboardStats } from "@/lib/production-calculations";
import type { Language } from "@/types/production";

type StatCardsProps = {
  language: Language;
  stats: DashboardStats;
};

export function StatCards({ language, stats }: StatCardsProps) {
  const cards = [
    {
      label: t(language, "totalOrders"),
      value: formatNumber(stats.totalOrders),
      accent: "text-blue-700 bg-blue-50",
      bar: 100,
      icon: ClipboardList,
    },
    {
      label: t(language, "totalOrderQuantity"),
      value: formatNumber(stats.totalDelivery),
      accent: "text-slate-700 bg-slate-100",
      bar: 92,
      icon: PackageOpen,
    },
    {
      label: t(language, "completed"),
      value: formatNumber(stats.totalCompleted),
      accent: "text-sky-700 bg-sky-50",
      bar: stats.completionRate,
      icon: CheckCircle2,
    },
    {
      label: t(language, "remaining"),
      value: formatNumber(stats.totalRemaining),
      accent: "text-red-700 bg-red-50",
      bar: stats.totalDelivery ? (stats.totalRemaining / stats.totalDelivery) * 100 : 0,
      icon: Gauge,
    },
    {
      label: t(language, "completionRate"),
      value: formatPercent(stats.completionRate),
      accent: "text-emerald-700 bg-emerald-50",
      bar: stats.completionRate,
      icon: TrendingUp,
    },
  ];

  return (
    <section className="grid grid-cols-5 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="group rounded-xl border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500">{card.label}</p>
                <p className="mt-1 text-[22px] font-semibold leading-7 tracking-normal text-slate-950">{card.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.accent}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.max(Math.min(card.bar, 100), 0)}%` }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
