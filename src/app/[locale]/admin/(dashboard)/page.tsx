import { getTranslations } from "next-intl/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Link } from "@/i18n/routing";

interface AdminDashboardPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminDashboard" });

  const dashboardSections = [
    {
      id: "requests",
      titleKey: "sections.requestsTitle",
      descKey: "sections.requestsDesc",
      href: "/admin/requests",
    },
    {
      id: "documents",
      titleKey: "sections.documentsTitle",
      descKey: "sections.documentsDesc",
      href: "/admin/documents",
    },
    {
      id: "news",
      titleKey: "sections.newsTitle",
      descKey: "sections.newsDesc",
      href: "/admin/news",
    },
    {
      id: "vacancies",
      titleKey: "sections.vacanciesTitle",
      descKey: "sections.vacanciesDesc",
      href: "/admin/vacancies",
    },
    {
      id: "seo",
      titleKey: "sections.seoTitle",
      descKey: "sections.seoDesc",
      href: "/admin/seo",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Industrial Overview Panel */}
      <div className="p-5 rounded-xl bg-[#141414] border border-gold-border/20 relative overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary-yellow/60 to-transparent absolute top-0 left-0 right-0" />
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow" />
            <span className="text-[10px] font-mono font-semibold text-primary-yellow uppercase tracking-wider">
              VM SHIN GROUP
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-text-primary uppercase tracking-tight">
            {t("welcomeBanner")}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            {t("overviewText")}
          </p>
        </div>
      </div>

      {/* Industrial Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardSections.map((sec) => (
          <Link
            key={sec.id}
            href={sec.href}
            className="group p-5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-gold-border/20 hover:border-primary-yellow/40 transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-primary-yellow transition-colors">
                {t(sec.titleKey)}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t(sec.descKey)}
              </p>
            </div>

            <div className="pt-3 border-t border-gold-border/10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-secondary/70 uppercase">
                VM SHIN GROUP
              </span>
              <span className="text-xs text-primary-yellow font-bold group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
