import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { SupportedLocale } from "@/lib/supabase/types";
import SafeImage from "@/components/ui/SafeImage";
import CareerApplicationSection from "@/components/public/CareerApplicationSection";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale as SupportedLocale) || "hy";

  const supabase = await createClient();
  const { data: career } = await supabase
    .from("careers")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!career) {
    return {
      title: "Vacancy Not Found | VM SHIN GROUP",
    };
  }

  const sourceLoc: SupportedLocale = career.source_locale || "hy";

  const getField = (field: "title" | "summary") => {
    const tVal = currentLocale === "ru" ? career.title_ru : currentLocale === "en" ? career.title_en : career.title_hy;
    const sVal = currentLocale === "ru" ? career.summary_ru : currentLocale === "en" ? career.summary_en : career.summary_hy;
    const targetVal = field === "title" ? tVal : sVal;

    if (targetVal && targetVal.trim().length > 0) return targetVal.trim();

    const sTVal = sourceLoc === "ru" ? career.title_ru : sourceLoc === "en" ? career.title_en : career.title_hy;
    const sSVal = sourceLoc === "ru" ? career.summary_ru : sourceLoc === "en" ? career.summary_en : career.summary_hy;
    const sourceVal = field === "title" ? sTVal : sSVal;

    if (sourceVal && sourceVal.trim().length > 0) return sourceVal.trim();

    return field === "title"
      ? career.title_hy || career.title_ru || career.title_en || ""
      : career.summary_hy || career.summary_ru || career.summary_en || "";
  };

  const title = getField("title");
  const description = getField("summary");

  return {
    title: `${title} | VM SHIN GROUP Careers`,
    description,
    openGraph: {
      title: `${title} | VM SHIN GROUP Careers`,
      description,
      images: career.cover_image_url ? [{ url: career.cover_image_url }] : [],
    },
  };
}

