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

export default function DocumentsPage() {
  return <DocumentsPageClient />;
}
