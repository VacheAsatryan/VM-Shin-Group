import { getTranslations } from "next-intl/server";
import CookiePolicyClient from "@/components/legal/CookiePolicyClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("cookiesTitle"),
    description: t("cookiesDesc"),
    openGraph: {
      title: t("cookiesOgTitle"),
      description: t("cookiesOgDesc"),
      type: "website",
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      siteName: "VM Shin Group",
    },
  };
}

export default function CookiePolicyPage() {
  return <CookiePolicyClient />;
}
