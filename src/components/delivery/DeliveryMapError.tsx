"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface DeliveryMapErrorProps {
  errorMessageKey?: string | null;
  isMissingConfig?: boolean;
  onRetry?: () => void;
}

export default function DeliveryMapError({
  errorMessageKey,
  isMissingConfig = false,
  onRetry,
}: DeliveryMapErrorProps) {
  const t = useTranslations("calculator.delivery");

  const message = isMissingConfig
    ? t("serviceNotConfigured")
    : errorMessageKey
    ? t(errorMessageKey)
    : t("routeBuildFailed");

  return (
    <div className="w-full p-6 sm:p-8 rounded-xl bg-surface/90 border border-gold-border flex flex-col items-center justify-center text-center gap-4 min-h-[220px] shadow-2xl relative overflow-hidden">
      <div className="w-12 h-12 rounded-full bg-primary-yellow/10 border border-gold-border flex items-center justify-center text-primary-yellow text-xl">
        {isMissingConfig ? "🗺️" : "⚠️"}
      </div>

      <div className="flex flex-col gap-1 max-w-md">
        <h4 className="text-sm font-mono font-bold text-text-primary uppercase tracking-wider">
          {isMissingConfig ? t("serviceNotConfiguredTitle") : t("routeSystemError")}
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed font-mono">
          {message}
        </p>
      </div>

      {!isMissingConfig && onRetry && (
        <Button variant="secondary" onClick={onRetry} className="text-xs px-4 py-2">
          {t("retryButton")}
        </Button>
      )}
    </div>
  );
}
