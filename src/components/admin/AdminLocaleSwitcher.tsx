"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function AdminLocaleSwitcher() {
  const t = useTranslations("adminNav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: "hy" | "ru" | "en") => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  const locales: Array<{ code: "hy" | "ru" | "en"; label: string }> = [
    { code: "hy", label: "HY" },
    { code: "ru", label: "RU" },
    { code: "en", label: "EN" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-background/80 border border-gold-border/40">
      <span className="sr-only">{t("switchLanguage")}</span>
      {locales.map((loc) => {
        const isActive = loc.code === locale;
        return (
          <button
            key={loc.code}
            type="button"
            onClick={() => handleLocaleChange(loc.code)}
            aria-label={`Switch to ${loc.label}`}
            className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
              isActive
                ? "bg-gold-primary/20 text-primary-yellow border border-gold-border/60 shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            {loc.label}
          </button>
        );
      })}
    </div>
  );
}
