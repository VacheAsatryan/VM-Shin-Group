import { getTranslations } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import ProductCarousel from "@/components/sections/ProductCarousel";
import ProductionSection from "@/components/sections/ProductionSection";
import ApplicationsSection from "@/components/sections/ApplicationsSection";
import CalculatorSection from "@/components/sections/CalculatorSection";
import HomeTrustSection from "@/components/sections/HomeTrustSection";
import FirefliesBackground from "@/components/ui/FirefliesBackground";
import IndustrialDustParticles from "@/components/ui/IndustrialDustParticles";
import { CANONICAL_DOMAIN, getSeoAlternates, getHomepageJsonLd } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const alternates = getSeoAlternates("", locale);
  const ogLocale = locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US";
  const alternateLocales = ["hy_AM", "ru_RU", "en_US"].filter((l) => l !== ogLocale);

  return {
    metadataBase: new URL(CANONICAL_DOMAIN),
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: alternates.canonical,
      siteName: "VM Shin Group",
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateLocales,
      images: [
        {
          url: `${CANONICAL_DOMAIN}/images/logo.png`,
          width: 800,
          height: 600,
          alt: "VM Shin Group Logo",
        },
      ],
    },
  };
}

export default function HomePage() {
  const jsonLd = getHomepageJsonLd();

  return (
    <div className="flex-1 flex flex-col relative" style={{ background: "#080808" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Layer 1: Animated yellow lines & laser sweeps ──────────────── */}
      <div className="yellow-lines-bg" aria-hidden="true">
        <div className="yellow-lines-layer2" />
      </div>

      {/* ── Layer 2: Industrial warm factory dust particles (Canvas RAF) ─ */}
      <IndustrialDustParticles />

      {/* ── Layer 3: Glowing yellow fireflies ──────────────────────────── */}
      <FirefliesBackground />

      {/* ── Layer 4: Dark blur glass overlay ───────────────────────────── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(245,184,0,0.15) 0%, rgba(8,8,8,0.75) 80%)",
        }}
        aria-hidden="true"
      />

      {/* ── Content (Hero + Carousel + Why Choose Us + Applications + Calculator) ── */}
      <div className="relative z-10">
        <Hero />
        <ProductCarousel />
        <ProductionSection />
        <ApplicationsSection />
        <CalculatorSection />
        <HomeTrustSection />
      </div>
    </div>
  );
}
