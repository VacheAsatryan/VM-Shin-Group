"use client";

import { useTranslations } from "next-intl";

interface VatIncludedNoteProps {
  className?: string;
  namespace?: "products" | "calculator" | "orderModal";
}

export default function VatIncludedNote({
  className = "text-[10px] sm:text-xs text-text-muted font-normal block mt-1",
  namespace = "products",
}: VatIncludedNoteProps) {
  const t = useTranslations(namespace);
  return (
    <span className={className}>
      {t("vatIncluded")}
    </span>
  );
}
