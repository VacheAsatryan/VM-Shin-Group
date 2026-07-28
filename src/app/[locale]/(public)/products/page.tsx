import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { PRODUCTS } from "@/config/products";
import PageBackLink from "@/components/ui/PageBackLink";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  return {
    title: `${t("title")} | VM Shin Group`,
    description: t("catalogSubtitle"),
  };
}

export default async function ProductsCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col selection:bg-primary-yellow selection:text-black">
      <div className="flex-1 pb-20">
        {/* Breadcrumbs & Hero Header */}
        <section className="relative overflow-hidden border-b border-gold-border/30 bg-surface/50 py-12 md:py-16">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Back Button */}
            <div className="mb-6">
              <PageBackLink destination="home" />
            </div>

            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-xs sm:text-sm text-text-muted mb-6">
              <Link href="/" className="hover:text-primary-yellow transition-colors">
                {t("breadcrumbHome")}
              </Link>
              <span>/</span>
              <span className="text-primary-yellow font-medium">{t("breadcrumbProducts")}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-primary/10 border border-gold-border/40 text-gold-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
                VM SHIN GROUP
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                {t("title")}
              </h1>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                {t("catalogSubtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Product Grid Catalog */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group relative bg-surface border border-gold-border/30 rounded-xl overflow-hidden hover:border-gold-primary/50 hover:shadow-gold-glow/20 transition-all duration-300 flex flex-col"
              >
                {/* Top Gold Shimmer */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-yellow to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                {/* Product Image Container */}
                <div className="relative aspect-[4/3] bg-[#0f0f0f] overflow-hidden p-4">
                  {!product.image.includes("/placeholders/") && (
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover blur-xl opacity-30 scale-110 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                  <Image
                    src={product.image}
                    alt={t(`categories.${product.translationKey}`)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-medium text-primary-yellow border border-primary-yellow/20">
                    {t("inStockFactory")}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-primary-yellow transition-colors mb-2">
                      {t(`categories.${product.translationKey}`)}
                    </h2>
                    <p className="text-sm text-text-muted line-clamp-3 mb-6 leading-relaxed">
                      {t(`descriptions.${product.translationKey}`)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gold-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-muted group-hover:text-white transition-colors">
                      VM SHIN GROUP
                    </span>
                    <Link
                      href={`/products/${product.slug}?from=catalog`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-yellow/10 hover:bg-primary-yellow text-primary-yellow hover:text-black font-semibold text-xs transition-all duration-300"
                    >
                      {t("viewProduct")}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
