import type { OrderCustomer } from "./order.types";

export interface CustomerValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  comment?: string;
}

export function validateCustomer(
  customer: Partial<OrderCustomer>
): { isValid: boolean; errors: CustomerValidationErrors } {
  const errors: CustomerValidationErrors = {};

  const trimmedName = (customer.name || "").trim();
  if (!trimmedName) {
    errors.name = "requiredField";
  } else if (trimmedName.length < 2) {
    errors.name = "nameTooShort";
  } else if (trimmedName.length > 100) {
    errors.name = "nameTooLong";
  }

  const trimmedPhone = (customer.phone || "").trim();
  const digitCount = trimmedPhone.replace(/\D/g, "").length;
  if (!trimmedPhone) {
    errors.phone = "requiredField";
  } else if (digitCount < 6 || trimmedPhone.length > 30) {
    errors.phone = "invalidPhone";
  }

  const trimmedEmail = (customer.email || "").trim();
  if (trimmedEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 255) {
      errors.email = "invalidEmail";
    }
  }

  const trimmedComment = (customer.comment || "").trim();
  if (trimmedComment.length > 2000) {
    errors.comment = "commentTooLong";
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}

export function validateOrderPayloadServer(
  payload: unknown
): { isValid: boolean; reason?: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { isValid: false, reason: "Payload must be a non-null JSON object" };
  }

  const body = payload as Record<string, unknown>;

  // Honeypot trap check
  if (body.honeypot && typeof body.honeypot === "string" && body.honeypot.trim() !== "") {
    return { isValid: false, reason: "Honeypot filled" };
  }

  // 1. Strict Locale Validation (Do NOT silently convert unsupported locales)
  const locale = body.locale;
  if (typeof locale !== "string" || !["hy", "ru", "en"].includes(locale.trim())) {
    return {
      isValid: false,
      reason: "Unsupported locale. Acceptable values: 'hy', 'ru', 'en'",
    };
  }

  // 2. Customer Validation
  if (!body.customer || typeof body.customer !== "object" || Array.isArray(body.customer)) {
    return { isValid: false, reason: "Missing customer object" };
  }
  const customer = body.customer as Record<string, unknown>;

  const customerName = typeof customer.name === "string" ? customer.name.trim() : "";
  if (customerName.length < 1 || customerName.length > 100) {
    return { isValid: false, reason: "Invalid customer name. Length must be 1-100 characters." };
  }

  const customerPhone = typeof customer.phone === "string" ? customer.phone.trim() : "";
  const digitCount = customerPhone.replace(/\D/g, "").length;
  if (digitCount < 6 || customerPhone.length < 3 || customerPhone.length > 50) {
    return { isValid: false, reason: "Invalid customer phone number. Must contain 6+ digits, max 50 chars." };
  }

  if (customer.email && typeof customer.email === "string" && customer.email.trim() !== "") {
    const trimmedEmail = customer.email.trim();
    if (trimmedEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { isValid: false, reason: "Invalid customer email address." };
    }
  }

  if (customer.comment && typeof customer.comment === "string" && customer.comment.trim() !== "") {
    if (customer.comment.trim().length > 2000) {
      return { isValid: false, reason: "Customer comment exceeds maximum length of 2000 characters." };
    }
  }

  // 3. Order Object Validation
  if (!body.order || typeof body.order !== "object" || Array.isArray(body.order)) {
    return { isValid: false, reason: "Missing order object" };
  }
  const order = body.order as Record<string, unknown>;

  // Product ID / Slug (Required)
  const productId = typeof order.productId === "string" ? order.productId.trim() : "";
  if (!productId || productId.length > 100) {
    return { isValid: false, reason: "Product ID / Slug is required and must not exceed 100 characters." };
  }

  // Strict Quantity Validation (Must be a finite positive number, no default fallback)
  const quantity = order.quantity;
  if (
    typeof quantity !== "number" ||
    isNaN(quantity) ||
    !isFinite(quantity) ||
    quantity <= 0 ||
    quantity > 100000
  ) {
    return {
      isValid: false,
      reason: "Invalid quantity. Quantity must be a finite positive number <= 100,000.",
    };
  }

  // Optional Delivery Address Bounds
  if (order.deliveryAddress && typeof order.deliveryAddress === "string") {
    if (order.deliveryAddress.trim().length > 500) {
      return { isValid: false, reason: "Delivery address exceeds maximum length of 500 characters." };
    }
  }

  // Optional Delivery Distance Km Bounds
  if (order.deliveryDistanceKm !== undefined && order.deliveryDistanceKm !== null) {
    const dist = order.deliveryDistanceKm;
    if (typeof dist !== "number" || isNaN(dist) || !isFinite(dist) || dist < 0 || dist > 1000) {
      return { isValid: false, reason: "Invalid delivery distance. Distance must be between 0 and 1000 km." };
    }
  }

  return { isValid: true };
}
