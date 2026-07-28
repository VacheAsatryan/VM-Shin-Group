import { notFound } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { SupportedLocale } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale as SupportedLocale) || "hy";

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!article) {
    return {
      title: "Article Not Found | VM SHIN GROUP",
    };
  }

  let title = article.title_hy;
  let description = article.excerpt_hy;

  if (currentLocale === "ru") {
    title = article.title_ru || article.title_hy;
    description = article.excerpt_ru || article.excerpt_hy;
  } else if (currentLocale === "en") {
    title = article.title_en || article.title_hy;
    description = article.excerpt_en || article.excerpt_hy;
  }

  return {
    title: `${title} | VM SHIN GROUP`,
    description,
    openGraph: {
      title: `${title} | VM SHIN GROUP`,
      description,
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : [],
    },
  };
}

export default async function PublicNewsDetailsPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale as SupportedLocale) || "hy";
  const t = await getTranslations({ locale, namespace: "publicNews" });

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  // Return notFound() if unknown or draft
  if (!article) {
    notFound();
  }

  let title = article.title_hy;
  let excerpt = article.excerpt_hy;
  let content = article.content_hy;

  if (currentLocale === "ru") {
    title = article.title_ru || article.title_hy;
    excerpt = article.excerpt_ru || article.excerpt_hy;
    content = article.content_ru || article.content_hy;
  } else if (currentLocale === "en") {
    title = article.title_en || article.title_hy;
    excerpt = article.excerpt_en || article.excerpt_hy;
    content = article.content_en || article.content_hy;
  }

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString(
      currentLocale === "ru" ? "ru-RU" : currentLocale === "en" ? "en-US" : "hy-AM",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  // Format paragraphs from content text
  const paragraphs = content
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <article className="py-12 bg-[#09090b] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5C21B] hover:text-[#e0b016] transition-colors bg-zinc-900/60 px-3.5 py-2 rounded-xl border border-zinc-800"
          >
            {t("backToNews")}
          </Link>
        </div>

        {/* Header Section */}
        <header className="space-y-4">
          {article.published_at && (
            <div className="text-xs text-zinc-400 font-medium">
              {t("publishedOn")} {formatDate(article.published_at)}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed italic border-l-2 border-[#F5C21B] pl-4 py-1">
            {excerpt}
          </p>
        </header>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="relative w-full h-64 sm:h-96 rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
            <SafeImage
              src={article.cover_image_url}
              alt={title}
              fill
              priority
              className="object-cover"
              fallbackText="VM SHIN GROUP"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="bg-zinc-900/40 p-6 sm:p-10 rounded-3xl border border-zinc-800/80 space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>

        {/* Footer Back Link */}
        <div className="pt-6 border-t border-zinc-800 flex justify-start">
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5C21B] hover:text-[#e0b016] transition-colors"
          >
            {t("backToNews")}
          </Link>
        </div>
      </div>
    </article>
  );
}
