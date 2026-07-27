export type LocaleCode = "hy" | "ru" | "en";

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  comment?: string;
}

export interface OrderDetails {
  calculationMode: "parameters" | "manual";
  productId: string;
  productName: string;
  productVariantId?: string;
  productVariantName?: string;

  quantity?: number;
  unit?: string;

  inputs?: Record<string, string | number | boolean>;

  productPrice: number;
  currency: "AMD";

  deliveryAddress?: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  deliveryDistanceKm?: number;
  estimatedDurationMinutes?: number;
  estimatedDeliveryPrice?: number | null;
  deliveryLocationAdjustedManually?: boolean;

  totalPrice: number;
}

export interface OrderRequestPayload {
  locale: LocaleCode;
  customer: OrderCustomer;
  order: OrderDetails;
  idempotencyKey?: string;
  honeypot?: string;
  metadata?: {
    pageUrl?: string;
    submittedAt?: string;
  };
}

export type OrderServerErrorCode =
  | "VALIDATION_ERROR"
  | "EMAIL_NOT_CONFIGURED"
  | "EMAIL_SEND_FAILED"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_PAYLOAD";

export interface OrderServerResponse {
  success: boolean;
  code?: OrderServerErrorCode;
  message?: string;
}
