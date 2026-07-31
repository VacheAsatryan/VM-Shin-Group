"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CareerApplicationSectionProps {
  applicationEmail: string | null;
  instructions: string | null;
  vacancyTitle: string;
}

export default function CareerApplicationSection({
  applicationEmail,
  instructions,
  vacancyTitle,
}: CareerApplicationSectionProps) {
  const t = useTranslations("publicCareers");
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!applicationEmail) return;
    try {
      await navigator.clipboard.writeText(applicationEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = applicationEmail;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!applicationEmail) {
    return (
      <section className="bg-zinc-900/90 p-6 sm:p-8 rounded-3xl border border-zinc-800 text-center space-y-3 max-w-xl mx-auto shadow-2xl">
        <h3 className="text-[#F5C21B] text-xs font-bold uppercase tracking-wider">
          📩 {t("applyForPosition")}
        </h3>
        {instructions && (
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {instructions}
          </p>
        )}
        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 text-xs text-zinc-400 font-medium">
          🔒 {t("applicationNotAvailable")}
        </div>
      </section>
    );
  }

  const subjectText = `Application for: ${vacancyTitle}`;
  const mailtoUrl = `mailto:${applicationEmail}?subject=${encodeURIComponent(subjectText)}`;

  return (
    <section className="bg-zinc-900/90 p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6 max-w-xl mx-auto shadow-2xl text-center">
      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-100 flex items-center justify-center gap-2">
          <span>📩</span>
          <span>{t("applyForPosition")}</span>
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium">
          {t("sendCvTo")}
        </p>
      </div>

      {/* Primary Email Address Display */}
      <div className="bg-zinc-950 py-3.5 px-6 rounded-2xl border border-zinc-800 inline-block max-w-full">
        <a
          href={mailtoUrl}
          className="text-base sm:text-lg font-mono font-bold text-[#F5C21B] hover:text-[#e0b016] transition-colors select-all break-all"
        >
          {applicationEmail}
        </a>
      </div>

      {/* Instructions if present */}
      {instructions && (
        <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed text-left whitespace-pre-line">
          {instructions}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleCopyEmail}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            copied
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80"
          }`}
        >
          <span>{copied ? "✓" : "📋"}</span>
          <span>{copied ? t("emailCopied") : t("copyEmail")}</span>
        </button>

        <a
          href={mailtoUrl}
          className="w-full py-3 px-4 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#F5C21B]/10 active:scale-[0.99]"
        >
          <span>✉️</span>
          <span>{t("sendCvByEmail")}</span>
        </a>
      </div>
    </section>
  );
}
