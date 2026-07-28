"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "motion/react";
import { LinkButton } from "@/components/ui/Button";

export default function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Monitor scroll to toggle background blurring & height
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock background scroll when mobile drawer is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Focus trap inside mobile menu when active for accessibility
  useEffect(() => {
    if (!mobileMenuOpen || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex="0"]'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleTabTrap);
    firstElement?.focus();

    return () => window.removeEventListener("keydown", handleTabTrap);
  }, [mobileMenuOpen]);

  const navigationItems = [
    { label: t("home"), href: "/#hero" },
    { label: t("products"), href: "/products" },
    { label: t("about"), href: "/#production" },
    { label: t("projects"), href: "/#applications" },
    { label: t("news"), href: "/news" },
    { label: t("contact"), href: "/#contact" },
    { label: t("documents"), href: "/documents" },
  ];

  const languages = [
    { code: "hy", label: "HY" },
    { code: "ru", label: "RU" },
    { code: "en", label: "EN" },
  ] as const;

  const handleLanguageChange = (newLocale: "hy" | "ru" | "en") => {
    const searchParamsStr = typeof window !== "undefined" ? window.location.search : "";
    const hashStr = typeof window !== "undefined" ? window.location.hash : "";
    const targetUrl = `${pathname}${searchParamsStr}${hashStr}`;
    router.replace(targetUrl, { locale: newLocale });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-gold-border/40 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-background/92 backdrop-blur-md border-gold-border/20 py-3.5 sm:py-4"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-nowrap">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group focus-visible:outline-2 focus-visible:outline-primary-yellow rounded"
            aria-label="VM Shin Group Home"
          >
            <Image
              src="/images/logo.png"
              alt="VM Shin Group Logo"
              width={44}
              height={44}
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain transform transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-bold tracking-widest text-sm sm:text-base lg:text-lg text-text-primary uppercase whitespace-nowrap group-hover:text-primary-yellow transition-colors">
              Shin Group
            </span>
          </Link>

          {/* Desktop & Laptop Navigation (Strictly Single Row, No Word Wrapping) */}
          <nav className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-7 flex-nowrap flex-shrink-0">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[12px] xl:text-[13.5px] 2xl:text-sm font-semibold tracking-wide uppercase text-text-secondary hover:text-primary-yellow whitespace-nowrap flex-shrink-0 transition-colors duration-200 py-1.5 rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop & Laptop Right Panel (Language Switcher + CTA) */}
          <div className="hidden lg:flex items-center gap-3 lg:gap-5 flex-shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 lg:gap-1 border-r border-gold-border/30 pr-3 lg:pr-5 flex-shrink-0" role="navigation" aria-label="Language selection">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-1.5 lg:px-2 py-1 text-xs font-bold tracking-wider rounded whitespace-nowrap transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow ${
                    locale === lang.code
                      ? "text-gold-primary bg-gold-primary/10 border border-gold-border/40"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                  aria-label={`Switch language to ${lang.label}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <LinkButton href="#contact" variant="primary" className="flex-shrink-0 whitespace-nowrap text-xs xl:text-sm px-3.5 lg:px-5 py-2">
              {t("cta")}
            </LinkButton>
          </div>

          {/* Mobile & Tablet Right Controls */}
          <div className="flex lg:hidden items-center gap-3 flex-shrink-0">
            {/* Mobile Language Switcher (Compact) */}
            <div className="flex items-center gap-0.5" role="navigation" aria-label="Language selection">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-1.5 py-0.5 text-xs font-bold rounded transition-all whitespace-nowrap ${
                    locale === lang.code
                      ? "text-primary-yellow bg-primary-yellow/15"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Accessible Hamburger Toggler */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-text-secondary hover:text-primary-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow rounded"
              aria-expanded={mobileMenuOpen}
              aria-label="Open navigation menu"
              aria-controls="mobile-menu-drawer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (with AnimatePresence) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-menu-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-surface-elevated border-l border-primary-yellow/10 z-50 p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-gold-border">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/images/logo.png"
                      alt="VM Shin Group Logo"
                      width={36}
                      height={36}
                      className="w-9 h-9 object-contain"
                    />
                    <span className="font-bold text-sm tracking-widest text-text-primary uppercase whitespace-nowrap">
                      Shin Group
                    </span>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-text-secondary hover:text-primary-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow rounded"
                    aria-label="Close navigation menu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-8 flex flex-col gap-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-semibold tracking-wider uppercase text-text-secondary hover:text-primary-yellow py-2 block border-b border-gold-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow rounded-sm whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom CTA in drawer */}
              <div className="mt-auto">
                <LinkButton
                  href="#contact"
                  variant="primary"
                  className="w-full text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("cta")}
                </LinkButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