export default async function PublicCareerDetailsPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale as SupportedLocale) || "hy";
  const t = await getTranslations({ locale, namespace: "publicCareers" });
  const tAdmin = await getTranslations({ locale, namespace: "adminCareers" });

  const supabase = await createClient();
  const { data: career } = await supabase
    .from("careers")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!career) {
    notFound();
  }

  const sourceLoc: SupportedLocale = career.source_locale || "hy";

  const getCareerField = (field: "title" | "summary" | "content" | "instructions"): string => {
    let tVal: string | null = null;
    if (field === "title") tVal = currentLocale === "ru" ? career.title_ru : currentLocale === "en" ? career.title_en : career.title_hy;
    else if (field === "summary") tVal = currentLocale === "ru" ? career.summary_ru : currentLocale === "en" ? career.summary_en : career.summary_hy;
    else if (field === "instructions") tVal = currentLocale === "ru" ? career.application_instructions_ru : currentLocale === "en" ? career.application_instructions_en : career.application_instructions_hy;
    else tVal = currentLocale === "ru" ? career.content_ru : currentLocale === "en" ? career.content_en : career.content_hy;

    if (tVal && tVal.trim().length > 0) return tVal.trim();

    let sVal: string | null = null;
    if (field === "title") sVal = sourceLoc === "ru" ? career.title_ru : sourceLoc === "en" ? career.title_en : career.title_hy;
    else if (field === "summary") sVal = sourceLoc === "ru" ? career.summary_ru : sourceLoc === "en" ? career.summary_en : career.summary_hy;
    else if (field === "instructions") sVal = sourceLoc === "ru" ? career.application_instructions_ru : sourceLoc === "en" ? career.application_instructions_en : career.application_instructions_hy;
    else sVal = sourceLoc === "ru" ? career.content_ru : sourceLoc === "en" ? career.content_en : career.content_hy;

    if (sVal && sVal.trim().length > 0) return sVal.trim();

    if (field === "title") return career.title_hy || career.title_ru || career.title_en || "";
    if (field === "summary") return career.summary_hy || career.summary_ru || career.summary_en || "";
    if (field === "instructions") return career.application_instructions_hy || career.application_instructions_ru || career.application_instructions_en || "";
    return career.content_hy || career.content_ru || career.content_en || "";
  };

  const title = getCareerField("title");
  const summary = getCareerField("summary");
  const content = getCareerField("content");
  const instructions = getCareerField("instructions") || null;

  const getEmpLabel = (emp: string | null) => {
    if (!emp) return "—";
    if (emp === "full_time") return tAdmin("empFullTime");
    if (emp === "part_time") return tAdmin("empPartTime");
    if (emp === "contract") return tAdmin("empContract");
    return tAdmin("empInternship");
  };

  const formatNumberWithSpace = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const formatSalary = () => {
    if (!career.salary_from && !career.salary_to) return "Negotiable";
    const curr = career.currency || "AMD";
    if (career.salary_from && career.salary_to) {
      return `${formatNumberWithSpace(career.salary_from)} – ${formatNumberWithSpace(career.salary_to)} ${curr}`;
    }
    if (career.salary_from) return `From ${formatNumberWithSpace(career.salary_from)} ${curr}`;
    return `Up to ${formatNumberWithSpace(career.salary_to!)} ${curr}`;
  };

  const paragraphs = content
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <article className="py-12 bg-[#09090b] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href={`/${locale}/careers`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5C21B] hover:text-[#e0b016] transition-colors bg-zinc-900/60 px-3.5 py-2 rounded-xl border border-zinc-800"
          >
            {t("backToCareers")}
          </Link>
        </div>

        {/* Header Title & Summary */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C21B]/10 border border-[#F5C21B]/30 text-[#F5C21B] text-xs font-bold uppercase tracking-wider">
            VM SHIN GROUP CAREERS
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed italic border-l-2 border-[#F5C21B] pl-4 py-1">
            {summary}
          </p>
        </header>

        {/* Cover Image */}
        {career.cover_image_url && (
          <div className="relative w-full h-64 sm:h-96 rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
            <SafeImage
              src={career.cover_image_url}
              alt={title}
              fill
              priority
              className="object-cover"
              fallbackText="VM SHIN GROUP"
            />
          </div>
        )}

        {/* Apply Section Box */}
        <CareerApplicationSection
          applicationEmail={career.application_email}
          instructions={instructions}
          vacancyTitle={title}
        />

        {/* Specs Metadata Grid */}
        <div className="bg-zinc-900/80 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-x-0 sm:divide-x divide-zinc-800/80">
            {/* Location */}
            <div className="space-y-1 sm:px-4">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                {tAdmin("location")}
              </span>
              <p className="text-sm sm:text-base font-bold text-zinc-100">
                {career.location || "Armenia"}
              </p>
            </div>

            {/* Employment */}
            <div className="space-y-1 sm:px-4">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Employment
              </span>
              <p className="text-sm sm:text-base font-bold text-zinc-100">
                {getEmpLabel(career.employment_type)}
              </p>
            </div>

            {/* Department */}
            <div className="space-y-1 sm:px-4">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                {tAdmin("department")}
              </span>
              <p className="text-sm sm:text-base font-bold text-zinc-100">
                {career.department || "—"}
              </p>
            </div>

            {/* Salary */}
            <div className="space-y-1 sm:px-4">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                {tAdmin("salary")}
              </span>
              <p className="text-sm sm:text-base font-bold text-[#F5C21B]">
                {formatSalary()}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body Paragraphs */}
        <div className="bg-zinc-900/60 p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
          <h2 className="text-xs font-bold text-[#F5C21B] border-b border-zinc-800 pb-3 uppercase tracking-wider">
            Job Description & Requirements
          </h2>

          <div className="space-y-4">
            {paragraphs.map((para, index) => (
              <p key={index} className="text-zinc-300 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
