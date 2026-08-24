import { getTranslations } from "next-intl/server";
import TermsOfUseClient from "@/components/legal/TermsOfUseClient";
import { CANONICAL_DOMAIN, getSeoAlternates } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const alternates = getSeoAlternates("/terms", locale);

  return {
    metadataBase: new URL(CANONICAL_DOMAIN),
    title: t("termsTitle"),
    description: t("termsDesc"),
    alternates,
    openGraph: {
      title: t("termsOgTitle"),
      description: t("termsOgDesc"),
      url: alternates.canonical,
      type: "website",
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      siteName: "VM Shin Group",
    },
  };
}

export default function TermsOfUsePage() {
  return <TermsOfUseClient />;
}
