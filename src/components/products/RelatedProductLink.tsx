"use client";

import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import type { ReactNode } from "react";

interface RelatedProductLinkProps {
  slug: string;
  className?: string;
  children: ReactNode;
}

export default function RelatedProductLink({ slug, className, children }: RelatedProductLinkProps) {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from") || "catalog";

  return (
    <Link href={`/products/${slug}?from=${fromParam}`} className={className}>
      {children}
    </Link>
  );
}
