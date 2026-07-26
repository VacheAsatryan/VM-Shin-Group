"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type PageBackLinkProps = {
  destination?: "home" | "catalog";
  className?: string;
};

function PageBackLinkContent({ destination, className = "" }: PageBackLinkProps) {
  const t = useTranslations("navigation");
  const searchParams = useSearchParams();

  // Resolve target location context
  let resolvedDest: "home" | "catalog" = "catalog"; // catalog is the safe default fallback

  if (destination) {
    resolvedDest = destination;
  } else {
    const fromParam = searchParams.get("from");
    if (fromParam === "home") {
      resolvedDest = "home";
    } else if (fromParam === "catalog") {
      resolvedDest = "catalog";
    }
  }

  const href = resolvedDest === "home" ? "/" : "/products";
  const label = resolvedDest === "home" ? t("backToHome") : t("backToCatalog");

  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-lg border border-gold-border/40 bg-transparent text-sm font-semibold text-text-secondary transition-all duration-300 hover:border-gold-primary hover:text-gold-primary hover:bg-gold-primary/10 hover:shadow-gold-glow/20 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:shadow-none ${className}`}
    >
      <svg
        className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none">
        {label}
      </span>
    </Link>
  );
}

export default function PageBackLink(props: PageBackLinkProps) {
  return (
    <Suspense fallback={<div className="min-h-[44px] w-36 bg-white/5 animate-pulse rounded-lg" />}>
      <PageBackLinkContent {...props} />
    </Suspense>
  );
}
