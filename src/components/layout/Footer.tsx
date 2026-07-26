"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion, useReducedMotion } from "motion/react";
import { fadeInUp, reducedMotionVariants } from "@/config/animations";

export default function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();

  const itemVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <motion.footer
      id="contact"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={itemVariants}
      className="relative z-20 w-full bg-[#080808] border-t border-white/10 text-text-secondary pt-16 pb-12 overflow-hidden"
      aria-label="Footer"
    >
      {/* Top Subtle Yellow Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-yellow/50 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column A: Company Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group shrink-0 w-fit">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-primary-yellow/40 group-hover:border-primary-yellow transition-colors">
                <Image
                  src="/images/logo.png"
                  alt="VM Shin Group Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider text-text-primary uppercase group-hover:text-primary-yellow transition-colors">
                  VM SHIN GROUP
                </span>
                <span className="text-[10px] font-mono tracking-widest text-primary-yellow uppercase">
                  {t("company.tagline")}
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-text-secondary">
              {t("company.description")}
            </p>

            {/* Social Media Links: Facebook, Instagram, TikTok */}
            <div className="flex items-center gap-3 pt-2" aria-label="Social media links">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/people/VM-Shingroup/61575905849300/?mibextid=wwXIfr&rdid=bYWcHBTvxFAhoQi5&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BWnhaf6pt%2F%3Fmibextid%3DwwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-text-secondary hover:text-primary-yellow hover:border-primary-yellow/50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/vm_shingroup?igsh=dWQxNDdhM2xmNzFk&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-text-secondary hover:text-primary-yellow hover:border-primary-yellow/50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@vm_shingroup?_r=1&_t=ZS-97zsd0xbC2D"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-text-secondary hover:text-primary-yellow hover:border-primary-yellow/50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.55-1.34 1.52-1.35 2.51-.01.99.44 1.98 1.22 2.58.82.64 1.95.82 2.93.53.94-.27 1.73-.99 2.05-1.93.13-.42.19-.87.18-1.31.02-5.18.01-10.37.01-15.55z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column B: Navigation Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
              {t("nav.title")}
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs font-semibold">
              <li>
                <Link href="/" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link href="/#production" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("nav.production")}
                </Link>
              </li>
              <li>
                <Link href="/#applications" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("nav.applications")}
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("nav.calculator")}
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("nav.documents")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column C: Products Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
              {t("products.title")}
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs font-semibold">
              <li>
                <Link href="#calculator" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("products.pemzablok")}
                </Link>
              </li>
              <li>
                <Link href="#calculator" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("products.concreteBlock")}
                </Link>
              </li>
              <li>
                <Link href="#calculator" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("products.concrete")}
                </Link>
              </li>
              <li>
                <Link href="#calculator" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("products.pavingStones")}
                </Link>
              </li>

              <li>
                <Link href="#calculator" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("products.curbstones")}
                </Link>
              </li>
              <li>
                <Link href="#calculator" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
                  {t("products.manholes")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column D: Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
              {t("contact.title")}
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-text-secondary uppercase">{t("contact.addressLabel")}</span>
                <span className="text-text-primary font-semibold">{t("contact.address")}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-text-secondary uppercase">{t("contact.phoneLabel")}</span>
                <a href={`tel:${t("contact.phone").replace(/\s+/g, "")}`} className="text-text-primary font-semibold hover:text-primary-yellow transition-colors w-fit">
                  {t("contact.phone")}
                </a>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-text-secondary uppercase">{t("contact.emailLabel")}</span>
                <a href={`mailto:${t("contact.email")}`} className="text-text-primary font-semibold hover:text-primary-yellow transition-colors w-fit">
                  {t("contact.email")}
                </a>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-text-secondary uppercase">{t("contact.workingHoursLabel")}</span>
                <span className="text-text-primary font-semibold">{t("contact.workingHours")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-secondary">
          <p>
            {t("bottom.copyright", { year: currentYear })}
          </p>

          <div className="flex items-center gap-6">
            <Link href="#privacy" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
              {t("bottom.privacy")}
            </Link>
            <Link href="#terms" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
              {t("bottom.terms")}
            </Link>
            <Link href="#cookies" className="hover:text-primary-yellow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow">
              {t("bottom.cookies")}
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
