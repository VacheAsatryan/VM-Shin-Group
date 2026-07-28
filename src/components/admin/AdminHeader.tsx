"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { ADMIN_NAV_ITEMS } from "@/config/adminNavigation";
import AdminMobileDrawer from "./AdminMobileDrawer";
import AdminLocaleSwitcher from "./AdminLocaleSwitcher";

export default function AdminHeader() {
  const tNav = useTranslations("adminNav");
  const currentPathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Find active section title from navigation config
  const activeItem = ADMIN_NAV_ITEMS.find((item) =>
    item.href === "/admin"
      ? currentPathname === "/admin" || currentPathname === "/admin/"
      : currentPathname.startsWith(item.href)
  );

  const activeTitle = activeItem ? tNav(activeItem.translationKey) : tNav("dashboard");

  return (
    <>
      <header className="sticky top-0 z-20 w-full h-14 bg-[#121212]/90 backdrop-blur-md border-b border-gold-border/20 px-4 sm:px-6 flex items-center justify-between">
        {/* Left Section: Mobile Menu & Active Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-drawer"
            aria-label={tNav("menuOpen")}
            className="lg:hidden p-1.5 rounded-lg bg-background hover:bg-gold-primary/10 border border-gold-border/40 text-text-secondary hover:text-primary-yellow transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-primary-yellow" />
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-text-primary">
              {activeTitle}
            </h1>
          </div>
        </div>

        {/* Right Section: Single Locale Switcher */}
        <div className="flex items-center gap-3">
          <AdminLocaleSwitcher />
        </div>
      </header>

      {/* Mobile Drawer */}
      <AdminMobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
    </>
  );
}
