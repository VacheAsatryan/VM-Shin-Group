import { getTranslations } from "next-intl/server";
import TermsOfUseClient from "@/components/legal/TermsOfUseClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("termsTitle"),
    description: t("termsDesc"),
    openGraph: {
      title: t("termsOgTitle"),
      description: t("termsOgDesc"),
      type: "website",
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      siteName: "VM Shin Group",
    },
  };
}

export default function TermsOfUsePage() {
  return <TermsOfUseClient />;
}
