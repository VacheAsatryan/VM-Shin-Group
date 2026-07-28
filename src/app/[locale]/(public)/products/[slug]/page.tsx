import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/config/products";
import { getProductDetail } from "@/config/productDetails";
import ProductDetailView from "@/components/products/ProductDetailView";

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = getProductDetail(slug);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: "products" });
  const productName = t(`categories.${product.translationKey}`);

  return {
    title: `${productName} | VM Shin Group`,
    description: t(`descriptions.${product.translationKey}`),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const productDetail = getProductDetail(slug);

  if (!productDetail) {
    notFound();
  }

  const relatedProducts = PRODUCTS.filter((p) => p.slug !== slug);

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col selection:bg-primary-yellow selection:text-black">
      <ProductDetailView
        productDetail={productDetail}
        relatedProducts={relatedProducts}
      />
    </div>
  );
}
