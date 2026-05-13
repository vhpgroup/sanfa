import { productionSizes } from "@/lib/constants";
import type { ProductionDay, ProductionEntry, ProductionOrder } from "@/types/production";

function sizePlan(values: number[]) {
  return productionSizes.reduce(
    (acc, size, index) => ({ ...acc, [size]: values[index] ?? 0 }),
    {} as ProductionOrder["sizePlan"],
  );
}

export const mockOrders: ProductionOrder[] = [
  {
    id: "ord-ptb2607139",
    code: "PTB2607139",
    orderQuantity: 4260,
    etd: "2026-05-28",
    style: "CT-Runner Pro",
    color: "Black / White",
    technology: "Cold cement",
    sizePlan: sizePlan([120, 140, 210, 210, 280, 280, 340, 340, 370, 370, 325, 325, 260, 260, 170, 130]),
  },
  {
    id: "ord-ptb2607140",
    code: "PTB2607140",
    orderQuantity: 3880,
    etd: "2026-05-30",
    style: "TP-Urban Lite",
    color: "Navy",
    technology: "Injection",
    sizePlan: sizePlan([80, 100, 180, 180, 260, 260, 310, 310, 360, 360, 300, 300, 240, 240, 160, 120]),
  },
  {
    id: "ord-ptb2607136",
    code: "PTB2607136",
    orderQuantity: 5120,
    etd: "2026-06-02",
    style: "CT-Trail Max",
    color: "Grey / Lime",
    technology: "Strobel",
    sizePlan: sizePlan([140, 160, 260, 260, 345, 345, 380, 380, 430, 430, 390, 390, 325, 325, 220, 170]),
  },
  {
    id: "ord-ptb2607137",
    code: "PTB2607137",
    orderQuantity: 2960,
    etd: "2026-06-04",
    style: "TP-Court Flex",
    color: "White / Red",
    technology: "Vulcanized",
    sizePlan: sizePlan([60, 80, 130, 130, 200, 200, 250, 250, 280, 280, 230, 230, 180, 180, 120, 80]),
  },
  {
    id: "ord-ptb2607138",
    code: "PTB2607138",
    orderQuantity: 3480,
    etd: "2026-06-06",
    style: "CT-Daily Move",
    color: "Beige / Green",
    technology: "Direct attach",
    sizePlan: sizePlan([70, 90, 160, 160, 230, 230, 280, 280, 330, 330, 270, 270, 215, 215, 150, 100]),
  },
];

export const mockDays: ProductionDay[] = [
  { id: "day-1", label: "Day 1", date: "2026-05-13" },
  { id: "day-2", label: "Day 2", date: "2026-05-14" },
  { id: "day-3", label: "Day 3", date: "2026-05-15" },
];

export const mockEntries: ProductionEntry[] = [
  { id: "entry-1", dayId: "day-1", orderId: "ord-ptb2607139", size: "39", quantity: 340, worker: "Nguyễn Văn A", note: "Line A1", createdAt: "2026-05-13T08:30:00.000Z" },
  { id: "entry-2", dayId: "day-1", orderId: "ord-ptb2607139", size: "40", quantity: 460, worker: "Trần Thị B", note: "Ca sáng", createdAt: "2026-05-13T10:10:00.000Z" },
  { id: "entry-3", dayId: "day-1", orderId: "ord-ptb2607140", size: "38", quantity: 280, worker: "Lê Minh C", note: "QC passed", createdAt: "2026-05-13T11:20:00.000Z" },
  { id: "entry-4", dayId: "day-2", orderId: "ord-ptb2607136", size: "40", quantity: 520, worker: "Phạm Quốc D", note: "Line B2", createdAt: "2026-05-14T08:40:00.000Z" },
  { id: "entry-5", dayId: "day-2", orderId: "ord-ptb2607137", size: "39", quantity: 260, worker: "Hoàng Thị E", note: "Ca chiều", createdAt: "2026-05-14T13:15:00.000Z" },
  { id: "entry-6", dayId: "day-2", orderId: "ord-ptb2607138", size: "41", quantity: 310, worker: "Đỗ Văn F", note: "Bổ sung", createdAt: "2026-05-14T14:50:00.000Z" },
  { id: "entry-7", dayId: "day-3", orderId: "ord-ptb2607139", size: "41", quantity: 390, worker: "Nguyễn Văn A", note: "Ổn định", createdAt: "2026-05-15T09:15:00.000Z" },
  { id: "entry-8", dayId: "day-3", orderId: "ord-ptb2607136", size: "42", quantity: 420, worker: "Trần Thị B", note: "QC passed", createdAt: "2026-05-15T10:45:00.000Z" },
  { id: "entry-9", dayId: "day-3", orderId: "ord-ptb2607140", size: "40", quantity: 360, worker: "Lê Minh C", note: "Line C1", createdAt: "2026-05-15T15:35:00.000Z" },
];
