"use client";

import { useTranslations } from "next-intl";
import LegalPageLayout from "./LegalPageLayout";

export default function TermsOfUseClient() {
  const t = useTranslations("termsOfUse");

  return (
    <LegalPageLayout
      title={t("title")}
      subtitle={t("subtitle")}
      effectiveDate={t("effectiveDate")}
    >
      {/* 1. Purpose */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.purpose.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.purpose.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 2. Pricing & VAT */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.pricing.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.pricing.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 3. Calculators */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.calculators.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.calculators.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 4. Orders */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.orders.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.orders.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 5. Delivery */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.delivery.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.delivery.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 6. Copyright */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.copyright.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.copyright.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 7. Limitation */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.limitation.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.limitation.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 8. Contacts */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.contacts.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.contacts.text")}
        </p>
      </section>
    </LegalPageLayout>
  );
}
