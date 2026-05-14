import { normalizeDate } from "@/lib/date-utils";
import { productionSizes } from "@/lib/constants";
import type { Language, ProductionDay, ProductionEntry, ProductionOrder } from "@/types/production";

const ORDERS_KEY = "production-orders";
const DAILY_DATA_KEY = "production-daily-data";
const LANGUAGE_KEY = "selected-language";
const LEGACY_KEY = "chinh-thai-tam-phat-production";

type DailyData = {
  days: ProductionDay[];
  entries: ProductionEntry[];
  selectedDayId: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

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

function readLegacyState() {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Partial<DailyData> & { orders?: ProductionOrder[]; language?: Language } };
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

export function saveOrdersToStorage(orders: ProductionOrder[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.map(normalizeOrder)));
}

export function loadOrdersFromStorage() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (raw) return (JSON.parse(raw) as ProductionOrder[]).map(normalizeOrder);

    const legacyOrders = readLegacyState()?.orders;
    if (legacyOrders?.length) {
      const normalized = legacyOrders.map(normalizeOrder);
      saveOrdersToStorage(normalized);
      return normalized;
    }
  } catch {
    return [];
  }

  return [];
}

export function saveDailyDataToStorage(dailyData: DailyData) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DAILY_DATA_KEY, JSON.stringify(dailyData));
}

export function loadDailyDataFromStorage(): DailyData {
  if (!canUseStorage()) {
    return { days: [], entries: [], selectedDayId: "" };
  }

  try {
    const raw = window.localStorage.getItem(DAILY_DATA_KEY);
    if (raw) return JSON.parse(raw) as DailyData;

    const legacy = readLegacyState();
    if (legacy?.days && legacy.entries) {
      const dailyData = {
        days: legacy.days,
        entries: legacy.entries,
        selectedDayId: legacy.selectedDayId ?? legacy.days[0]?.id ?? "",
      };
      saveDailyDataToStorage(dailyData);
      return dailyData;
    }
  } catch {
    return { days: [], entries: [], selectedDayId: "" };
  }

  return { days: [], entries: [], selectedDayId: "" };
}

export function saveLanguageToStorage(language: Language) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LANGUAGE_KEY, language);
}

export function loadLanguageFromStorage(): Language {
  if (!canUseStorage()) return "vi";
  const language = window.localStorage.getItem(LANGUAGE_KEY);
  if (language === "vi" || language === "zh") return language;

  const legacyLanguage = readLegacyState()?.language;
  if (legacyLanguage === "vi" || legacyLanguage === "zh") {
    saveLanguageToStorage(legacyLanguage);
    return legacyLanguage;
  }

  return "vi";
}
