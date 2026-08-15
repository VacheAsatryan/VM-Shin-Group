"use client";

import { useTranslations } from "next-intl";
import LegalPageLayout from "./LegalPageLayout";

export default function PrivacyPolicyClient() {
  const t = useTranslations("privacyPolicy");

  return (
    <LegalPageLayout
      title={t("title")}
      subtitle={t("subtitle")}
      effectiveDate={t("effectiveDate")}
    >
      {/* 1. General Provisions */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.general.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.general.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 2. Collected Data */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.collectedData.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.collectedData.intro")}
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2 text-text-secondary">
          <li>{t("sections.collectedData.item1")}</li>
          <li>{t("sections.collectedData.item2")}</li>
          <li>{t("sections.collectedData.item3")}</li>
          <li>{t("sections.collectedData.item4")}</li>
          <li>{t("sections.collectedData.item5")}</li>
          <li>{t("sections.collectedData.item6")}</li>
          <li>{t("sections.collectedData.item7")}</li>
        </ul>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 3. Purpose */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.purpose.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.purpose.intro")}
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2 text-text-secondary">
          <li>{t("sections.purpose.item1")}</li>
          <li>{t("sections.purpose.item2")}</li>
          <li>{t("sections.purpose.item3")}</li>
          <li>{t("sections.purpose.item4")}</li>
        </ul>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 4. Storage & Security */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.storage.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.storage.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 5. Third Parties */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.thirdParties.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.thirdParties.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 6. User Rights */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.userRights.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.userRights.text")}
        </p>
      </section>

      <div className="h-px bg-gold-border/20" />

      {/* 7. Updates */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-primary-yellow rounded-full inline-block" />
          {t("sections.updates.title")}
        </h2>
        <p className="text-text-secondary leading-relaxed">
          {t("sections.updates.text")}
        </p>
      </section>
    </LegalPageLayout>
  );
}
