"use client";

import { useTranslations } from "next-intl";
import type { OrderCustomer } from "@/lib/order/order.types";
import type { CustomerValidationErrors } from "@/lib/order/order.schema";

interface OrderCustomerFormProps {
  customer: OrderCustomer;
  onChange: (updated: OrderCustomer) => void;
  errors: CustomerValidationErrors;
  isSubmitting: boolean;
  honeypot: string;
  onHoneypotChange: (val: string) => void;
}

export default function OrderCustomerForm({
  customer,
  onChange,
  errors,
  isSubmitting,
  honeypot,
  onHoneypotChange,
}: OrderCustomerFormProps) {
  const t = useTranslations("orderModal");

  return (
    <div className="flex flex-col gap-4">
      {/* Honeypot field for bot protection */}
      <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
        <input
          type="text"
          name="website_url_check"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => onHoneypotChange(e.target.value)}
        />
      </div>

      {/* Customer Name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="order-customer-name"
          className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase flex items-center justify-between"
        >
          <span>{t("form.nameLabel")} *</span>
        </label>
        <input
          id="order-customer-name"
          type="text"
          required
          disabled={isSubmitting}
          value={customer.name}
          onChange={(e) => onChange({ ...customer, name: e.target.value })}
          placeholder={t("form.namePlaceholder")}
          className={`w-full bg-background/90 text-text-primary text-sm font-medium rounded-lg px-3.5 py-2.5 border outline-none transition-all ${
            errors.name
              ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
              : "border-gold-border focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {errors.name && (
          <span className="text-[11px] font-mono text-red-400">
            ⚠️ {t(`errors.${errors.name}`)}
          </span>
        )}
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="order-customer-phone"
          className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase flex items-center justify-between"
        >
          <span>{t("form.phoneLabel")} *</span>
        </label>
        <input
          id="order-customer-phone"
          type="tel"
          required
          disabled={isSubmitting}
          value={customer.phone}
          onChange={(e) => onChange({ ...customer, phone: e.target.value })}
          placeholder={t("form.phonePlaceholder")}
          className={`w-full bg-background/90 text-text-primary text-sm font-medium rounded-lg px-3.5 py-2.5 border outline-none transition-all ${
            errors.phone
              ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
              : "border-gold-border focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {errors.phone && (
          <span className="text-[11px] font-mono text-red-400">
            ⚠️ {t(`errors.${errors.phone}`)}
          </span>
        )}
      </div>

      {/* Email (Optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="order-customer-email"
          className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase flex items-center justify-between"
        >
          <span>{t("form.emailLabel")}</span>
          <span className="text-[10px] text-text-secondary/70">({t("optional")})</span>
        </label>
        <input
          id="order-customer-email"
          type="email"
          disabled={isSubmitting}
          value={customer.email || ""}
          onChange={(e) => onChange({ ...customer, email: e.target.value })}
          placeholder={t("form.emailPlaceholder")}
          className={`w-full bg-background/90 text-text-primary text-sm font-medium rounded-lg px-3.5 py-2.5 border outline-none transition-all ${
            errors.email
              ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
              : "border-gold-border focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {errors.email && (
          <span className="text-[11px] font-mono text-red-400">
            ⚠️ {t(`errors.${errors.email}`)}
          </span>
        )}
      </div>

      {/* Comment (Optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="order-customer-comment"
          className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase flex items-center justify-between"
        >
          <span>{t("form.commentLabel")}</span>
          <span className="text-[10px] text-text-secondary/70">({t("optional")})</span>
        </label>
        <textarea
          id="order-customer-comment"
          rows={2}
          disabled={isSubmitting}
          value={customer.comment || ""}
          onChange={(e) => onChange({ ...customer, comment: e.target.value })}
          placeholder={t("form.commentPlaceholder")}
          className={`w-full bg-background/90 text-text-primary text-sm font-medium rounded-lg px-3.5 py-2.5 border outline-none resize-none transition-all ${
            errors.comment
              ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
              : "border-gold-border focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {errors.comment && (
          <span className="text-[11px] font-mono text-red-400">
            ⚠️ {t(`errors.${errors.comment}`)}
          </span>
        )}
      </div>
    </div>
  );
}
