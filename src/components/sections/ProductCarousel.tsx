"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { PRODUCTS, ProductItem } from "@/config/products";

// ─── Autoplay interval in ms ──────────────────────────────────────────────────
const AUTOPLAY_INTERVAL = 2200;

export default function ProductCarousel() {
  const t = useTranslations("products");
  const prefersReducedMotion = useReducedMotion();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getCardStep = (): number => {
    const first = scrollerRef.current?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 16 : 320; // gap-4 = 16 px
  };

  const scrollBy = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -getCardStep() : getCardStep(),
      behavior: "smooth",
    });
  };

  // ── Scroll boundary detector ─────────────────────────────────────────────────
  const updateBoundaries = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateBoundaries, { passive: true });
    window.addEventListener("resize", updateBoundaries);
    updateBoundaries();
    return () => {
      el.removeEventListener("scroll", updateBoundaries);
      window.removeEventListener("resize", updateBoundaries);
    };
  }, []);

  // ── Autoplay ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion) return;

    autoplayRef.current = setInterval(() => {
      if (isPaused) return;
      const el = scrollerRef.current;
      if (!el) return;

      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: getCardStep(), behavior: "smooth" });
      }
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPaused, prefersReducedMotion]);

  // ── Page-visibility pause ─────────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => setIsPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <section
      id="products"
      className="relative w-full pb-16"
      aria-label={t("title")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Arrow controls — absolute, centred vertically on the strip */}
      <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-20 flex items-center justify-between px-3 sm:px-5">
        <button
          onClick={() => scrollBy("left")}
          disabled={!canScrollLeft}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 border border-primary-yellow/20 flex items-center justify-center text-white disabled:opacity-20 hover:border-primary-yellow/50 hover:text-primary-yellow active:scale-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow backdrop-blur-sm"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          onClick={() => scrollBy("right")}
          disabled={!canScrollRight}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 border border-primary-yellow/20 flex items-center justify-center text-white disabled:opacity-20 hover:border-primary-yellow/50 hover:text-primary-yellow active:scale-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow backdrop-blur-sm"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Scrollable strip — full viewport width, no side padding */}
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
        role="region"
        aria-label="Products list"
      >
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: ProductItem }) {
  const [imageError, setImageError] = useState(false);
  const t = useTranslations("products");

  return (
    <Link
      href={`/products/${product.slug}`}
      className={
        "group relative flex-none " +
        // card width: nearly half-screen on mobile, ~1/3 on tablet, ~1/4 on desktop
        "w-[80vw] sm:w-[45vw] md:w-[32vw] lg:w-[24vw] " +
        "aspect-[3/2] snap-start overflow-hidden " +
        "border border-white/5 hover:border-primary-yellow/25 " +
        "bg-surface transition-all duration-300 " +
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-yellow"
      }
    >
      {/* Gold top shimmer on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-yellow to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

      {/* Image or placeholder */}
      <div className="absolute inset-0 bg-[#111]">
        {!imageError ? (
          <Image
            src={product.image}
            alt={t(`categories.${product.translationKey}`)}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 768px) 45vw, (max-width: 1024px) 32vw, 24vw"
            className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#121212] via-[#161616] to-[#0c0c0c] flex items-center justify-center relative">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px)," +
                  "linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary-yellow/30 group-hover:bg-primary-yellow/5 transition-all">
              <span className="text-primary-yellow font-black text-sm tracking-wide">VM</span>
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

      {/* Card label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-end justify-between">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white group-hover:text-primary-yellow transition-colors truncate">
            {t(`categories.${product.translationKey}`)}
          </h3>
          <span className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5 block group-hover:translate-x-1 transition-transform duration-300">
            {t("viewProduct")} →
          </span>
        </div>

        <div className="ml-3 flex-none w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/60 group-hover:bg-primary-yellow group-hover:border-primary-yellow group-hover:text-black transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
