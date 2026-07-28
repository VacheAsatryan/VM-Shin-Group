"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { ADMIN_NAV_ITEMS, type AdminNavItem } from "@/config/adminNavigation";

interface AdminNavigationProps {
  onItemClick?: () => void;
}

export default function AdminNavigation({ onItemClick }: AdminNavigationProps) {
  const t = useTranslations("adminNav");
  const currentPathname = usePathname();

  const renderIcon = (iconName: AdminNavItem["iconName"]) => {
    switch (iconName) {
      case "dashboard":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
          </svg>
        );
      case "requests":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case "documents":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "news":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case "vacancies":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "seo":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  return (
    <nav className="flex flex-col gap-1 w-full" aria-label={t("mobileMenuTitle")}>
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? currentPathname === "/admin" || currentPathname === "/admin/"
            : currentPathname.startsWith(item.href);

        const translatedTitle = t(item.translationKey);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onItemClick}
            aria-current={isActive ? "page" : undefined}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-gold-primary/10 border-l-2 border-primary-yellow text-primary-yellow font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03] border-l-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`transition-colors ${isActive ? "text-primary-yellow" : "text-text-secondary group-hover:text-text-primary"}`}>
                {renderIcon(item.iconName)}
              </span>
              <span className="truncate">{translatedTitle}</span>
            </div>

            {item.isPlaceholder && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-secondary/70 uppercase font-mono tracking-tight shrink-0 ml-2">
                {t("comingSoonTag")}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
