"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mockDays, mockEntries, mockOrders } from "@/lib/mock-data";
import type {
  Language,
  NewProductionEntry,
  OrderProgress,
  ProductionDay,
  ProductionEntry,
  ProductionOrder,
} from "@/types/production";

type ProductionState = {
  language: Language;
  orders: ProductionOrder[];
  days: ProductionDay[];
  entries: ProductionEntry[];
  selectedDayId: string;
  setLanguage: (language: Language) => void;
  setSelectedDay: (dayId: string) => void;
  addDay: () => void;
  updateDay: (dayId: string) => void;
  deleteDay: (dayId: string) => void;
  addEntry: (entry: NewProductionEntry) => void;
  updateEntry: (entryId: string, entry: NewProductionEntry) => void;
  deleteEntry: (entryId: string) => void;
  updateOrder: (orderId: string, order: ProductionOrder) => void;
  updateOrders: (orders: ProductionOrder[]) => void;
  deleteAllOrders: () => void;
  deleteOrder: (orderId: string) => void;
};

export const useProductionStore = create<ProductionState>()(
  persist(
    (set, get) => ({
      language: "vi",
      orders: mockOrders,
      days: mockDays,
      entries: mockEntries,
      selectedDayId: mockDays[0]?.id ?? "",
      setLanguage: (language) => set({ language }),
      setSelectedDay: (dayId) => set({ selectedDayId: dayId }),
      addDay: () => {
        const days = get().days;
        const nextIndex = days.length + 1;
        const lastDate = days.at(-1)?.date ?? new Date().toISOString().slice(0, 10);
        const nextDate = new Date(`${lastDate}T00:00:00`);
        nextDate.setDate(nextDate.getDate() + 1);

        const nextDay: ProductionDay = {
          id: `day-${nextIndex}`,
          label: `Day ${nextIndex}`,
          date: nextDate.toISOString().slice(0, 10),
        };

        set({ days: [...days, nextDay], selectedDayId: nextDay.id });
      },
      updateDay: (dayId) => {
        set({
          days: get().days.map((day) =>
            day.id === dayId ? { ...day, label: `${day.label}*` } : day,
          ),
        });
      },
      deleteDay: (dayId) => {
        const days = get().days.filter((day) => day.id !== dayId);
        set({
          days,
          entries: get().entries.filter((entry) => entry.dayId !== dayId),
          selectedDayId: days[0]?.id ?? "",
        });
      },
      addEntry: (entry) => {
        const newEntry: ProductionEntry = {
          ...entry,
          id: `entry-${crypto.randomUUID()}`,
          createdAt: new Date().toISOString(),
        };

        set({ entries: [...get().entries, newEntry] });
      },
      updateEntry: (entryId, entry) => {
        set({
          entries: get().entries.map((item) =>
            item.id === entryId ? { ...item, ...entry } : item,
          ),
        });
      },
      deleteEntry: (entryId) => {
        set({ entries: get().entries.filter((entry) => entry.id !== entryId) });
      },
      updateOrder: (orderId, order) => {
        set({
          orders: get().orders.map((item) =>
            item.id === orderId ? { ...order, id: orderId } : item,
          ),
        });
      },
      updateOrders: (orders) => {
        const orderIds = new Set(orders.map((order) => order.id));
        set({
          orders,
          entries: get().entries.filter((entry) => orderIds.has(entry.orderId)),
        });
      },
      deleteAllOrders: () => {
        set({ orders: [], entries: [] });
      },
      deleteOrder: (orderId) => {
        set({
          orders: get().orders.filter((order) => order.id !== orderId),
          entries: get().entries.filter((entry) => entry.orderId !== orderId),
        });
      },
    }),
    {
      name: "chinh-thai-tam-phat-production",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        orders: state.orders,
        days: state.days,
        entries: state.entries,
        selectedDayId: state.selectedDayId,
      }),
    },
  ),
);

export function selectOrderProgress(orders: ProductionOrder[], entries: ProductionEntry[]): OrderProgress[] {
  return orders.map((order) => {
    const completed = entries
      .filter((entry) => entry.orderId === order.id)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    const remaining = Math.max(order.orderQuantity - completed, 0);
    const completionRate = order.orderQuantity > 0 ? Math.min((completed / order.orderQuantity) * 100, 100) : 0;

    return {
      ...order,
      deliveredTotal: order.orderQuantity,
      completed,
      remaining,
      completionRate,
    };
  });
}

export function getDayTotal(dayId: string, entries: ProductionEntry[]) {
  return entries
    .filter((entry) => entry.dayId === dayId)
    .reduce((sum, entry) => sum + entry.quantity, 0);
}
