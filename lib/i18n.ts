import type { Language } from "@/types/production";

export type TranslationKey =
  | "appTitle"
  | "company"
  | "dashboard"
  | "orders"
  | "entry"
  | "analytics"
  | "reports"
  | "settings"
  | "search"
  | "importExcel"
  | "exportExcel"
  | "selectMonth"
  | "admin"
  | "productionOverview"
  | "mainTable"
  | "productionDays"
  | "addProductionDay"
  | "inputProduction"
  | "totalOrders"
  | "totalOrderQuantity"
  | "completed"
  | "remaining"
  | "completionRate"
  | "dailyOutput"
  | "selectedDay"
  | "dayDetail"
  | "entries"
  | "orderCode"
  | "size"
  | "quantity"
  | "worker"
  | "note"
  | "time"
  | "actions"
  | "addRow"
  | "addOrder"
  | "emptyOrderHint"
  | "bulkEditHint"
  | "edit"
  | "delete"
  | "save"
  | "cancel"
  | "confirm"
  | "confirmDelete"
  | "chooseDay"
  | "chooseOrder"
  | "chooseSize"
  | "enterQuantity"
  | "chartByDay"
  | "chartCompletion"
  | "chartTrend"
  | "stt"
  | "orderQuantity"
  | "etd"
  | "style"
  | "color"
  | "technology"
  | "deliveredTotal"
  | "done"
  | "rate"
  | "total"
  | "noEntries"
  | "saved"
  | "deleted"
  | "dayAdded"
  | "month05";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  vi: {
    appTitle: "Thống kê sản lượng Chinh Thái - Tam Phát",
    company: "Chinh Thái - Tam Phát",
    dashboard: "Tổng quan",
    orders: "Đơn hàng",
    entry: "Nhập sản lượng",
    analytics: "Thống kê",
    reports: "Báo cáo",
    settings: "Cài đặt",
    search: "Tìm mã đơn, style, màu...",
    importExcel: "Import Excel",
    exportExcel: "Export Excel",
    selectMonth: "Chọn tháng",
    admin: "Admin",
    productionOverview: "Tổng quan sản xuất",
    mainTable: "Bảng thống kê sản lượng",
    productionDays: "Ngày sản xuất",
    addProductionDay: "Thêm ngày",
    inputProduction: "Nhập sản lượng",
    totalOrders: "Tổng đơn hàng",
    totalOrderQuantity: "Tổng số lượng",
    completed: "Đã hoàn thành",
    remaining: "Còn lại",
    completionRate: "Tỷ lệ hoàn thành",
    dailyOutput: "Sản lượng ngày",
    selectedDay: "Ngày đang chọn",
    dayDetail: "Chi tiết ngày",
    entries: "Lượt nhập",
    orderCode: "Mã đơn",
    size: "Size",
    quantity: "Số lượng",
    worker: "Công nhân",
    note: "Ghi chú",
    time: "Thời gian",
    actions: "Hành động",
    addRow: "Thêm dòng",
    addOrder: "Thêm đơn hàng",
    emptyOrderHint: "Vui lòng import Excel hoặc thêm đơn hàng mới",
    bulkEditHint: "Thêm, sửa hoặc xoá nhiều dòng trước khi lưu.",
    edit: "Sửa",
    delete: "Xoá",
    save: "Lưu",
    cancel: "Huỷ",
    confirm: "Xác nhận",
    confirmDelete: "Bạn chắc chắn muốn xoá dữ liệu này?",
    chooseDay: "Chọn ngày",
    chooseOrder: "Chọn mã đơn",
    chooseSize: "Chọn size",
    enterQuantity: "Nhập số lượng",
    chartByDay: "Sản lượng theo ngày",
    chartCompletion: "Tỷ lệ hoàn thành",
    chartTrend: "Xu hướng sản lượng",
    stt: "STT",
    orderQuantity: "Số lượng đơn",
    etd: "ETD",
    style: "Style",
    color: "Màu",
    technology: "Công nghệ",
    deliveredTotal: "Đã giao hàng",
    done: "Đã làm",
    rate: "Tỷ lệ",
    total: "Tổng cộng",
    noEntries: "Chưa có dữ liệu",
    saved: "Đã lưu dữ liệu thành công",
    deleted: "Đã xoá dữ liệu",
    dayAdded: "Đã thêm ngày sản xuất",
    month05: "Tháng 05/2026",
  },
  zh: {
    appTitle: "正泰 - 三发产量统计",
    company: "正泰 - 三发",
    dashboard: "总览",
    orders: "订单",
    entry: "录入产量",
    analytics: "统计",
    reports: "报表",
    settings: "设置",
    search: "搜索订单号、款式、颜色...",
    importExcel: "导入 Excel",
    exportExcel: "导出 Excel",
    selectMonth: "选择月份",
    admin: "管理员",
    productionOverview: "生产总览",
    mainTable: "产量统计表",
    productionDays: "生产日期",
    addProductionDay: "新增日期",
    inputProduction: "录入产量",
    totalOrders: "订单总数",
    totalOrderQuantity: "订单总量",
    completed: "已完成",
    remaining: "剩余",
    completionRate: "完成率",
    dailyOutput: "当日产量",
    selectedDay: "当前日期",
    dayDetail: "日期明细",
    entries: "录入记录",
    orderCode: "订单号",
    size: "尺码",
    quantity: "数量",
    worker: "工人",
    note: "备注",
    time: "时间",
    actions: "操作",
    addRow: "新增行",
    addOrder: "新增订单",
    emptyOrderHint: "请导入 Excel 或新增订单",
    bulkEditHint: "保存前可新增、编辑或删除多行。",
    edit: "编辑",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    confirmDelete: "确定要删除这条数据吗？",
    chooseDay: "选择日期",
    chooseOrder: "选择订单",
    chooseSize: "选择尺码",
    enterQuantity: "输入数量",
    chartByDay: "按日产量",
    chartCompletion: "完成率",
    chartTrend: "产量趋势",
    stt: "序号",
    orderQuantity: "订单数量",
    etd: "ETD",
    style: "款式",
    color: "颜色",
    technology: "工艺",
    deliveredTotal: "已交货",
    done: "已做",
    rate: "比例",
    total: "合计",
    noEntries: "暂无数据",
    saved: "数据保存成功",
    deleted: "数据已删除",
    dayAdded: "生产日期已新增",
    month05: "2026年05月",
  },
};

export function t(language: Language, key: TranslationKey) {
  return translations[language][key];
}
