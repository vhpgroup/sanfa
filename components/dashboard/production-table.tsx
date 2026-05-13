"use client";

import { Edit3, FileSpreadsheet, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import { productionSizes } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import type { Language, OrderProgress } from "@/types/production";

type ProductionTableProps = {
  language: Language;
  progress: OrderProgress[];
  onEditAllOrders: () => void;
  onDeleteAllOrders: () => void;
  onEditOrder: (order: OrderProgress) => void;
  onDeleteOrder: (orderId: string) => void;
  onImportClick: () => void;
  onAddOrder: () => void;
};

function EmptyState({
  language,
  onImportClick,
  onAddOrder,
}: {
  language: Language;
  onImportClick: () => void;
  onAddOrder: () => void;
}) {
  return (
    <div className="flex min-h-[360px] flex-1 items-center justify-center bg-white px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <FileSpreadsheet className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{t(language, "noEntries")}</h3>
        <p className="mt-2 text-sm text-slate-500">{t(language, "emptyOrderHint")}</p>
        <div className="mt-5 flex items-center gap-2">
          <Button variant="outline" onClick={onImportClick}>
            <Upload className="h-4 w-4" />
            {t(language, "importExcel")}
          </Button>
          <Button onClick={onAddOrder}>
            <Plus className="h-4 w-4" />
            {t(language, "addOrder")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductionTable({
  language,
  progress,
  onEditAllOrders,
  onDeleteAllOrders,
  onEditOrder,
  onDeleteOrder,
  onImportClick,
  onAddOrder,
}: ProductionTableProps) {
  const hasData = progress.length > 0;
  const {
    page,
    pageCount,
    pageSize,
    paginatedItems,
    startItem,
    endItem,
    setPage,
    setPageSize,
  } = usePagination(progress, 10);
  const totals = progress.reduce(
    (acc, order) => ({
      orderQuantity: acc.orderQuantity + order.orderQuantity,
      deliveredTotal: acc.deliveredTotal + order.deliveredTotal,
      completed: acc.completed + order.completed,
      remaining: acc.remaining + order.remaining,
      sizePlan: productionSizes.reduce(
        (sizeAcc, size) => ({
          ...sizeAcc,
          [size]: sizeAcc[size] + order.sizePlan[size],
        }),
        acc.sizePlan,
      ),
    }),
    {
      orderQuantity: 0,
      deliveredTotal: 0,
      completed: 0,
      remaining: 0,
      sizePlan: productionSizes.reduce(
        (acc, size) => ({ ...acc, [size]: 0 }),
        {} as OrderProgress["sizePlan"],
      ),
    },
  );
  const totalRate = totals.orderQuantity > 0 ? (totals.completed / totals.orderQuantity) * 100 : 0;
  const headers = [
    t(language, "stt"),
    t(language, "orderCode"),
    t(language, "orderQuantity"),
    t(language, "etd"),
    t(language, "style"),
    t(language, "color"),
    t(language, "technology"),
    ...productionSizes,
    t(language, "deliveredTotal"),
    t(language, "done"),
    t(language, "remaining"),
    t(language, "rate"),
  ];

  return (
    <section className="table-card flex h-[540px] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{t(language, "mainTable")}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            title={`${t(language, "edit")} ${t(language, "mainTable")}`}
            onClick={onEditAllOrders}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {t(language, "edit")}
          </button>
          <button
            title={`${t(language, "delete")} ${t(language, "mainTable")}`}
            onClick={() => {
              if (window.confirm(t(language, "confirmDelete"))) onDeleteAllOrders();
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t(language, "delete")}
          </button>
        </div>
      </div>
      {!hasData ? (
        <EmptyState language={language} onImportClick={onImportClick} onAddOrder={onAddOrder} />
      ) : (
      <div className="production-table-scroll table-scroll min-h-0 flex-1 overflow-auto">
        <table className="min-w-[2180px] border-separate border-spacing-0 text-[11.5px]">
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 shadow-sm">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={cn(
                    "h-8 whitespace-nowrap border-b border-r border-slate-200 bg-slate-100 px-2 text-left font-semibold",
                    index === 0 && "sticky left-0 z-40 w-14 min-w-14",
                    index === 1 && "sticky left-14 z-40 w-[170px] min-w-[170px] shadow-[8px_0_14px_rgba(15,23,42,0.06)]",
                  )}
                >
                  {header}
                </th>
              ))}
              <th className="sticky right-0 z-30 h-8 w-[92px] whitespace-nowrap border-b border-l border-slate-200 bg-slate-100 px-2 text-left font-semibold shadow-[-8px_0_16px_rgba(15,23,42,0.08)]">
                {t(language, "actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((order, index) => (
              <tr key={order.id} className="odd:bg-white even:bg-slate-50/70 hover:bg-blue-50/80">
                <td className="sticky left-0 z-10 h-8 w-14 min-w-14 border-b border-r border-slate-200 bg-inherit px-2 text-slate-500">{startItem + index}</td>
                <td className="sticky left-14 z-10 w-[170px] min-w-[170px] border-b border-r border-slate-200 bg-inherit px-2 shadow-[8px_0_14px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-blue-700">{order.code}</span>
                    <button
                      title={t(language, "edit")}
                      onClick={() => onEditOrder(order)}
                      className="rounded-md p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="border-b border-r border-slate-200 px-2 text-right font-semibold tabular-nums">{formatNumber(order.orderQuantity)}</td>
                <td className="border-b border-r border-slate-200 px-2">{order.etd}</td>
                <td className="border-b border-r border-slate-200 px-2">{order.style}</td>
                <td className="border-b border-r border-slate-200 px-2">{order.color}</td>
                <td className="border-b border-r border-slate-200 px-2">{order.technology}</td>
                {productionSizes.map((size) => (
                  <td key={size} className="border-b border-r border-slate-200 px-2 text-right tabular-nums">
                    {formatNumber(order.sizePlan[size])}
                  </td>
                ))}
                <td className="border-b border-r border-slate-200 px-2 text-right font-bold text-slate-950 tabular-nums">{formatNumber(order.deliveredTotal)}</td>
                <td className="border-b border-r border-slate-200 px-2 text-right font-semibold text-blue-700 tabular-nums">{formatNumber(order.completed)}</td>
                <td className="border-b border-r border-slate-200 px-2 text-right font-semibold text-red-600 tabular-nums">{formatNumber(order.remaining)}</td>
                <td className="border-b border-r border-slate-200 px-2">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                    {formatPercent(order.completionRate)}
                  </span>
                </td>
                <td className="sticky right-0 z-20 w-[92px] border-b border-l border-slate-200 bg-inherit px-2 shadow-[-8px_0_16px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-1">
                    <button title={t(language, "edit")} onClick={() => onEditOrder(order)} className="rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      title={t(language, "delete")}
                      onClick={() => {
                        if (window.confirm(t(language, "confirmDelete"))) onDeleteOrder(order.id);
                      }}
                      className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-40 bg-slate-900 text-white shadow-[0_-8px_18px_rgba(15,23,42,0.16)]">
            <tr>
              <td className="sticky left-0 z-50 h-8 w-[226px] min-w-[226px] border-r border-white/10 bg-slate-900 px-2 font-semibold shadow-[8px_0_14px_rgba(15,23,42,0.2)]" colSpan={2}>{t(language, "total")}</td>
              <td className="border-r border-white/10 px-2 text-right font-semibold tabular-nums">{formatNumber(totals.orderQuantity)}</td>
              <td className="border-r border-white/10 px-2" colSpan={4} />
              {productionSizes.map((size) => (
                <td key={size} className="border-r border-white/10 px-2 text-right font-semibold tabular-nums">
                  {formatNumber(totals.sizePlan[size])}
                </td>
              ))}
              <td className="border-r border-white/10 px-2 text-right font-semibold tabular-nums">{formatNumber(totals.deliveredTotal)}</td>
              <td className="border-r border-white/10 px-2 text-right font-semibold text-sky-200 tabular-nums">{formatNumber(totals.completed)}</td>
              <td className="border-r border-white/10 px-2 text-right font-semibold text-red-200 tabular-nums">{formatNumber(totals.remaining)}</td>
              <td className="border-r border-white/10 px-2 font-semibold">{formatPercent(totalRate)}</td>
              <td className="sticky right-0 z-50 w-[92px] border-l border-white/10 bg-slate-900 px-2">
                <div className="flex items-center gap-1">
                  <button title={t(language, "edit")} onClick={onEditAllOrders} className="rounded-md p-1.5 text-sky-200 transition hover:bg-white/10 hover:text-white">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title={t(language, "delete")}
                    onClick={() => {
                      if (window.confirm(t(language, "confirmDelete"))) onDeleteAllOrders();
                    }}
                    className="rounded-md p-1.5 text-red-200 transition hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}
      {hasData ? (
      <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
        <div className="text-sm text-slate-600">
          Hiển thị {startItem} đến {endItem} của {formatNumber(progress.length)} dòng
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>
          <button
            className="h-8 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={page === 1}
            onClick={() => setPage(Math.max(page - 1, 1))}
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={cn(
                  "h-8 min-w-8 rounded-md border px-2 text-sm font-semibold transition",
                  page === pageNumber
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          <button
            className="h-8 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={page === pageCount}
            onClick={() => setPage(Math.min(page + 1, pageCount))}
          >
            Next
          </button>
        </div>
      </div>
      ) : null}
    </section>
  );
}
