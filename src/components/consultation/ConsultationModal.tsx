"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { validateCustomer, type CustomerValidationErrors } from "@/lib/order/order.schema";
import { Button } from "@/components/ui/Button";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  locale = "hy",
}: ConsultationModalProps) {
  const t = useTranslations("consultationModal");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<CustomerValidationErrors>({});
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleCloseModal = useCallback(() => {
    setIsSuccess(false);
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  // Lock body scroll and set up focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector<HTMLInputElement>("input:not([type='hidden'])");
        if (firstInput) {
          firstInput.focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = "";
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, handleCloseModal]);

  const validate = () => {
    const { isValid, errors: validationErrors } = validateCustomer({
      name,
      phone,
      email,
      comment: message,
    });
    setErrors(validationErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      locale,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      message: message.trim() || undefined,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      honeypot,
    };

    try {
      const response = await fetch("/api/consultation-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setName("");
        setPhone("");
        setEmail("");
        setMessage("");
        setErrors({});
      } else {
        setSubmitError(data.message || t("errorMessage"));
      }
    } catch {
      setSubmitError(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleCloseModal();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-surface border border-gold-border rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
        style={{ maxHeight: "90vh" }}
      >
        {/* Top Accent Line */}
        <div
          className="h-1 w-full bg-gradient-to-r from-transparent via-primary-yellow to-transparent"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gold-border/30 bg-surface-light/40">
          <div>
            <h2 id="consultation-modal-title" className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              {t("title")}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isSubmitting}
            aria-label={t("closeAriaLabel")}
            className="text-text-muted hover:text-text-primary hover:bg-white/10 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary-yellow/10 border border-primary-yellow text-primary-yellow mx-auto flex items-center justify-center text-3xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("successTitle")}
              </h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                {t("successMessage")}
              </p>
              <div className="pt-4">
                <Button type="button" onClick={handleCloseModal} className="w-full sm:w-auto px-8">
                  {t("closeAriaLabel")}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_url_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Name (Required) */}
              <div className="space-y-1.5">
                <label htmlFor="consultation-name" className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t("nameLabel")} <span className="text-primary-yellow">*</span>
                </label>
                <input
                  id="consultation-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={t("namePlaceholder")}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-white placeholder-text-muted/60 focus:outline-none focus:ring-1 transition-colors ${
                    errors.name ? "border-rose-500 focus:ring-rose-500" : "border-gold-border/60 focus:border-gold-primary focus:ring-gold-primary"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 font-medium mt-1">
                    {t("errors.nameRequired")}
                  </p>
                )}
              </div>

              {/* Phone (Required) */}
              <div className="space-y-1.5">
                <label htmlFor="consultation-phone" className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t("phoneLabel")} <span className="text-primary-yellow">*</span>
                </label>
                <input
                  id="consultation-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder={t("phonePlaceholder")}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-white placeholder-text-muted/60 focus:outline-none focus:ring-1 transition-colors ${
                    errors.phone ? "border-rose-500 focus:ring-rose-500" : "border-gold-border/60 focus:border-gold-primary focus:ring-gold-primary"
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-400 font-medium mt-1">
                    {t("errors.phoneRequired")}
                  </p>
                )}
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="consultation-email" className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t("emailLabel")}
                </label>
                <input
                  id="consultation-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder={t("emailPlaceholder")}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-white placeholder-text-muted/60 focus:outline-none focus:ring-1 transition-colors ${
                    errors.email ? "border-rose-500 focus:ring-rose-500" : "border-gold-border/60 focus:border-gold-primary focus:ring-gold-primary"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 font-medium mt-1">
                    {t("errors.invalidEmail")}
                  </p>
                )}
              </div>

              {/* Message (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="consultation-message" className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t("messageLabel")}
                </label>
                <textarea
                  id="consultation-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-gold-border/60 text-sm text-white placeholder-text-muted/60 focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-colors resize-none"
                />
              </div>

              {/* Error Box */}
              {submitError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {submitError}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? t("submittingButton") : t("submitButton")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
