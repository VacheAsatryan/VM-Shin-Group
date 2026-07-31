import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CareerRow, SupportedLocale } from "@/lib/supabase/types";
import SafeImage from "@/components/ui/SafeImage";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "publicCareers" });

  return {
    title: `${t("title")} | VM SHIN GROUP`,
    description: t("subtitle"),
  };
}

export default async function PublicCareersPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = (locale as SupportedLocale) || "hy";
  const t = await getTranslations({ locale, namespace: "publicCareers" });
  const tAdmin = await getTranslations({ locale, namespace: "adminCareers" });

  const supabase = await createClient();
  const { data: careers } = await supabase
    .from("careers")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const vacanciesList: CareerRow[] = careers || [];

  const getLocalizedField = (
    item: CareerRow,
    field: "title" | "summary"
  ): string => {
    const sourceLoc = item.source_locale || "hy";

    const targetVal =
      field === "title"
        ? currentLocale === "ru" ? item.title_ru : currentLocale === "en" ? item.title_en : item.title_hy
        : currentLocale === "ru" ? item.summary_ru : currentLocale === "en" ? item.summary_en : item.summary_hy;

    if (targetVal && targetVal.trim().length > 0) {
      return targetVal.trim();
    }

    const sourceVal =
      field === "title"
        ? sourceLoc === "ru" ? item.title_ru : sourceLoc === "en" ? item.title_en : item.title_hy
        : sourceLoc === "ru" ? item.summary_ru : sourceLoc === "en" ? item.summary_en : item.summary_hy;

    if (sourceVal && sourceVal.trim().length > 0) {
      return sourceVal.trim();
    }

    return field === "title"
      ? item.title_hy || item.title_ru || item.title_en || ""
      : item.summary_hy || item.summary_ru || item.summary_en || "";
  };

  const getEmpLabel = (emp: string | null) => {
    if (!emp) return "";
    if (emp === "full_time") return tAdmin("empFullTime");
    if (emp === "part_time") return tAdmin("empPartTime");
    if (emp === "contract") return tAdmin("empContract");
    return tAdmin("empInternship");
  };

  return (
    <div className="py-12 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5C21B]/10 border border-[#F5C21B]/30 text-[#F5C21B] text-xs font-bold uppercase tracking-widest">
            VM SHIN GROUP
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Vacancies Grid */}
        {vacanciesList.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-zinc-800 max-w-md mx-auto">
            <div className="text-5xl mb-4">💼</div>
            <p className="text-zinc-400 text-sm">{t("noVacancies")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vacanciesList.map((item) => {
              const title = getLocalizedField(item, "title");
              const summary = getLocalizedField(item, "summary");
              const empLabel = getEmpLabel(item.employment_type);

              return (
                <article
                  key={item.id}
                  className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl hover:border-zinc-700 hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  {/* Cover Image */}
                  <div className="h-48 relative bg-zinc-950 border-b border-zinc-800/60 overflow-hidden">
                    {item.cover_image_url ? (
                      <SafeImage
                        src={item.cover_image_url}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        fallbackText="VM SHIN GROUP"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-700">
                        <span className="text-4xl opacity-30">💼</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {item.department && (
                          <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                            {item.department}
                          </span>
                        )}
                        {item.location && (
                          <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 text-zinc-400">
                            📍 {item.location}
                          </span>
                        )}
                        {empLabel && (
                          <span className="px-2.5 py-1 rounded-md bg-[#F5C21B]/10 border border-[#F5C21B]/30 text-[#F5C21B] font-semibold">
                            {empLabel}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-zinc-100 group-hover:text-[#F5C21B] transition-colors line-clamp-2">
                        <Link href={`/${locale}/careers/${item.slug}`}>
                          {title}
                        </Link>
                      </h2>

                      {/* Summary */}
                      <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    {/* Card Footer Link */}
                    <div className="pt-3 border-t border-zinc-800/60">
                      <Link
                        href={`/${locale}/careers/${item.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5C21B] hover:text-[#e0b016] transition-colors"
                      >
                        <span>View Vacancy Details</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
