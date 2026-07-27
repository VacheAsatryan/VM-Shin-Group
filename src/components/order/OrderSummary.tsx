"use client";

import { useTranslations } from "next-intl";
import type { OrderDetails } from "@/lib/order/order.types";
import { formatAmd, formatKm, formatMinutes } from "@/lib/order/order-formatters";

interface OrderSummaryProps {
  order: OrderDetails;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const t = useTranslations("orderModal.summary");
  const currency = "AMD";

  const isManualMode = order.calculationMode === "manual";

  return (
    <div className="p-4 rounded-xl bg-background/80 border border-gold-border flex flex-col gap-3 text-xs shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-gold-border/40 font-mono">
        <span className="text-[11px] font-bold text-primary-yellow uppercase tracking-wider">
          {t("header")}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-gold-primary/10 border border-gold-border/60 text-gold-bright uppercase">
          {isManualMode ? t("manualMode") : t("parameterMode")}
        </span>
      </div>

      {/* Product & Variant */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between font-semibold">
          <span className="text-text-secondary">{t("product")}:</span>
          <span className="text-text-primary font-bold">{order.productName}</span>
        </div>
        {order.productVariantName && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t("variant")}:</span>
            <span className="text-text-primary">{order.productVariantName}</span>
          </div>
        )}
        {order.quantity !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t("quantity")}:</span>
            <span className="font-mono text-primary-yellow font-bold">
              {order.quantity} {order.unit || ""}
            </span>
          </div>
        )}
      </div>

      {/* Input parameters if parameter mode */}
      {order.inputs && Object.keys(order.inputs).length > 0 && (
        <div className="pt-2 border-t border-gold-border/20 flex flex-col gap-1 font-mono text-[11px]">
          <span className="text-text-secondary uppercase text-[9px] tracking-wider">
            {t("enteredParameters")}:
          </span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-surface/60 p-2 rounded border border-gold-border/30">
            {Object.entries(order.inputs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-text-secondary">{key}:</span>
                <span className="text-text-primary font-semibold">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery details if available */}
      {order.deliveryAddress && (
        <div className="pt-2 border-t border-gold-border/20 flex flex-col gap-1.5 font-mono text-[11px]">
          <div className="flex flex-col">
            <span className="text-text-secondary uppercase text-[9px] tracking-wider">
              {t("deliveryAddress")}:
            </span>
            <span className="text-text-primary font-semibold">{order.deliveryAddress}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
            <div>
              <span className="text-text-secondary block">{t("distance")}:</span>
              <span className="text-primary-yellow font-bold">{formatKm(order.deliveryDistanceKm)}</span>
            </div>
            <div>
              <span className="text-text-secondary block">{t("duration")}:</span>
              <span className="text-text-primary font-semibold">{formatMinutes(order.estimatedDurationMinutes)}</span>
            </div>
            <div>
              <span className="text-text-secondary block">{t("deliveryPrice")}:</span>
              <span className="text-primary-yellow font-bold">{formatAmd(order.estimatedDeliveryPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="pt-2 border-t border-gold-border/30 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-text-secondary">{t("productSubtotal")}:</span>
          <span className="font-mono text-text-primary">{order.productPrice.toLocaleString()} {currency}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-text-secondary">{t("deliveryCost")}:</span>
          <span className="font-mono text-primary-yellow">{formatAmd(order.estimatedDeliveryPrice)}</span>
        </div>

        <div className="h-px bg-gold-border/60 my-1" />

        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-text-primary uppercase tracking-wider">{t("total")}:</span>
          <span className="font-mono text-base sm:text-lg font-black text-primary-yellow">
            {order.totalPrice.toLocaleString()} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
