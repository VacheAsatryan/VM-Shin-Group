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
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 100) {
      errors.email = "invalidEmail";
    }
  }

  const trimmedComment = (customer.comment || "").trim();
  if (trimmedComment.length > 1000) {
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

  if (body.honeypot && typeof body.honeypot === "string" && body.honeypot.trim() !== "") {
    return { isValid: false, reason: "Honeypot filled" };
  }

  if (!body.customer || typeof body.customer !== "object" || Array.isArray(body.customer)) {
    return { isValid: false, reason: "Missing customer object" };
  }

  if (!body.order || typeof body.order !== "object" || Array.isArray(body.order)) {
    return { isValid: false, reason: "Missing order object" };
  }

  const customer = body.customer as Record<string, unknown>;
  const order = body.order as Record<string, unknown>;

  const customerName = typeof customer.name === "string" ? customer.name.trim() : "";
  const customerPhone = typeof customer.phone === "string" ? customer.phone.trim() : "";

  if (customerName.length < 2 || customerName.length > 100) {
    return { isValid: false, reason: "Invalid customer name" };
  }

  const digitCount = customerPhone.replace(/\D/g, "").length;
  if (digitCount < 6 || customerPhone.length > 30) {
    return { isValid: false, reason: "Invalid customer phone" };
  }

  if (customer.email && typeof customer.email === "string") {
    const trimmedEmail = customer.email.trim();
    if (trimmedEmail.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { isValid: false, reason: "Invalid customer email" };
    }
  }

  if (customer.comment && typeof customer.comment === "string") {
    if (customer.comment.trim().length > 1000) {
      return { isValid: false, reason: "Customer comment too long" };
    }
  }

  const productName = typeof order.productName === "string" ? order.productName.trim() : "";
  if (!productName || productName.length > 200) {
    return { isValid: false, reason: "Invalid product name" };
  }

  const productPrice = typeof order.productPrice === "number" ? order.productPrice : -1;
  const totalPrice = typeof order.totalPrice === "number" ? order.totalPrice : -1;

  if (
    isNaN(productPrice) ||
    !isFinite(productPrice) ||
    productPrice < 0 ||
    isNaN(totalPrice) ||
    !isFinite(totalPrice) ||
    totalPrice < 0
  ) {
    return { isValid: false, reason: "Invalid price numbers" };
  }

  return { isValid: true };
}
