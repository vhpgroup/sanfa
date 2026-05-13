"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { formatNumber, formatPercent } from "@/lib/utils";
import { getDayTotal } from "@/store/production-store";
import type { Language, OrderProgress, ProductionDay, ProductionEntry } from "@/types/production";

type ProductionChartProps = {
  language: Language;
  days: ProductionDay[];
  entries: ProductionEntry[];
  progress: OrderProgress[];
};

export function ProductionChart({ language, days, entries, progress }: ProductionChartProps) {
  const dayData = days.map((day) => ({
    name: day.label,
    total: getDayTotal(day.id, entries),
  }));

  const totalOrderQuantity = progress.reduce((sum, order) => sum + order.orderQuantity, 0);
  const completed = progress.reduce((sum, order) => sum + order.completed, 0);
  const remaining = Math.max(totalOrderQuantity - completed, 0);
  const completionData = [
    { name: t(language, "completed"), value: completed, color: "#16a34a" },
    { name: t(language, "remaining"), value: remaining, color: "#ef4444" },
  ];

  return (
    <section className="grid grid-cols-[1.2fr_0.8fr_1fr] gap-3">
      <Card className="rounded-xl border-slate-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle>{t(language, "chartByDay")}</CardTitle>
        </CardHeader>
        <CardContent className="h-44 p-4 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => formatNumber(Number(value))} tickLine={false} axisLine={false} width={54} />
              <Tooltip formatter={(value) => formatNumber(Number(value))} />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle>{t(language, "chartCompletion")}</CardTitle>
        </CardHeader>
        <CardContent className="h-44 p-4 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={completionData} innerRadius={42} outerRadius={64} paddingAngle={4} dataKey="value">
                {completionData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="-mt-12 text-center">
            <div className="text-xl font-semibold text-slate-950">{formatPercent(totalOrderQuantity ? (completed / totalOrderQuantity) * 100 : 0)}</div>
            <div className="text-xs text-slate-500">{t(language, "completionRate")}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle>{t(language, "chartTrend")}</CardTitle>
        </CardHeader>
        <CardContent className="h-44 p-4 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => formatNumber(Number(value))} tickLine={false} axisLine={false} width={54} />
              <Tooltip formatter={(value) => formatNumber(Number(value))} />
              <Line type="monotone" dataKey="total" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
