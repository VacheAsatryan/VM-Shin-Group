"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { OrderCustomer, OrderDetails, OrderRequestPayload, OrderServerResponse, LocaleCode } from "@/lib/order/order.types";
import { validateCustomer, type CustomerValidationErrors } from "@/lib/order/order.schema";
import OrderCustomerForm from "./OrderCustomerForm";
import OrderSummary from "./OrderSummary";
import { OrderSuccessState, OrderErrorNotice } from "./OrderSubmitStatus";
import { Button } from "@/components/ui/Button";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: OrderDetails | null;
  locale: LocaleCode;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  orderDetails,
  locale,
}: OrderConfirmationModalProps) {
  const t = useTranslations("orderModal");

  const [customer, setCustomer] = useState<OrderCustomer>({
    name: "",
    phone: "",
    email: "",
    comment: "",
  });
  const [errors, setErrors] = useState<CustomerValidationErrors>({});
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const idempotencyKeyRef = useRef<string>("");

  const handleCloseModal = useCallback(() => {
    setIsSuccess(false);
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  // Lock body scroll and handle focus trap / restore when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      idempotencyKeyRef.current = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Focus first input inside modal
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

  const handleCustomerChange = (updated: OrderCustomer) => {
    setCustomer(updated);
    if (submitError) {
      setSubmitError(null);
    }

    // Live validation clearance
    const { errors: newErrors } = validateCustomer(updated);
    setErrors(newErrors);
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !orderDetails) return;

    const { isValid, errors: validationErrors } = validateCustomer(customer);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload: OrderRequestPayload = {
      locale,
      customer,
      order: orderDetails,
      idempotencyKey: idempotencyKeyRef.current,
      honeypot,
      metadata: {
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        submittedAt: new Date().toISOString(),
      },
    };

    try {
      const response = await fetch("/api/order-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: OrderServerResponse = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        // Clear customer contact info after successful submission
        setCustomer({ name: "", phone: "", email: "", comment: "" });
        setErrors({});
      } else {
        setSubmitError(data.message || t("error.defaultMessage"));
      }
    } catch {
      setSubmitError(t("error.defaultMessage"));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, orderDetails, customer, locale, honeypot, t]);

  if (!isOpen || !orderDetails) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
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

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-gold-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h2
              id="order-modal-title"
              className="text-base sm:text-lg font-bold text-text-primary uppercase tracking-tight"
            >
              {isSuccess ? t("success.title") : t("modalTitle")}
            </h2>
            {!isSuccess && (
              <p className="text-xs text-text-secondary">{t("modalDescription")}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isSubmitting}
            aria-label={t("closeAriaLabel")}
            className="w-8 h-8 rounded-full bg-background/60 hover:bg-gold-primary/20 border border-gold-border/60 flex items-center justify-center text-text-secondary hover:text-primary-yellow text-sm font-bold transition-all disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {isSuccess ? (
            <OrderSuccessState onClose={handleCloseModal} />
          ) : (
            <>
              {submitError && (
                <OrderErrorNotice
                  onRetry={handleSubmit}
                  onCancel={handleCloseModal}
                />
              )}

              <OrderSummary order={orderDetails} />

              <div className="h-px bg-gold-border/30 my-1" />

              <OrderCustomerForm
                customer={customer}
                onChange={handleCustomerChange}
                errors={errors}
                isSubmitting={isSubmitting}
                honeypot={honeypot}
                onHoneypotChange={setHoneypot}
              />
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!isSuccess && (
          <div className="p-4 sm:p-6 pt-4 border-t border-gold-border/40 bg-background/40 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold"
            >
              {t("cancelButton")}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{t("submittingButton")}</span>
                </span>
              ) : (
                t("submitButton")
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
