"use client";

import { useTranslations } from "next-intl";
import LegalPageLayout from "./LegalPageLayout";

export default function CookiePolicyClient() {
  const t = useTranslations("cookiePolicy");

  return (
    <LegalPageLayout
      title={t("title")}
      subtitle={t("subtitle")}
      effectiveDate={t("effectiveDate")}
    >
      {/* 1. Definition */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.definition.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.definition.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 2. Technologies Used */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.technologies.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.technologies.intro")}
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2 text-text-secondary">
          <li>{t("sections.technologies.item1")}</li>
          <li>{t("sections.technologies.item2")}</li>
        </ul>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 3. Analytics & Marketing */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.noTracking.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.noTracking.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 4. Management */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.management.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.management.text")}
        </p>
      </section>
    </LegalPageLayout>
  );
}
