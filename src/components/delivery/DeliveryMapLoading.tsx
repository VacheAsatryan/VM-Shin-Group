"use client";

import { useTranslations } from "next-intl";

export default function DeliveryMapLoading() {
  const t = useTranslations("calculator.delivery");

  return (
    <div className="w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden border border-gold-border/40 bg-surface relative flex flex-col items-center justify-center gap-3 shadow-inner">
      <div className="w-10 h-10 rounded-full border-2 border-primary-yellow/20 border-t-primary-yellow animate-spin flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-primary-yellow" />
      </div>
      <p className="text-xs font-mono text-primary-yellow uppercase tracking-widest animate-pulse">
        {t("routeCalculating")}
      </p>
    </div>
  );
}
