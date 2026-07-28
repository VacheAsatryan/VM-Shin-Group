import { getTranslations } from "next-intl/server";
import AdminPageHeader from "./AdminPageHeader";
import { Link } from "@/i18n/routing";

interface AdminSectionPlaceholderProps {
  sectionKey: string;
  icon: string;
  locale: string;
}

export default async function AdminSectionPlaceholder({
  sectionKey,
  locale,
}: AdminSectionPlaceholderProps) {
  const tNav = await getTranslations({ locale, namespace: "adminNav" });
  const tDash = await getTranslations({ locale, namespace: "adminDashboard" });

  const sectionTitle = tNav(sectionKey);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={sectionTitle}
        subtitle={tDash("placeholderPage.badge")}
      />

      <div className="p-8 sm:p-12 rounded-xl bg-[#141414] border border-gold-border/20 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary-yellow/60 to-transparent absolute top-0 left-0 right-0" />

        <div className="flex flex-col gap-2 max-w-md">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-gold-primary/10 text-primary-yellow border border-gold-border/30 mx-auto">
            {tDash("placeholderPage.badge")}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-text-primary uppercase tracking-tight">
            {tDash("placeholderPage.title", { section: sectionTitle })}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {tDash("placeholderPage.description")}
          </p>
        </div>

        <Link
          href="/admin"
          className="mt-2 px-3.5 py-1.5 rounded-lg bg-background hover:bg-gold-primary/10 border border-gold-border/30 text-xs font-medium text-text-primary hover:text-primary-yellow transition-all"
        >
          ← {tDash("placeholderPage.backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
