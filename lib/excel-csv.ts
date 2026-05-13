import { productionSizes } from "@/lib/constants";
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

export function ordersToCsv(orders: ProductionOrder[]) {
  const headers = [...baseHeaders, ...productionSizes];
  const rows = orders.map((order) => [
    order.code,
    order.orderQuantity,
    order.etd,
    order.style,
    order.color,
    order.technology,
    ...productionSizes.map((size) => order.sizePlan[size]),
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
  const indexOf = (candidates: string[]) =>
    headers.findIndex((header) => candidates.some((candidate) => header.toLowerCase() === candidate.toLowerCase()));

  const codeIndex = indexOf(["Mã đơn", "Ma don", "Order Code", "orderCode"]);
  const quantityIndex = indexOf(["Số lượng đơn", "So luong don", "Order Quantity", "orderQuantity"]);
  const etdIndex = indexOf(["ETD", "etd"]);
  const styleIndex = indexOf(["Style", "style"]);
  const colorIndex = indexOf(["Màu", "Mau", "Color", "color"]);
  const technologyIndex = indexOf(["Công nghệ", "Cong nghe", "Technology", "technology"]);

  return lines.slice(1).map((line, rowIndex) => {
    const cells = parseCsvLine(line);
    const sizePlan = productionSizes.reduce(
      (acc, size) => {
        const directIndex = headers.findIndex((header) => header === size || header === `Size ${size}`);
        return { ...acc, [size]: Math.max(Number(cells[directIndex] ?? 0) || 0, 0) };
      },
      {} as ProductionOrder["sizePlan"],
    );

    return {
      id: `ord-import-${Date.now()}-${rowIndex}`,
      code: cells[codeIndex]?.trim() || `IMPORT-${rowIndex + 1}`,
      orderQuantity: Math.max(Number(cells[quantityIndex] ?? 0) || 0, 0),
      etd: cells[etdIndex]?.trim() || new Date().toISOString().slice(0, 10),
      style: cells[styleIndex]?.trim() || "",
      color: cells[colorIndex]?.trim() || "",
      technology: cells[technologyIndex]?.trim() || "",
      sizePlan,
    };
  });
}
