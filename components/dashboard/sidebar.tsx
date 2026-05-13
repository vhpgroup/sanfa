"use client";

import { BarChart3, ClipboardList, FileText, LayoutDashboard, PenLine, Settings, ShieldCheck } from "lucide-react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Language } from "@/types/production";

type SidebarProps = {
  language: Language;
};

export function Sidebar({ language }: SidebarProps) {
  const navItems = [
    { label: t(language, "dashboard"), icon: LayoutDashboard, active: true },
    { label: t(language, "orders"), icon: ClipboardList },
    { label: t(language, "entry"), icon: PenLine },
    { label: t(language, "analytics"), icon: BarChart3 },
    { label: t(language, "reports"), icon: FileText },
    { label: t(language, "settings"), icon: Settings },
  ];

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col bg-[#0b2551] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-950/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-semibold">{t(language, "company")}</div>
          <div className="text-xs text-blue-100/70">Production ERP</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-blue-100/80 transition-all duration-200 hover:translate-x-1 hover:bg-white/10 hover:text-white",
              item.active && "bg-white text-[#0b2551] shadow-lg shadow-blue-950/20 hover:bg-white hover:text-[#0b2551]",
            )}
          >
            <item.icon className={cn("h-4 w-4 transition", item.active ? "text-blue-700" : "text-blue-100/70 group-hover:text-white")} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="m-4 rounded-xl border border-white/10 bg-white/10 p-4">
        <p className="text-xs text-blue-100/70">Live factory status</p>
        <p className="mt-1 text-sm font-semibold">Online / 5 lines</p>
      </div>
    </aside>
  );
}
