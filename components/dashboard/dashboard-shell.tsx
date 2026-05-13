"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { DayPanel } from "@/components/dashboard/day-panel";
import { Header } from "@/components/dashboard/header";
import { OrderEditModal } from "@/components/dashboard/order-edit-modal";
import { OrdersBulkEditModal } from "@/components/dashboard/orders-bulk-edit-modal";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { ProductionEntryModal } from "@/components/dashboard/production-entry-modal";
import { ProductionTable } from "@/components/dashboard/production-table";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatCards } from "@/components/dashboard/stat-cards";
import { Button } from "@/components/ui/button";
import { csvToOrders, ordersToCsv } from "@/lib/excel-csv";
import { t } from "@/lib/i18n";
import { selectOrderProgress, useProductionStore } from "@/store/production-store";
import type { NewProductionEntry, ProductionEntry, ProductionOrder } from "@/types/production";

export function DashboardShell() {
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [ordersBulkModalOpen, setOrdersBulkModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProductionEntry | null>(null);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    language,
    orders,
    days,
    entries,
    selectedDayId,
    setLanguage,
    setSelectedDay,
    addDay,
    updateDay,
    deleteDay,
    addEntry,
    updateEntry,
    deleteEntry,
    updateOrder,
    updateOrders,
    deleteAllOrders,
    deleteOrder,
  } = useProductionStore();

  const progress = useMemo(() => selectOrderProgress(orders, entries), [orders, entries]);
  const filteredProgress = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return progress;

    return progress.filter((order) =>
      [order.code, order.style, order.color, order.technology, order.etd]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [progress, searchQuery]);
  const totalOrderQuantity = progress.reduce((sum, order) => sum + order.orderQuantity, 0);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openCreateEntry() {
    setEditingEntry(null);
    setEntryModalOpen(true);
  }

  function handleSaveEntry(entry: NewProductionEntry) {
    if (editingEntry) {
      updateEntry(editingEntry.id, entry);
    } else {
      addEntry(entry);
    }
    showToast(t(language, "saved"));
    setEditingEntry(null);
  }

  function handleExportExcel() {
    const csv = ordersToCsv(orders);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bang-thong-ke-san-luong.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportExcel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const csv = await file.text();
    const importedOrders = csvToOrders(csv);
    const existingIdByCode = new Map(orders.map((order) => [order.code, order.id]));
    updateOrders(
      importedOrders.map((order) => ({
        ...order,
        id: existingIdByCode.get(order.code) ?? order.id,
      })),
    );
    showToast(t(language, "saved"));
  }

  return (
    <div className="flex h-screen min-w-[1440px] overflow-hidden bg-slate-100">
      <Sidebar language={language} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          language={language}
          searchQuery={searchQuery}
          onLanguageChange={setLanguage}
          onSearchChange={setSearchQuery}
          onImportClick={() => fileInputRef.current?.click()}
          onExportClick={handleExportExcel}
        />
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
          onChange={handleImportExcel}
        />
        <main className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-auto pr-1 smooth-scroll">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{t(language, "productionOverview")}</h2>
              </div>
              <Button className="rounded-lg shadow-sm" onClick={openCreateEntry}>
                <Plus className="h-4 w-4" />
                {t(language, "inputProduction")}
              </Button>
            </div>
            <StatCards language={language} progress={progress} />
            <ProductionTable
              language={language}
              progress={filteredProgress}
              onEditAllOrders={() => setOrdersBulkModalOpen(true)}
              onImportClick={() => fileInputRef.current?.click()}
              onAddOrder={() => setOrdersBulkModalOpen(true)}
              onDeleteAllOrders={() => {
                deleteAllOrders();
                showToast(t(language, "deleted"));
              }}
              onEditOrder={(order) => {
                setEditingOrder(order);
                setOrderModalOpen(true);
              }}
              onDeleteOrder={(orderId) => {
                deleteOrder(orderId);
                showToast(t(language, "deleted"));
              }}
            />
            <ProductionChart language={language} days={days} entries={entries} progress={progress} />
          </div>
          <DayPanel
            language={language}
            days={days}
            entries={entries}
            orders={orders}
            selectedDayId={selectedDayId}
            totalOrderQuantity={totalOrderQuantity}
            onSelectDay={setSelectedDay}
            onAddDay={() => {
              addDay();
              showToast(t(language, "dayAdded"));
            }}
            onEditDay={(dayId) => {
              updateDay(dayId);
              showToast(t(language, "saved"));
            }}
            onDeleteDay={(dayId) => {
              deleteDay(dayId);
              showToast(t(language, "deleted"));
            }}
            onEditEntry={(entry) => {
              setEditingEntry(entry);
              setEntryModalOpen(true);
            }}
            onDeleteEntry={(entryId) => {
              deleteEntry(entryId);
              showToast(t(language, "deleted"));
            }}
          />
        </main>
      </div>
      <ProductionEntryModal
        language={language}
        open={entryModalOpen}
        onOpenChange={(open) => {
          setEntryModalOpen(open);
          if (!open) setEditingEntry(null);
        }}
        days={days}
        orders={orders}
        selectedDayId={selectedDayId}
        editingEntry={editingEntry}
        onSave={handleSaveEntry}
      />
      <OrderEditModal
        language={language}
        open={orderModalOpen}
        order={editingOrder}
        onOpenChange={(open) => {
          setOrderModalOpen(open);
          if (!open) setEditingOrder(null);
        }}
        onSave={(order) => {
          updateOrder(order.id, order);
          showToast(t(language, "saved"));
        }}
      />
      <OrdersBulkEditModal
        language={language}
        open={ordersBulkModalOpen}
        orders={orders}
        onOpenChange={setOrdersBulkModalOpen}
        onSave={(nextOrders) => {
          updateOrders(nextOrders);
          showToast(t(language, "saved"));
        }}
      />
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl animate-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          {toast}
        </div>
      ) : null}
    </div>
  );
}
