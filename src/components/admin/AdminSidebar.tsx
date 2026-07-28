"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import AdminNavigation from "./AdminNavigation";
import AdminProfile from "./AdminProfile";

export default function AdminSidebar() {
  const t = useTranslations("adminNav");

  return (
    <aside
      className="hidden lg:flex w-64 flex-col justify-between border-r border-gold-border/20 bg-[#121212] h-screen fixed top-0 left-0 bottom-0 z-30 p-4"
      aria-label="Desktop Navigation Sidebar"
    >
      {/* Top Brand Header + Navigation */}
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Brand Header */}
        <div className="flex flex-col gap-0.5 pb-3 border-b border-gold-border/20 shrink-0">
          <Link
            href="/"
            className="text-sm font-black tracking-wider text-text-primary uppercase hover:text-primary-yellow transition-colors truncate"
          >
            {t("brandName")}
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary-yellow font-semibold truncate">
            {t("portalTitle")}
          </span>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1">
          <AdminNavigation />
        </div>
      </div>

      {/* Fixed Bottom Profile */}
      <div className="pt-3 border-t border-gold-border/20 shrink-0">
        <AdminProfile />
      </div>
    </aside>
  );
}
