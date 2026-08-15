"use client";

import { useTranslations, useLocale } from "next-intl";
import type { OrderDetails } from "@/lib/order/order.types";
import { formatAmd, formatKm } from "@/lib/order/order-formatters";
import VatIncludedNote from "@/components/ui/VatIncludedNote";

interface OrderSummaryProps {
  order: OrderDetails;
}

const INPUT_KEY_LABELS: Record<string, { hy: string; ru: string; en: string }> = {
  mode: { hy: "Մուտքագրման եղանակ", ru: "Способ ввода", en: "Input Mode" },
  lengthMeters: { hy: "Երկարություն", ru: "Длина", en: "Length" },
  widthMeters: { hy: "Լայնություն", ru: "Ширина", en: "Width" },
  heightMeters: { hy: "Բարձրություն", ru: "Высота", en: "Height" },
  wallCount: { hy: "Պատերի քանակ", ru: "Коլ-во стен", en: "Wall Count" },
  linearLengthMeters: { hy: "Գծային երկարություն", ru: "Линейная длина", en: "Linear Length" },
  directVolumeM3: { hy: "Ծավալ", ru: "Объём", en: "Volume" },
  depthMeters: { hy: "Խորություն / Հաստություն", ru: "Глубина / Толщина", en: "Depth / Thickness" },
  quantity: { hy: "Քանակ", ru: "Количество", en: "Quantity" },
  reservePercent: { hy: "Պահուստ", ru: "Запас", en: "Reserve" },
};

const VALUE_LABELS: Record<string, { hy: string; ru: string; en: string }> = {
  dimensions: { hy: "Չափսերով", ru: "По размерам", en: "By Dimensions" },
  quantity: { hy: "Ըստ քանակի", ru: "По количеству", en: "By Quantity" },
  direct: { hy: "Ծավալ", ru: "Прямой объём", en: "Direct Volume" },
};

const IGNORED_INPUT_KEYS = new Set([
  "type",
  "variantId",
  "colorId",
  "sizeId",
  "accessories",
]);

export default function OrderSummary({ order }: OrderSummaryProps) {
  const t = useTranslations("orderModal.summary");
  const tProducts = useTranslations("products");
  const tUnits = useTranslations("calculator.units");
  const locale = (useLocale() as "hy" | "ru" | "en") || "hy";
  const currency = tUnits("currency") || "դր";

  const isManualMode = order.calculationMode === "manual";

  const getLocalizedColor = (colorId: string) => {
    const key = colorId.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
    try {
      const translation = tProducts(`colors.${key}`);
      return translation && !translation.includes("colors.") ? translation : colorId;
    } catch {
      return colorId;
    }
  };

  const getLocalizedInputKey = (key: string): string => {
    if (INPUT_KEY_LABELS[key]) {
      return INPUT_KEY_LABELS[key][locale] || INPUT_KEY_LABELS[key].hy;
    }
    return key;
  };

  const getLocalizedInputValue = (key: string, val: unknown): string => {
    const strVal = String(val);
    if (VALUE_LABELS[strVal]) {
      return VALUE_LABELS[strVal][locale] || VALUE_LABELS[strVal].hy;
    }
    if (key === "reservePercent") {
      return `${strVal}%`;
    }
    if (
      key === "lengthMeters" ||
      key === "widthMeters" ||
      key === "heightMeters" ||
      key === "linearLengthMeters" ||
      key === "depthMeters"
    ) {
      const unitStr = locale === "hy" ? "մ" : locale === "ru" ? "м" : "m";
      return `${strVal} ${unitStr}`;
    }
    if (key === "directVolumeM3") {
      const unitStr = locale === "hy" ? "մ³" : locale === "ru" ? "м³" : "m³";
      return `${strVal} ${unitStr}`;
    }
    return strVal;
  };

  const filteredInputs = order.inputs
    ? Object.entries(order.inputs).filter(
      ([k, v]) => !IGNORED_INPUT_KEYS.has(k) && v !== undefined && v !== null && v !== ""
    )
    : [];

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

      {/* Product & Variant Details */}
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
        {order.sizeDisplay && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t("size")}:</span>
            <span className="text-text-primary font-semibold">{order.sizeDisplay}</span>
          </div>
        )}
        {order.colorId && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t("color")}:</span>
            <span className="text-text-primary font-bold text-primary-yellow">
              {getLocalizedColor(order.colorId)}
            </span>
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
      {filteredInputs.length > 0 && (
        <div className="pt-2 border-t border-gold-border/20 flex flex-col gap-1 font-mono text-[11px]">
          <span className="text-text-secondary uppercase text-[9px] tracking-wider font-semibold">
            {t("enteredParameters")}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 bg-surface/60 p-2.5 rounded-lg border border-gold-border/30">
            {filteredInputs.map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="text-text-secondary font-normal">{getLocalizedInputKey(key)}:</span>
                <span className="text-text-primary font-semibold">{getLocalizedInputValue(key, val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery details if available */}
      {order.deliveryAddress && (
        <div className="pt-2 border-t border-gold-border/20 flex flex-col gap-1.5 font-mono text-[11px]">
          <div className="flex flex-col">
            <span className="text-text-secondary uppercase text-[9px] tracking-wider font-semibold">
              {t("deliveryAddress")}:
            </span>
            <span className="text-text-primary font-semibold">{order.deliveryAddress}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-[10px]">
            <div>
              <span className="text-text-secondary block">{t("distance")}:</span>
              <span className="text-primary-yellow font-bold">{formatKm(order.deliveryDistanceKm)}</span>
            </div>
            <div className="text-right">
              <span className="text-text-secondary block">{t("deliveryPrice")}:</span>
              <span className="text-primary-yellow font-bold text-right block">
                {order.deliveryDistanceKm && order.deliveryDistanceKm > 40
                  ? tProducts("deliveryPriceDeterminedAfterOrder")
                  : formatAmd(order.estimatedDeliveryPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="pt-2 border-t border-gold-border/30 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-text-secondary">{t("productSubtotal")}:</span>
          <span className="font-mono text-text-primary">
            {order.productPrice.toLocaleString()} {currency}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-text-secondary">{t("deliveryCost")}:</span>
          <span className="font-mono text-primary-yellow text-right block">
            {order.deliveryDistanceKm && order.deliveryDistanceKm > 40
              ? tProducts("deliveryPriceDeterminedAfterOrder")
              : formatAmd(order.estimatedDeliveryPrice)}
          </span>
        </div>

        <div className="h-px bg-gold-border/60 my-1" />

        <div className="flex flex-col items-end">
          <div className="flex items-center justify-between w-full text-sm font-bold">
            <span className="text-text-primary uppercase tracking-wider">{t("total")}:</span>
            <span className="font-mono text-base sm:text-lg font-black text-primary-yellow text-right">
              {order.deliveryDistanceKm && order.deliveryDistanceKm > 40 ? (
                tProducts("deliveryPriceDeterminedAfterOrder")
              ) : (
                `${order.totalPrice.toLocaleString()} ${currency}`
              )}
            </span>
          </div>
          {!(order.deliveryDistanceKm && order.deliveryDistanceKm > 40) && (
            <VatIncludedNote namespace="orderModal" className="text-[10px] text-text-muted font-normal text-right block mt-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}
