import { productionSizes } from "@/lib/constants";
import { formatDateDisplay, normalizeDate, todayDateString } from "@/lib/date-utils";
import type { ProductionOrder } from "@/types/production";

const baseHeaders = ["Mã đơn", "Số lượng đơn", "ETD", "Style", "Màu", "Công nghệ"];
const delimiters = [",", ";", "\t"] as const;

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

function escapeCsvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseDelimitedLine(line: string, delimiter: string) {
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
    } else if (char === delimiter && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function detectDelimiter(headerLine: string) {
  return delimiters.reduce(
    (best, delimiter) => {
      const count = parseDelimitedLine(headerLine, delimiter).length;
      return count > best.count ? { delimiter, count } : best;
    },
    { delimiter: ",", count: 1 },
  ).delimiter;
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const normalized = value.trim().replace(/,/g, "");
  return Math.max(Number(normalized) || 0, 0);
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeHeader);
  return headers.findIndex((header) => normalizedCandidates.includes(normalizeHeader(header)));
}

function findSizeHeaderIndex(headers: string[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeHeader);
  return headers.findIndex((header) => normalizedCandidates.includes(normalizeHeader(header)));
}

function emptySizePlan() {
  return productionSizes.reduce(
    (acc, size) => ({ ...acc, [size]: 0 }),
    {} as ProductionOrder["sizePlan"],
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

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter).map((header) => header.trim());
  const codeIndex = findHeaderIndex(headers, ["Mã đơn", "Ma don", "Order Code", "orderCode"]);
  const quantityIndex = findHeaderIndex(headers, [
    "Số lượng đơn",
    "So luong don",
    "Order Quantity",
    "orderQuantity",
    "Ordered Qty",
    "orderedQty",
  ]);
  const etdIndex = findHeaderIndex(headers, ["ETD", "etd"]);
  const styleIndex = findHeaderIndex(headers, ["Style", "style"]);
  const colorIndex = findHeaderIndex(headers, ["Màu", "Mau", "Color", "color"]);
  const technologyIndex = findHeaderIndex(headers, ["Công nghệ", "Cong nghe", "Technology", "technology"]);
  const safeCodeIndex = codeIndex >= 0 ? codeIndex : 0;
  const safeQuantityIndex = quantityIndex >= 0 ? quantityIndex : 1;
  const safeEtdIndex = etdIndex >= 0 ? etdIndex : 2;
  const safeStyleIndex = styleIndex >= 0 ? styleIndex : 3;
  const safeColorIndex = colorIndex >= 0 ? colorIndex : 4;
  const safeTechnologyIndex = technologyIndex >= 0 ? technologyIndex : 5;

  return lines.slice(1).map((line, rowIndex) => {
    const cells = parseDelimitedLine(line, delimiter);
    const sizePlan = productionSizes.reduce(
      (acc, size) => {
        const directIndex = findSizeHeaderIndex(headers, [size, `Size ${size}`, `${size} đơn`, `${size} don`, `Ordered ${size}`]);
        return { ...acc, [size]: parseNumber(cells[directIndex]) };
      },
      emptySizePlan(),
    );
    const producedPlan = productionSizes.reduce(
      (acc, size) => {
        const directIndex = findSizeHeaderIndex(headers, [
          `${size} làm`,
          `${size} lam`,
          `${size} đã làm`,
          `${size} da lam`,
          `Làm ${size}`,
          `Lam ${size}`,
          `Đã làm ${size}`,
          `Da lam ${size}`,
          `Done ${size}`,
          `Produced ${size}`,
        ]);
        return { ...acc, [size]: parseNumber(cells[directIndex]) };
      },
      emptySizePlan(),
    );
    const deliveryPlan = productionSizes.reduce(
      (acc, size) => {
        const directIndex = findSizeHeaderIndex(headers, [
          `${size} giao`,
          `${size} đã giao`,
          `${size} da giao`,
          `Giao ${size}`,
          `Đã giao ${size}`,
          `Da giao ${size}`,
          `Delivered ${size}`,
          `Shipped ${size}`,
        ]);
        return { ...acc, [size]: parseNumber(cells[directIndex]) };
      },
      emptySizePlan(),
    );
    const sizeTotal = productionSizes.reduce((sum, size) => sum + sizePlan[size], 0);
    const importedOrderQuantity = parseNumber(cells[safeQuantityIndex]);

    return {
      id: `ord-import-${Date.now()}-${rowIndex}`,
      code: cells[safeCodeIndex]?.trim() || `IMPORT-${rowIndex + 1}`,
      orderQuantity: importedOrderQuantity > 0 ? importedOrderQuantity : sizeTotal,
      etd: normalizeDate(cells[safeEtdIndex]?.trim() || todayDateString()),
      style: cells[safeStyleIndex]?.trim() || "",
      color: cells[safeColorIndex]?.trim() || "",
      technology: cells[safeTechnologyIndex]?.trim() || "",
      sizePlan,
      producedPlan,
      deliveryPlan,
    };
  });
}
