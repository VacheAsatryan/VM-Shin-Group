"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { FACTORY_ORIGIN } from "@/config/delivery";
import type { CalculationResult, EstimateSummaryPayload } from "@/lib/calculator/calculator.types";
import { getProductImage } from "@/lib/calculator/getProductImage";
import { useDeliveryRoute } from "@/hooks/useDeliveryRoute";
import type { AddressSuggestion } from "@/lib/maps/geoapify/types";
import DeliveryAddressSearch from "@/components/delivery/DeliveryAddressSearch";
import DeliveryRouteSummary from "@/components/delivery/DeliveryRouteSummary";
import DeliveryMapLoading from "@/components/delivery/DeliveryMapLoading";
import DeliveryMapError from "@/components/delivery/DeliveryMapError";
import { Button } from "@/components/ui/Button";

const DeliveryCalculatorMap = dynamic(
  () => import("@/components/delivery/DeliveryCalculatorMap"),
  {
    ssr: false,
    loading: () => <DeliveryMapLoading />,
  }
);

interface DeliveryStepProps {
  result: CalculationResult;
  onBackToEstimate: () => void;
  onRequestOffer?: (payload: EstimateSummaryPayload) => void;
}

export default function DeliveryStep({
  result,
  onBackToEstimate,
  onRequestOffer,
}: DeliveryStepProps) {
  const t = useTranslations("calculator");
  const locale = useLocale();
  const currency = t("units.currency");
  const productImage = getProductImage(result.category, result.variant.id);

  const {
    status,
    selectedAddress,
    destinationCoords,
    route,
    pricing,
    deliveryLocationAdjustedManually,
    errorMessageKey,
    isConfigured,
    setSelectedAddress,
    selectSuggestion,
    adjustDestinationCoordinates,
    invalidateRoute,
  } = useDeliveryRoute();

  const isRouteReady = status === "routeReady" && route !== null && pricing !== null;

  // Calculate final total with delivery if route is ready
  const deliveryEstimate = isRouteReady && pricing?.price !== null ? pricing.price : null;
  const finalTotal = result.pricing.productSubtotal + (deliveryEstimate || 0);

  const deliveryCostText = isRouteReady
    ? deliveryEstimate !== null
      ? `${deliveryEstimate.toLocaleString()} ${currency}`
      : t("delivery.deliveryNotCalculated")
    : t("delivery.deliveryNotCalculated");

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    selectSuggestion(suggestion);
  };

  const handleConfirmCoordinates = (coords: { lat: number; lon: number }) => {
    adjustDestinationCoordinates(coords);
  };

  const handleRequestOfferClick = () => {
    const payloadNote = [
      result.pricing.priceStatus === "to_be_confirmed"
        ? "exact size and price pending confirmation"
        : undefined,
      !isRouteReady
        ? "Delivery cost not calculated yet (requires destination confirmation)"
        : deliveryLocationAdjustedManually
        ? "Delivery location adjusted manually on map"
        : undefined,
    ]
      .filter(Boolean)
      .join("; ");

    const payload: EstimateSummaryPayload = {
      category: result.category,
      variantId: result.variant.id,
      colorId:
        result.input && "colorId" in result.input && typeof result.input.colorId === "string"
          ? result.input.colorId
          : result.category === "paving-stones"
          ? "gray"
          : undefined,
      input: result.input,
      metrics: result.metrics,
      pricing: {
        ...result.pricing,
        deliveryEstimate,
        estimatedTotal: finalTotal,
      },
      deliveryAddress: selectedAddress || undefined,
      destinationLatitude: destinationCoords?.lat,
      destinationLongitude: destinationCoords?.lon,
      estimatedDistanceKm: route?.distanceKm || undefined,
      estimatedDurationMinutes: route?.durationMinutes || undefined,
      estimatedDeliveryPrice: deliveryEstimate,
      deliveryLocationAdjustedManually,
      isDemoData: true,
      timestamp: new Date().toISOString(),
      productName: t(`categories.${result.category}`),
      variantName: t(`blocks.${result.variant.nameKey}`),
      imageFilename: result.variant.image ? result.variant.image.split("/").pop() : undefined,
      note: payloadNote || undefined,
    };

    if (onRequestOffer) {
      onRequestOffer(payload);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Dynamic Product Header Card */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-surface/80 border border-gold-border/40 shadow-lg">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-background/80 relative overflow-hidden shrink-0 border border-gold-border/40 flex items-center justify-center p-1">
          <Image
            src={productImage}
            alt={t(`categories.${result.category}`)}
            fill
            sizes="80px"
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold tracking-widest text-primary-yellow uppercase">
            {t("stepper.step4")}
          </span>
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-text-primary">
            {t(`categories.${result.category}`)}
          </h3>
          <span className="text-xs text-text-secondary font-mono">
            {t(`blocks.${result.variant.nameKey}`)}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-xl bg-surface-elevated/90 backdrop-blur-md border border-gold-border relative overflow-hidden shadow-2xl flex flex-col gap-6">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-yellow/60 to-transparent"
          aria-hidden="true"
        />

        {/* Section Title */}
        <div className="flex items-center justify-between pb-3 border-b border-gold-border">
          <span className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
            {t("delivery.title")}
          </span>
          <span className="text-xs font-mono text-text-secondary uppercase">
            {t(`categories.${result.category}`)}
          </span>
        </div>

        {/* Plant Origin Info */}
        <div className="p-4 rounded-lg bg-background/60 border border-gold-border flex flex-col gap-1">
          <span className="text-[10px] font-mono text-text-secondary uppercase">
            {t("delivery.originLabel")}
          </span>
          <span className="text-xs font-bold text-text-primary">
            {FACTORY_ORIGIN.name} — {FACTORY_ORIGIN.address}, {FACTORY_ORIGIN.city}
          </span>
        </div>

        {/* Geoapify Address Autocomplete */}
        <DeliveryAddressSearch
          value={selectedAddress}
          onChangeText={setSelectedAddress}
          onSelectSuggestion={handleSelectSuggestion}
          onInvalidateAddress={invalidateRoute}
          isConfigured={isConfigured}
          locale={locale}
        />

        {/* Route Error Notification */}
        {status === "error" && (
          <DeliveryMapError
            errorMessageKey={errorMessageKey}
            onRetry={() => {
              if (destinationCoords) handleConfirmCoordinates(destinationCoords);
            }}
          />
        )}

        {/* Map View & Route Calculation */}
        <div className="relative flex flex-col gap-3">
          {status === "buildingRoute" ? (
            <DeliveryMapLoading />
          ) : (
            <DeliveryCalculatorMap
              destinationCoords={destinationCoords}
              destinationAddress={selectedAddress}
              route={route}
              onConfirmCoordinates={handleConfirmCoordinates}
            />
          )}

            {/* Route Summary */}
            {isRouteReady && (
              <DeliveryRouteSummary
                route={route}
                pricing={pricing}
                deliveryLocationAdjustedManually={deliveryLocationAdjustedManually}
              />
            )}
          </div>

        {/* Delivery Summary Breakdown */}
        <div className="p-4 rounded-xl bg-background/80 border border-gold-border flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary">{t("results.subtotal")}:</span>
            <span className="font-mono text-text-primary">
              {result.pricing.productSubtotal.toLocaleString()} {currency}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary">{t("results.delivery")}:</span>
            <span className="font-mono text-primary-yellow">
              {deliveryCostText}
            </span>
          </div>

          <div className="h-px bg-gold-border my-1" />

          <div className="flex items-center justify-between text-sm sm:text-base font-bold">
            <span className="text-text-primary uppercase tracking-wider">{t("results.total")}:</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-primary-yellow">
              {finalTotal.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onBackToEstimate}
            className="flex-1 text-center"
          >
            {t("stepper.step3")}
          </Button>

          <Button
            type="button"
            variant="primary"
            className="flex-1 text-center"
            onClick={handleRequestOfferClick}
          >
            {t("results.cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
