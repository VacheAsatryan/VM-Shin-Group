import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/config/products";
import { getProductDetail } from "@/config/productDetails";
import ProductDetailView from "@/components/products/ProductDetailView";
import { routing } from "@/i18n/routing";
import { CANONICAL_DOMAIN, getSeoAlternates, getProductJsonLd, getBreadcrumbJsonLd, getProductOffers } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];

  for (const locale of routing.locales) {
    for (const product of PRODUCTS) {
      params.push({
        locale,
        slug: product.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = getProductDetail(slug);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: "products" });
  const title = t(`productSeo.${slug}.title`);
  const description = t(`productSeo.${slug}.description`);
  const ogTitle = t(`productSeo.${slug}.ogTitle`);
  const ogDescription = t(`productSeo.${slug}.ogDescription`);
  const alternates = getSeoAlternates(`/products/${slug}`, locale);
  const ogLocale = locale === "hy" ? "hy_AM" : locale === "ru" ? "ru_RU" : "en_US";
  const alternateLocales = ["hy_AM", "ru_RU", "en_US"].filter((l) => l !== ogLocale);

  const defaultVariant =
    product.variants.find((v) => v.id === product.defaultVariantId) || product.variants[0];

  const imageUrl = defaultVariant?.image || product.image || "/images/logo.png";

  return {
    metadataBase: new URL(CANONICAL_DOMAIN),
    title,
    description,
    alternates,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: alternates.canonical,
      siteName: "VM Shin Group",
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateLocales,
      images: [
        {
          url: imageUrl.startsWith("http") ? imageUrl : `${CANONICAL_DOMAIN}${imageUrl}`,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const productDetail = getProductDetail(slug);

  if (!productDetail) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "products" });
  const productName = t(`categories.${productDetail.translationKey}`);
  const productDescription = t(`productSeo.${slug}.description`);

  const defaultVariant =
    productDetail.variants.find((v) => v.id === productDetail.defaultVariantId) ||
    productDetail.variants[0];

  const offers = getProductOffers(productDetail, locale);

  // For concrete, prices are not exposed in structured data (confirmed by owner).
  // Emitting a Product schema without offers/review/aggregateRating causes a
  // Google Search Console critical error, so we skip the Product JSON-LD entirely.
  const productJsonLd =
    productDetail.id !== "concrete"
      ? getProductJsonLd({
          name: productName,
          description: productDescription,
          image: defaultVariant?.image || productDetail.image || "/images/logo.png",
          slug,
          locale,
          offers,
        })
      : null;

  const breadcrumbJsonLd = getBreadcrumbJsonLd({
    productName,
    slug,
    locale,
    homeLabel: t("breadcrumbHome"),
    productsLabel: t("breadcrumbProducts"),
  });

  const relatedProducts = PRODUCTS.filter((p) => p.slug !== slug);

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col selection:bg-primary-yellow selection:text-black">
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailView
        productDetail={productDetail}
        relatedProducts={relatedProducts}
      />
    </div>
  );
}
