import { productionSizes } from "@/lib/constants";
import { formatDateDisplay, normalizeDate, todayDateString } from "@/lib/date-utils";
import type { ProductionOrder } from "@/types/production";

const baseHeaders = ["Mã đơn", "Số lượng đơn", "ETD", "Style", "Màu", "Công nghệ"];

function escapeCsvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  return headers.findIndex((header) =>
    candidates.some((candidate) => header.toLowerCase() === candidate.toLowerCase()),
  );
}

export function ordersToCsv(orders: ProductionOrder[]) {
  const producedHeaders = productionSizes.map((size) => `${size} làm`);
  const deliveryHeaders = productionSizes.map((size) => `${size} giao`);
  const headers = [...baseHeaders, ...productionSizes, ...producedHeaders, ...deliveryHeaders];
  const rows = orders.map((order) => [
    order.code,
    order.orderQuantity,
    formatDateDisplay(order.etd),
    order.style,
    order.color,
    order.technology,
    ...productionSizes.map((size) => order.sizePlan[size]),
    ...productionSizes.map((size) => order.producedPlan?.[size] ?? 0),
    ...productionSizes.map((size) => order.deliveryPlan?.[size] ?? 0),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");
}

export function csvToOrders(csv: string): ProductionOrder[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const codeIndex = findHeaderIndex(headers, ["Mã đơn", "MÃ£ Ä‘Æ¡n", "Ma don", "Order Code", "orderCode"]);
  const quantityIndex = findHeaderIndex(headers, [
    "Số lượng đơn",
    "Sá»‘ lÆ°á»£ng Ä‘Æ¡n",
    "So luong don",
    "Order Quantity",
    "orderQuantity",
  ]);
  const etdIndex = findHeaderIndex(headers, ["ETD", "etd"]);
  const styleIndex = findHeaderIndex(headers, ["Style", "style"]);
  const colorIndex = findHeaderIndex(headers, ["Màu", "MÃ u", "Mau", "Color", "color"]);
  const technologyIndex = findHeaderIndex(headers, ["Công nghệ", "CÃ´ng nghá»‡", "Cong nghe", "Technology", "technology"]);

  return lines.slice(1).map((line, rowIndex) => {
    const cells = parseCsvLine(line);
    const sizePlan = productionSizes.reduce(
      (acc, size) => {
        const directIndex = headers.findIndex((header) => header === size || header === `Size ${size}`);
        return { ...acc, [size]: Math.max(Number(cells[directIndex] ?? 0) || 0, 0) };
      },
      {} as ProductionOrder["sizePlan"],
    );
    const deliveryPlan = productionSizes.reduce(
      (acc, size) => {
        const directIndex = headers.findIndex((header) =>
          [
            `${size} giao`,
            `${size} da giao`,
            `${size} đã giao`,
            `Giao ${size}`,
            `Da giao ${size}`,
            `Đã giao ${size}`,
            `Delivered ${size}`,
            `Shipped ${size}`,
          ].some((candidate) => header.toLowerCase() === candidate.toLowerCase()),
        );
        return { ...acc, [size]: Math.max(Number(cells[directIndex] ?? 0) || 0, 0) };
      },
      {} as ProductionOrder["sizePlan"],
    );
    const producedPlan = productionSizes.reduce(
      (acc, size) => {
        const directIndex = headers.findIndex((header) =>
          [
            `${size} làm`,
            `${size} lam`,
            `${size} da lam`,
            `${size} đã làm`,
            `Làm ${size}`,
            `Lam ${size}`,
            `Da lam ${size}`,
            `Đã làm ${size}`,
            `Done ${size}`,
            `Produced ${size}`,
          ].some((candidate) => header.toLowerCase() === candidate.toLowerCase()),
        );
        return { ...acc, [size]: Math.max(Number(cells[directIndex] ?? 0) || 0, 0) };
      },
      {} as ProductionOrder["sizePlan"],
    );

    return {
      id: `ord-import-${Date.now()}-${rowIndex}`,
      code: cells[codeIndex]?.trim() || `IMPORT-${rowIndex + 1}`,
      orderQuantity: Math.max(Number(cells[quantityIndex] ?? 0) || 0, 0),
      etd: normalizeDate(cells[etdIndex]?.trim() || todayDateString()),
      style: cells[styleIndex]?.trim() || "",
      color: cells[colorIndex]?.trim() || "",
      technology: cells[technologyIndex]?.trim() || "",
      sizePlan,
      producedPlan,
      deliveryPlan,
    };
  });
}
