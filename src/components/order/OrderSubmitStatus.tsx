"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface OrderSuccessStateProps {
  onClose: () => void;
}

export function OrderSuccessState({ onClose }: OrderSuccessStateProps) {
  const t = useTranslations("orderModal.success");

  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8 gap-5 animate-in fade-in zoom-in duration-300">
      {/* Gold Checkmark Badge */}
      <div className="w-16 h-16 rounded-full bg-gold-primary/10 border-2 border-primary-yellow flex items-center justify-center shadow-2xl shadow-primary-yellow/20">
        <span className="text-3xl text-primary-yellow">✓</span>
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary uppercase tracking-tight">
          {t("title")}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t("message")}
        </p>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onClose}
        className="w-full max-w-xs mt-2 text-center"
      >
        {t("closeButton")}
      </Button>
    </div>
  );
}

interface OrderErrorNoticeProps {
  onRetry: () => void;
  onCancel: () => void;
}

export function OrderErrorNotice({ onRetry }: OrderErrorNoticeProps) {
  const t = useTranslations("orderModal.error");

  return (
    <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex flex-col gap-3 text-xs">
      <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
        <span>⚠️</span>
        <span>{t("title")}</span>
      </div>
      <p className="text-text-secondary leading-relaxed">
        {t("message")}
      </p>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/60 text-red-300 font-mono text-xs font-semibold transition-all"
        >
          🔄 {t("retryButton")}
        </button>
      </div>
    </div>
  );
}
