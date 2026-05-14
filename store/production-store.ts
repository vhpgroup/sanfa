"use client";

import { create } from "zustand";
import { addDaysToDateString, normalizeDate, todayDateString } from "@/lib/date-utils";
import { productionSizes } from "@/lib/constants";
import {
  loadDailyDataFromStorage,
  loadLanguageFromStorage,
  loadOrdersFromStorage,
  saveDailyDataToStorage,
  saveLanguageToStorage,
  saveOrdersToStorage,
} from "@/lib/storage";
import {
  getOrderCompleted,
  getOrderCompletedBySize,
  getOrderCompletionRate,
  getOrderDeliveredTotal,
  getOrderDeliveryBySize,
  getOrderRemaining,
  getOrderRemainingBySize,
  getOrderTotalDelivery,
} from "@/lib/production-calculations";
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

function normalizeOrder(order: ProductionOrder): ProductionOrder {
  return {
    ...order,
    etd: normalizeDate(order.etd),
    sizePlan: productionSizes.reduce(
      (acc, size) => ({ ...acc, [size]: Math.max(Number(order.sizePlan?.[size] ?? 0) || 0, 0) }),
      {} as ProductionOrder["sizePlan"],
    ),
    producedPlan: productionSizes.reduce(
      (acc, size) => ({ ...acc, [size]: Math.max(Number(order.producedPlan?.[size] ?? 0) || 0, 0) }),
      {} as ProductionOrder["sizePlan"],
    ),
    deliveryPlan: productionSizes.reduce(
      (acc, size) => ({ ...acc, [size]: Math.max(Number(order.deliveryPlan?.[size] ?? 0) || 0, 0) }),
      {} as ProductionOrder["sizePlan"],
    ),
  };
}

function normalizeEntryOrderRefs(entries: ProductionEntry[], orders: ProductionOrder[]) {
  const codeByRef = new Map<string, string>();
  orders.forEach((order) => {
    codeByRef.set(order.id, order.code);
    codeByRef.set(order.code, order.code);
  });

  return entries.map((entry) => ({
    ...entry,
    orderId: codeByRef.get(entry.orderId) ?? entry.orderId,
  }));
}

export const useProductionStore = create<ProductionState>((set, get) => {
  const dailyData = loadDailyDataFromStorage();
  const storedOrders = loadOrdersFromStorage();
  const storedEntries = normalizeEntryOrderRefs(dailyData.entries, storedOrders);

  function persistDailyData() {
    const state = get();
    saveDailyDataToStorage({
      days: state.days,
      entries: state.entries,
      selectedDayId: state.selectedDayId,
    });
  }

  return {
      language: loadLanguageFromStorage(),
      orders: storedOrders,
      days: dailyData.days,
      entries: storedEntries,
      selectedDayId: dailyData.selectedDayId,
      setLanguage: (language) => {
        set({ language });
        saveLanguageToStorage(language);
      },
      setSelectedDay: (dayId) => {
        set({ selectedDayId: dayId });
        persistDailyData();
      },
      addDay: () => {
        const days = get().days;
        const nextIndex = days.length + 1;
        const lastDate = days.at(-1)?.date ?? todayDateString();

        const nextDay: ProductionDay = {
          id: `day-${nextIndex}`,
          label: `Day ${nextIndex}`,
          date: addDaysToDateString(lastDate, 1),
        };

        set({ days: [...days, nextDay], selectedDayId: nextDay.id });
        persistDailyData();
      },
      updateDay: (dayId) => {
        set({
          days: get().days.map((day) =>
            day.id === dayId ? { ...day, label: `${day.label}*` } : day,
          ),
        });
        persistDailyData();
      },
      deleteDay: (dayId) => {
        const days = get().days.filter((day) => day.id !== dayId);
        set({
          days,
          entries: get().entries.filter((entry) => entry.dayId !== dayId),
          selectedDayId: days[0]?.id ?? "",
        });
        persistDailyData();
      },
      addEntry: (entry) => {
        const newEntry: ProductionEntry = {
          ...entry,
          id: `entry-${crypto.randomUUID()}`,
          createdAt: new Date().toISOString(),
        };

        set({ entries: [...get().entries, newEntry] });
        persistDailyData();
      },
      updateEntry: (entryId, entry) => {
        set({
          entries: get().entries.map((item) =>
            item.id === entryId ? { ...item, ...entry } : item,
          ),
        });
        persistDailyData();
      },
      deleteEntry: (entryId) => {
        set({ entries: get().entries.filter((entry) => entry.id !== entryId) });
        persistDailyData();
      },
      updateOrder: (orderId, order) => {
        const previousOrder = get().orders.find((item) => item.id === orderId);
        const nextOrder = normalizeOrder({ ...order, id: orderId });
        set({
          orders: get().orders.map((item) =>
            item.id === orderId ? nextOrder : item,
          ),
          entries: get().entries.map((entry) =>
            entry.orderId === previousOrder?.id || entry.orderId === previousOrder?.code
              ? { ...entry, orderId: nextOrder.code }
              : entry,
          ),
        });
        saveOrdersToStorage(get().orders);
        persistDailyData();
      },
      updateOrders: (orders) => {
        const normalizedOrders = orders.map(normalizeOrder);
        const previousOrders = get().orders;
        const codeByRef = new Map<string, string>();
        normalizedOrders.forEach((order) => {
          codeByRef.set(order.id, order.code);
          codeByRef.set(order.code, order.code);
          const previousOrder = previousOrders.find((item) => item.id === order.id);
          if (previousOrder) {
            codeByRef.set(previousOrder.id, order.code);
            codeByRef.set(previousOrder.code, order.code);
          }
        });
        const orderCodes = new Set(normalizedOrders.map((order) => order.code));
        set({
          orders: normalizedOrders,
          entries: get().entries
            .map((entry) => ({ ...entry, orderId: codeByRef.get(entry.orderId) ?? entry.orderId }))
            .filter((entry) => orderCodes.has(entry.orderId)),
        });
        saveOrdersToStorage(get().orders);
        persistDailyData();
      },
      deleteAllOrders: () => {
        set({ orders: [], entries: [] });
        saveOrdersToStorage([]);
        persistDailyData();
      },
      deleteOrder: (orderId) => {
        const order = get().orders.find((item) => item.id === orderId);
        set({
          orders: get().orders.filter((order) => order.id !== orderId),
          entries: get().entries.filter(
            (entry) => entry.orderId !== orderId && entry.orderId !== order?.code,
          ),
        });
        saveOrdersToStorage(get().orders);
        persistDailyData();
      },
  };
});

export function selectOrderProgress(orders: ProductionOrder[], entries: ProductionEntry[]): OrderProgress[] {
  return orders.map((order) => {
    const orderedTotal = getOrderTotalDelivery(order);
    const shippedTotal = getOrderDeliveredTotal(order);
    const completed = getOrderCompleted(order, entries);
    const remaining = getOrderRemaining(order);
    const completionRate = getOrderCompletionRate(order, entries);

    return {
      ...order,
      orderedTotal,
      deliveredTotal: shippedTotal,
      completed,
      remaining,
      completionRate,
      completedBySize: getOrderCompletedBySize(order, entries),
      remainingBySize: getOrderRemainingBySize(order),
      deliveredBySize: getOrderDeliveryBySize(order),
    };
  });
}

export function getDayTotal(dayId: string, entries: ProductionEntry[]) {
  return entries
    .filter((entry) => entry.dayId === dayId)
    .reduce((sum, entry) => sum + entry.quantity, 0);
}
