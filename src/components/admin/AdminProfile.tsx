"use client";

import { useTranslations, useLocale } from "next-intl";
import { logoutAdminAction } from "@/app/[locale]/admin/login/actions";

export default function AdminProfile() {
  const t = useTranslations("adminNav");
  const locale = useLocale();

  const handleLogout = logoutAdminAction.bind(null, locale);

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#0a0a0a] border border-gold-border/20 w-full">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-md bg-gold-primary/10 border border-gold-border/40 flex items-center justify-center text-primary-yellow shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-text-primary truncate">
            {t("adminRoleLabel")}
          </span>
          <span className="text-[10px] text-text-secondary font-mono truncate">
            {t("brandName")}
          </span>
        </div>
      </div>

      <form action={handleLogout} className="shrink-0">
        <button
          type="submit"
          title={t("logout")}
          aria-label={t("logout")}
          className="p-1.5 rounded-md bg-red-950/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 hover:text-red-200 transition-all flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </form>
    </div>
  );
}
