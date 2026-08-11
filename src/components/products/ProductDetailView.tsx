"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@/i18n/routing";
import RelatedProductLink from "./RelatedProductLink";
import type { ProductDetailData, ProductVariant, PavingStoneSizeOption, PavingStoneColorOption } from "@/config/productDetails";
import VariantGallery from "@/components/products/VariantGallery";
import PageBackLink from "@/components/ui/PageBackLink";
import CalculatorSection from "@/components/sections/CalculatorSection";
import type { ProductCategoryType } from "@/lib/calculator/calculator.types";

interface ProductDetailViewProps {
  productDetail: ProductDetailData;
  relatedProducts: Array<{
    id: string;
    slug: string;
    translationKey: string;
    image: string;
  }>;
}

export default function ProductDetailView({
  productDetail,
  relatedProducts,
}: ProductDetailViewProps) {
  const t = useTranslations("products");

  // Initial variant selection state
  const defaultVariant =
    productDetail.variants.find((v) => v.id === productDetail.defaultVariantId) ||
    productDetail.variants[0];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);
  const [mainImageSrc, setMainImageSrc] = useState<string>(selectedVariant.image);

  // Paving stone size & color selection states
  const [selectedSize, setSelectedSize] = useState<PavingStoneSizeOption | undefined>(
    defaultVariant.availableSizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<PavingStoneColorOption | undefined>(
    defaultVariant.availableColors?.[0]
  );

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setMainImageSrc(variant.image);
    if (variant.availableSizes && variant.availableSizes.length > 0) {
      setSelectedSize(variant.availableSizes[0]);
    }
    if (variant.availableColors && variant.availableColors.length > 0) {
      setSelectedColor(variant.availableColors[0]);
    }
  };

  const finalPrice = selectedVariant.price.amount;
  const productName = t(`categories.${productDetail.translationKey}`);
  const variantTitle = selectedVariant.titleKey
    ? t(selectedVariant.titleKey)
    : `${productName} ${selectedVariant.sizeLabel}`;

  const currentSizeLabel = selectedSize ? selectedSize.display : selectedVariant.sizeLabel;

  return (
    <div className="flex-1 pt-28 pb-20">
      {/* Breadcrumb Navigation & Top Hero */}
      <section className="relative border-b border-gold-border/30 bg-surface/30 py-8 md:py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <PageBackLink />
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-text-muted mb-8 mt-6">
            <Link href="/" className="hover:text-primary-yellow transition-colors">
              {t("breadcrumbHome")}
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary-yellow transition-colors">
              {t("breadcrumbProducts")}
            </Link>
            <span>/</span>
            <span className="text-primary-yellow font-medium">{productName}</span>
          </nav>

          {/* Hero Main Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Media & Variant Gallery (5 cols on LG) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Large Image Box */}
              <div className="relative aspect-square rounded-2xl bg-[#0f0f0f] border border-gold-border/40 hover:border-gold-primary/50 transition-colors overflow-hidden p-6 shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedVariant.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 p-6 flex items-center justify-center"
                  >
                    <Image
                      src={mainImageSrc}
                      alt={variantTitle}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500 z-10"
                      onError={() => setMainImageSrc(selectedVariant.fallbackImage)}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Stock & Badge */}
                <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-primary-yellow border border-primary-yellow/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-yellow animate-pulse" />
                  {t(selectedVariant.badgeKey || "inStockFactory")}
                </div>
              </div>

              {/* Horizontal Variant Gallery Component */}
              <VariantGallery
                variants={productDetail.variants}
                selectedVariantId={selectedVariant.id}
                onSelectVariant={handleVariantSelect}
              />

            </div>

            {/* Right Column: Dynamic Variant Information & Pricing (7 cols on LG) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-yellow/10 border border-primary-yellow/20 text-primary-yellow text-xs font-semibold uppercase tracking-wider mb-3 w-fit">
                VM SHIN GROUP • {t("selectedVariant")}
              </div>

              {/* Dynamic Title with Framer Motion fade */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedVariant.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2 leading-tight">
                    {variantTitle}
                  </h1>

                  <div className="text-sm font-semibold text-primary-yellow/90 mb-4">
                    {t(selectedVariant.subtitleKey)}
                  </div>

                  {/* Price Banner */}
                  <div className="flex flex-col gap-1.5 mb-6 p-4 rounded-xl bg-surface border border-gold-border/40 max-w-xl">
                    {selectedVariant.priceStatus === "to_be_confirmed" ? (
                      <span className="text-xl sm:text-2xl font-black text-primary-yellow">
                        {t("priceStatusToBeConfirmed")}
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-4">
                        <span className="text-3xl font-black text-primary-yellow">
                          {finalPrice.toLocaleString()} {t(selectedVariant.price.unitKey)}
                        </span>
                        <span className="text-xs text-text-muted">
                          {currentSizeLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-base sm:text-lg text-text-muted leading-relaxed mb-6">
                    {t(selectedVariant.descriptionKey)}
                  </p>

                  {/* Size Selector for Paving Stones */}
                  {selectedVariant.availableSizes && selectedVariant.availableSizes.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                        {t("selectSize")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {selectedVariant.availableSizes.map((sizeOpt) => {
                          const isSizeActive = selectedSize?.id === sizeOpt.id;
                          return (
                            <button
                              key={sizeOpt.id}
                              type="button"
                              onClick={() => setSelectedSize(sizeOpt)}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                isSizeActive
                                  ? "bg-surface border-gold-primary text-primary-yellow shadow-gold-glow/20 ring-1 ring-gold-primary/50"
                                  : "bg-surface/50 border-gold-border/40 text-white hover:border-gold-primary/50 hover:bg-surface"
                              }`}
                            >
                              <span>{sizeOpt.display}</span>
                              {isSizeActive && (
                                <span className="w-4 h-4 rounded-full bg-primary-yellow text-black flex items-center justify-center text-[10px] ml-1 flex-none">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Color Selector for Paving Stones */}
                  {selectedVariant.availableColors && selectedVariant.availableColors.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                        {t("selectColor")}
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {selectedVariant.availableColors.map((colorOpt) => {
                          const isColorActive = selectedColor?.id === colorOpt.id;
                          return (
                            <button
                              key={colorOpt.id}
                              type="button"
                              onClick={() => setSelectedColor(colorOpt)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                isColorActive
                                  ? "bg-surface border-gold-primary text-white shadow-gold-glow/20 ring-1 ring-gold-primary/50"
                                  : "bg-surface/50 border-gold-border/40 text-text-muted hover:text-white hover:border-gold-primary/40 hover:bg-surface"
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-white/20 shadow-inner flex-none"
                                style={{ background: colorOpt.hex }}
                              />
                              <span>{t(colorOpt.nameKey) || colorOpt.id}</span>
                              {isColorActive && (
                                <span className="w-3.5 h-3.5 rounded-full bg-primary-yellow text-black flex items-center justify-center text-[9px] font-bold flex-none">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Key Variant Spec Pills (Hidden for Paving Stones per UI requirements) */}
              {productDetail.id !== "paving-stones" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-surface/80 border border-gold-border/30">
                    <div className="text-[11px] font-medium text-text-muted mb-0.5">
                      {t("specs.dimensions")}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {currentSizeLabel}
                    </div>
                  </div>

                  {Boolean(selectedVariant.weightKg && selectedVariant.weightKg > 0) && (
                    <div className="p-3 rounded-xl bg-surface/80 border border-gold-border/30">
                      <div className="text-[11px] font-medium text-text-muted mb-0.5">
                        {t("weightLabel")}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white">
                        {`${selectedVariant.weightKg} kg`}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="#calculator-section"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary-yellow hover:bg-primary-yellow-hover text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(255,215,0,0.25)] hover:shadow-[0_0_35px_rgba(255,215,0,0.4)]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t("calculateCta")} ({currentSizeLabel})
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface border border-gold-border/50 hover:border-gold-primary hover:text-gold-text text-white font-semibold text-sm transition-all hover:bg-surface-hover"
                >
                  {t("consultationCta")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Technical Specifications Table (Hidden for Paving Stones) */}
      {productDetail.id !== "paving-stones" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-7 bg-primary-yellow rounded-full inline-block" />
              {t("specsTitle")} — {selectedVariant.sizeLabel}
            </h2>
          </div>

          <div className="bg-surface border border-gold-border/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-gold-border/20">
              {selectedVariant.specs.map((spec, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors ${
                    idx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                  } hover:bg-white/[0.03]`}
                >
                  <div className="sm:col-span-5 text-sm font-semibold text-text-muted flex items-center">
                    {t(`specs.${spec.labelKey}`)}
                  </div>
                  <div className="sm:col-span-7 text-sm font-bold text-white mt-1 sm:mt-0 flex items-center">
                    {spec.valueRaw}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Key Features & Advantages Grid */}
      {productDetail.features && productDetail.features.length > 0 && (
        <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 ${
          productDetail.id !== "paving-stones" ? "border-t border-gold-border/30" : ""
        }`}>
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-7 bg-primary-yellow rounded-full inline-block" />
              {t("featuresTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productDetail.features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-surface border border-gold-border/30 hover:border-gold-primary/50 hover:shadow-gold-glow/20 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-yellow/10 border border-primary-yellow/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <FeatureIcon icon={feature.icon} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-yellow transition-colors">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Applications / Scope of Use */}
      {productDetail.applicationKeys && productDetail.applicationKeys.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-gold-border/30">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-7 bg-primary-yellow rounded-full inline-block" />
              {t("applicationsTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productDetail.applicationKeys.map((appKey, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-surface/60 border border-gold-border/30 flex items-center gap-3 hover:border-gold-primary/40 transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-primary-yellow shrink-0" />
                <span className="text-sm font-semibold text-white">
                  {t(appKey)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Integrated Quick Estimator Section synchronized with selectedVariant */}
      <section id="calculator-section" className="scroll-mt-28 py-12">
        <CalculatorSection
          initialProductCategory={
            (productDetail.calculatorProductId as ProductCategoryType) || "pemzablok"
          }
          initialVariantId={selectedVariant.calculatorConfig.calculatorVariantId}
        />
      </section>

      {/* Related Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-gold-border/30">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-7 bg-primary-yellow rounded-full inline-block" />
            {t("relatedTitle")}
          </h2>

          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-primary-yellow hover:underline flex items-center gap-1"
          >
            {t("breadcrumbProducts")} →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.slice(0, 4).map((relProduct) => (
            <Suspense
              key={relProduct.id}
              fallback={
                <div
                  className="bg-surface border border-gold-border/30 rounded-xl overflow-hidden p-4 flex flex-col cursor-default"
                >
                  <div className="relative aspect-video bg-[#0f0f0f] rounded-lg overflow-hidden mb-3">
                    <Image
                      src={relProduct.image}
                      alt={t(`categories.${relProduct.translationKey}`)}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-contain p-2 transition-transform"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-white transition-colors">
                    {t(`categories.${relProduct.translationKey}`)}
                  </h3>
                </div>
              }
            >
              <RelatedProductLink
                slug={relProduct.slug}
                className="group bg-surface border border-gold-border/30 rounded-xl overflow-hidden hover:border-gold-primary/50 hover:shadow-gold-glow/20 transition-all p-4 flex flex-col"
              >
                <div className="relative aspect-video bg-[#0f0f0f] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={relProduct.image}
                    alt={t(`categories.${relProduct.translationKey}`)}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-primary-yellow transition-colors">
                  {t(`categories.${relProduct.translationKey}`)}
                </h3>
              </RelatedProductLink>
            </Suspense>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeatureIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "eco":
      return (
        <svg className="w-6 h-6 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "shield":
      return (
        <svg className="w-6 h-6 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "flame":
      return (
        <svg className="w-6 h-6 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      );
    case "ruler":
      return (
        <svg className="w-6 h-6 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case "layers":
      return (
        <svg className="w-6 h-6 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case "coins":
      return (
        <svg className="w-6 h-6 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 text-primary-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
}
