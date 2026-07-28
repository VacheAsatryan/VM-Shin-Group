import { getTranslations } from "next-intl/server";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { createClient } from "@/lib/supabase/server";
import type { NewsRow, SupportedLocale } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "publicNews" });

  return {
    title: `${t("title")} | VM SHIN GROUP`,
    description: t("subtitle"),
  };
}

export default async function PublicNewsPage({ params }: PageProps) {
  const { locale } = await params;
  const currentLocale = (locale as SupportedLocale) || "hy";
  const t = await getTranslations({ locale, namespace: "publicNews" });

  const nowIso = new Date().toISOString();

  // Query only published news where published_at is NULL or <= NOW (UTC)
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .order("published_at", { ascending: false, nullsFirst: false });

  const newsList: NewsRow[] = articles || [];

  const getLocalizedField = (
    item: NewsRow,
    field: "title" | "excerpt"
  ): string => {
    if (field === "title") {
      if (currentLocale === "ru") return item.title_ru || item.title_hy;
      if (currentLocale === "en") return item.title_en || item.title_hy;
      return item.title_hy;
    } else {
      if (currentLocale === "ru") return item.excerpt_ru || item.excerpt_hy;
      if (currentLocale === "en") return item.excerpt_en || item.excerpt_hy;
      return item.excerpt_hy;
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString(
      currentLocale === "ru" ? "ru-RU" : currentLocale === "en" ? "en-US" : "hy-AM",
      { year: "numeric", month: "long", day: "numeric" }
    );
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

        {/* News Grid */}
        {newsList.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-zinc-800 max-w-md mx-auto">
            <div className="text-5xl mb-4">📰</div>
            <p className="text-zinc-400 text-sm">{t("noArticles")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((item) => {
              const title = getLocalizedField(item, "title");
              const excerpt = getLocalizedField(item, "excerpt");

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
                        <svg
                          className="w-12 h-12 stroke-current opacity-40"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {item.published_at && (
                        <span className="text-xs text-zinc-400 font-medium block">
                          {formatDate(item.published_at)}
                        </span>
                      )}
                      <h2 className="text-xl font-bold text-zinc-100 group-hover:text-[#F5C21B] transition-colors leading-snug line-clamp-2">
                        {title}
                      </h2>
                      <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/60">
                      <Link
                        href={`/${locale}/news/${item.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5C21B] hover:text-[#e0b016] transition-colors"
                      >
                        {t("readMore")} →
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
