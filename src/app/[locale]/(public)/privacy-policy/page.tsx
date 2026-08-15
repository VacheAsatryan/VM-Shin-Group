import { getTranslations } from "next-intl/server";
import PrivacyPolicyClient from "@/components/legal/PrivacyPolicyClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("privacyTitle"),
    description: t("privacyDesc"),
    openGraph: {
      title: t("privacyOgTitle"),
      description: t("privacyOgDesc"),
      type: "website",
      locale: locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US",
      siteName: "VM Shin Group",
    },
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
