import { getTranslations } from "next-intl/server";
import DocumentsPageClient from "@/components/documents/DocumentsPageClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("documentsTitle"),
    description: t("documentsDesc"),
    openGraph: {
      title: t("documentsOgTitle"),
      description: t("documentsOgDesc"),
      type: "website",
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      siteName: "VM Shin Group",
    },
  };
}

export default async function DocumentsPage() {
  return (
    <main className="flex-1 min-h-screen bg-[#080808] pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-yellow/5 rounded-full blur-[160px] pointer-events-none" 
        aria-hidden="true" 
      />
      <DocumentsPageClient />
    </main>
  );
}
