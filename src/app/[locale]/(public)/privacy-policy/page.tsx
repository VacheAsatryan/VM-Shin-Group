import { getTranslations } from "next-intl/server";
import PrivacyPolicyClient from "@/components/legal/PrivacyPolicyClient";
import { CANONICAL_DOMAIN, getSeoAlternates } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const alternates = getSeoAlternates("/privacy-policy", locale);

  return {
    metadataBase: new URL(CANONICAL_DOMAIN),
    title: t("privacyTitle"),
    description: t("privacyDesc"),
    alternates,
    openGraph: {
      title: t("privacyOgTitle"),
      description: t("privacyOgDesc"),
      url: alternates.canonical,
      type: "website",
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      siteName: "VM Shin Group",
    },
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
