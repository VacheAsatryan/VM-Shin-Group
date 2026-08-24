import { getTranslations } from "next-intl/server";
import CookiePolicyClient from "@/components/legal/CookiePolicyClient";
import { CANONICAL_DOMAIN, getSeoAlternates } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const alternates = getSeoAlternates("/cookie-policy", locale);

  return {
    metadataBase: new URL(CANONICAL_DOMAIN),
    title: t("cookiesTitle"),
    description: t("cookiesDesc"),
    alternates,
    openGraph: {
      title: t("cookiesOgTitle"),
      description: t("cookiesOgDesc"),
      url: alternates.canonical,
      type: "website",
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      siteName: "VM Shin Group",
    },
  };
}

export default function CookiePolicyPage() {
  return <CookiePolicyClient />;
}
