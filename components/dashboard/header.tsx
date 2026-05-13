"use client";

import { Bell, Download, Languages, Search, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/production";

type HeaderProps = {
  language: Language;
  searchQuery: string;
  onLanguageChange: (language: Language) => void;
  onSearchChange: (value: string) => void;
  onImportClick: () => void;
  onExportClick: () => void;
};

export function Header({
  language,
  searchQuery,
  onLanguageChange,
  onSearchChange,
  onImportClick,
  onExportClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-[360px]">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">{t(language, "company")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">{t(language, "appTitle")}</h1>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-10 rounded-lg bg-slate-50 pl-9"
              placeholder={t(language, "search")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 rounded-lg" onClick={onImportClick}>
            <Upload className="h-4 w-4" />
            {t(language, "importExcel")}
          </Button>
          <Button variant="outline" className="h-10 rounded-lg" onClick={onExportClick}>
            <Download className="h-4 w-4" />
            {t(language, "exportExcel")}
          </Button>
          <Button variant="outline" className="h-10 rounded-lg">{t(language, "month05")}</Button>
          <div className="flex h-10 items-center rounded-lg border bg-slate-50 p-1">
            <Languages className="mx-2 h-4 w-4 text-slate-500" />
            <button
              className={`h-7 rounded-md px-3 text-xs font-semibold transition ${language === "vi" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
              onClick={() => onLanguageChange("vi")}
            >
              VI
            </button>
            <button
              className={`h-7 rounded-md px-3 text-xs font-semibold transition ${language === "zh" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
              onClick={() => onLanguageChange("zh")}
            >
              中文
            </button>
          </div>
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <div className="flex h-10 items-center gap-2 rounded-lg border bg-white px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
              <UserRound className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700">{t(language, "admin")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
