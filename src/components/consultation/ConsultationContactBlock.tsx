"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "@/config/company";
import ConsultationModal from "@/components/consultation/ConsultationModal";
import type { LocaleCode } from "@/lib/order/order.types";

interface ConsultationContactBlockProps {
  className?: string;
  onOpenConsultationModal?: () => void;
}

export default function ConsultationContactBlock({
  className = "",
  onOpenConsultationModal,
}: ConsultationContactBlockProps) {
  const t = useTranslations("calculator.consultationBlock");
  const locale = (useLocale() as LocaleCode) || "hy";
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (onOpenConsultationModal) {
      onOpenConsultationModal();
    } else {
      setInternalModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`p-4 rounded-xl bg-surface/90 border border-gold-border/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-yellow/10 border border-primary-yellow/30 flex items-center justify-center text-primary-yellow shrink-0 mt-0.5 sm:mt-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-bold text-white tracking-wide">{t("title")}</h4>
            <p className="text-xs text-text-muted leading-relaxed max-w-md">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gold-border/20">
          {/* Direct Clickable Tel Call Link */}
          <a
            href={COMPANY_PHONE_TEL}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-yellow text-black font-bold text-xs sm:text-sm hover:bg-primary-yellow-hover transition-all shadow-md shadow-primary-yellow/10 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{COMPANY_PHONE_DISPLAY}</span>
          </a>

          {/* Request Consultation Action Trigger */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-surface border border-gold-border/50 hover:border-gold-primary text-text-secondary hover:text-white font-semibold text-xs transition-all cursor-pointer shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{t("requestAction")}</span>
          </button>
        </div>
      </div>

      {/* Internal Consultation Modal fallback */}
      {!onOpenConsultationModal && (
        <ConsultationModal
          isOpen={internalModalOpen}
          onClose={() => setInternalModalOpen(false)}
          locale={locale}
        />
      )}
    </>
  );
}
