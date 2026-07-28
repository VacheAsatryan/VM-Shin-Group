"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import AdminNavigation from "./AdminNavigation";
import AdminProfile from "./AdminProfile";

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminMobileDrawer({ isOpen, onClose }: AdminMobileDrawerProps) {
  const t = useTranslations("adminNav");
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-drawer-title"
      className="fixed inset-0 z-50 lg:hidden flex"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        className="relative w-4/5 max-w-xs bg-[#121212] border-r border-gold-border/30 h-full flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-250 shadow-2xl"
      >
        <div className="flex flex-col gap-5 flex-1 min-h-0">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gold-border/20 shrink-0">
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase text-text-primary">
                {t("brandName")}
              </span>
              <span id="mobile-drawer-title" className="text-[10px] font-mono text-primary-yellow font-semibold uppercase">
                {t("portalTitle")}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t("menuClose")}
              className="p-1 rounded-md bg-background hover:bg-gold-primary/10 border border-gold-border/40 text-text-secondary hover:text-primary-yellow text-xs transition-all"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto pr-1">
            <AdminNavigation onItemClick={onClose} />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-3 border-t border-gold-border/20 shrink-0">
          <AdminProfile />
        </div>
      </div>
    </div>
  );
}
