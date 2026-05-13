export type Language = "vi" | "zh";

export type ProductionSize =
  | "36"
  | "36.5"
  | "37"
  | "37.5"
  | "38"
  | "38.5"
  | "39"
  | "39.5"
  | "40"
  | "40.5"
  | "41"
  | "41.5"
  | "42"
  | "42.5"
  | "43"
  | "43.5";

export type ProductionOrder = {
  id: string;
  code: string;
  orderQuantity: number;
  etd: string;
  style: string;
  color: string;
  technology: string;
  sizePlan: Record<ProductionSize, number>;
};

export type ProductionDay = {
  id: string;
  label: string;
  date: string;
};

export type ProductionEntry = {
  id: string;
  dayId: string;
  orderId: string;
  size: ProductionSize;
  quantity: number;
  worker: string;
  note: string;
  createdAt: string;
};

export type NewProductionEntry = Omit<ProductionEntry, "id" | "createdAt">;

export type OrderProgress = ProductionOrder & {
  deliveredTotal: number;
  completed: number;
  remaining: number;
  completionRate: number;
};
