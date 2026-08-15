"use client";

import { ReactNode } from "react";
import PageBackLink from "@/components/ui/PageBackLink";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  effectiveDate: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  subtitle,
  effectiveDate,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <PageBackLink destination="home" />
        </div>

        {/* Page Header */}
        <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-surface border border-gold-border/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-yellow/10 border border-primary-yellow/20 text-primary-yellow text-xs font-semibold uppercase tracking-wider mb-3">
            VM SHIN GROUP • {effectiveDate}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Document Content */}
        <div className="space-y-8 bg-surface/50 border border-gold-border/30 rounded-2xl p-6 sm:p-10 shadow-lg text-sm sm:text-base text-text-secondary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
