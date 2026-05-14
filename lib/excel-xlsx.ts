import * as XLSX from "xlsx";
import { productionSizes } from "@/lib/constants";
import { formatDateDisplay } from "@/lib/date-utils";
import { csvToOrders } from "@/lib/excel-csv";
import type { ProductionOrder } from "@/types/production";

const baseHeaders = ["M\u00e3 \u0111\u01a1n", "S\u1ed1 l\u01b0\u1ee3ng", "ETD", "Style", "M\u00e0u", "C\u00f4ng ngh\u1ec7"];

export function ordersToXlsxBlob(orders: ProductionOrder[]) {
  const orderedHeaders = productionSizes.map((size) => `Size ${size}`);
  const producedHeaders = productionSizes.map((size) => `${size} l\u00e0m`);
  const deliveredHeaders = productionSizes.map((size) => `${size} giao`);
  const headers = [...baseHeaders, ...orderedHeaders, ...producedHeaders, ...deliveredHeaders];
  const rows = orders.map((order) => [
    order.code,
    order.orderQuantity,
    formatDateDisplay(order.etd),
    order.style,
    order.color,
    order.technology,
    ...productionSizes.map((size) => order.sizePlan[size] ?? 0),
    ...productionSizes.map((size) => order.producedPlan?.[size] ?? 0),
    ...productionSizes.map((size) => order.deliveryPlan?.[size] ?? 0),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = headers.map((header) => ({
    wch: Math.max(String(header).length + 2, 12),
  }));

  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Thống kê sản lượng",
    Subject: "Production dashboard export",
    CreatedDate: new Date(),
  };
  XLSX.utils.book_append_sheet(workbook, worksheet, "S\u1ea3n l\u01b0\u1ee3ng");

  const output = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });

  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function xlsxArrayBufferToOrders(data: ArrayBuffer) {
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ",", RS: "\n" });
  return csvToOrders(csv);
}
