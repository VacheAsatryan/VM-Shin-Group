import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { OrderRequestPayload, OrderServerResponse } from "@/lib/order/order.types";
import { validateOrderPayloadServer } from "@/lib/order/order.schema";
import { resolveCanonicalProduct } from "@/lib/order/order-catalog";
import { calculateDeliveryPrice } from "@/lib/calculator/pricing/calculateDeliveryPrice";
import { renderOrderEmail } from "@/lib/order/order-email";
import {
  getResendApiKey,
  getNotificationEmail,
  getFromEmail,
} from "@/lib/order/order-config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export async function POST(request: Request): Promise<NextResponse<OrderServerResponse>> {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, code: "INVALID_PAYLOAD", message: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, code: "INVALID_PAYLOAD", message: "Malformed JSON body" },
        { status: 400 }
      );
    }

    const payload = body as OrderRequestPayload;

    // Honeypot bot protection (silent success drop)
    if (payload.honeypot && typeof payload.honeypot === "string" && payload.honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // 1. Server-side Schema Validation (Locale, Customer, Quantity, String Bounds)
    const validation = validateOrderPayloadServer(payload);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, code: "VALIDATION_ERROR", message: validation.reason || "Validation failed" },
        { status: 400 }
      );
    }

    const locale = payload.locale as "hy" | "ru" | "en";

    // 2. Resolve Product & Variant against Authoritative Server Catalog & Locale
    const variantIdOrName =
      payload.order.productVariantId || payload.order.productVariantName;

    const catalogResolution = resolveCanonicalProduct(
      payload.order.productId,
      variantIdOrName,
      locale
    );

    if (!catalogResolution.isValid) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: catalogResolution.reason || "Product or variant validation failed",
        },
        { status: 400 }
      );
    }

    // 3. Authoritative Server-Side Commercial Calculations (AMD Integers)
    const customerName = payload.customer.name.trim().slice(0, 100);
    const customerPhone = payload.customer.phone.trim().slice(0, 50);
    const customerEmail =
      payload.customer.email && payload.customer.email.trim() !== ""
        ? payload.customer.email.trim().slice(0, 255)
        : null;

    const productSlug = payload.order.productId.trim().slice(0, 100);
    const productName = catalogResolution.canonicalProductName.slice(0, 150);
    const productVariant = catalogResolution.canonicalVariantName
      ? catalogResolution.canonicalVariantName.slice(0, 150)
      : null;

    const quantity = payload.order.quantity!;
    const unit = catalogResolution.canonicalUnit.slice(0, 20);

    const productPrice = catalogResolution.canonicalUnitPrice;
    const productsTotal = Math.round(productPrice * quantity);

    const deliveryAddress =
      payload.order.deliveryAddress && payload.order.deliveryAddress.trim() !== ""
        ? payload.order.deliveryAddress.trim().slice(0, 500)
        : null;

    const deliveryDistanceKm =
      typeof payload.order.deliveryDistanceKm === "number" &&
      payload.order.deliveryDistanceKm >= 0
        ? payload.order.deliveryDistanceKm
        : null;

    const deliveryDurationMinutes =
      typeof payload.order.estimatedDurationMinutes === "number" &&
      payload.order.estimatedDurationMinutes >= 0
        ? payload.order.estimatedDurationMinutes
        : null;

    // Recalculate Delivery Price on Server
    const deliveryPrice =
      deliveryDistanceKm !== null
        ? calculateDeliveryPrice(deliveryDistanceKm, true)
        : null;

    // Server-Calculated Final Total Price
    const totalPrice = productsTotal + (deliveryPrice ?? 0);

    const customerComment =
      payload.customer.comment && payload.customer.comment.trim() !== ""
        ? payload.customer.comment.trim().slice(0, 2000)
        : null;

    // STEP 1: Insert Order into Supabase Database via Server-Only Admin Client
    let savedOrderId: string | null = null;
    try {
      const supabaseAdmin = createAdminClient();
      const insertResult = await supabaseAdmin
        .from("order_requests")
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          locale: locale,
          product_slug: productSlug,
          product_name: productName,
          product_variant: productVariant,
          quantity: quantity,
          unit: unit,
          product_price: productPrice,
          products_total: productsTotal,
          delivery_address: deliveryAddress,
          delivery_distance_km: deliveryDistanceKm,
          delivery_duration_minutes: deliveryDurationMinutes,
          delivery_price: deliveryPrice,
          total_price: totalPrice,
          customer_comment: customerComment,
          order_payload: payload as unknown as Json,
        })
        .select("id")
        .single();

      if (insertResult.error) {
        console.error(
          "[Order API Supabase Insert Error]",
          insertResult.error.code,
          insertResult.error.message
        );
      } else if (insertResult.data) {
        savedOrderId = insertResult.data.id;
      }
    } catch (err) {
      console.error(
        "[Order API Supabase Client Exception]",
        err instanceof Error ? err.message : String(err)
      );
    }

    // Fail early if database persistence failed: DO NOT send email
    if (!savedOrderId) {
      return NextResponse.json(
        { success: false, code: "DATABASE_SAVE_FAILED", message: "Failed to save order request" },
        { status: 500 }
      );
    }

    // STEP 2: Render & Send Email Notification via Resend using Canonical Payload
    const canonicalPayload: OrderRequestPayload = {
      ...payload,
      locale: locale,
      order: {
        ...payload.order,
        productName: productName,
        productVariantName: productVariant || undefined,
        productPrice: productPrice,
        estimatedDeliveryPrice: deliveryPrice,
        totalPrice: totalPrice,
      },
    };

    const apiKey = getResendApiKey();
    if (!apiKey) {
      console.error(
        `[Order API Warning] Order saved to DB (ID: ${savedOrderId}), but RESEND_API_KEY is not configured.`
      );
      return NextResponse.json({ success: true });
    }

    const notificationRecipient = getNotificationEmail();
    const fromSender = getFromEmail();
    const { subject, html, text } = renderOrderEmail(canonicalPayload);

    const resend = new Resend(apiKey);

    const emailOptions: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
      replyTo?: string;
      headers?: Record<string, string>;
    } = {
      from: fromSender,
      to: notificationRecipient,
      subject: `[Order #${savedOrderId.slice(0, 8)}] ${subject}`,
      html,
      text,
    };

    if (payload.customer.email && payload.customer.email.trim() !== "") {
      emailOptions.replyTo = payload.customer.email.trim();
    }

    if (payload.idempotencyKey) {
      emailOptions.headers = {
        "X-Entity-Ref-ID": payload.idempotencyKey,
      };
    }

    const resendResponse = await resend.emails.send(emailOptions);

    if (resendResponse.error) {
      console.error(
        `[Order API Resend Provider Error] Order ID ${savedOrderId}:`,
        resendResponse.error.name,
        resendResponse.error.message
      );
      // Order is safely preserved in DB! Return success so user submission is acknowledged
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Order API Unexpected Error]", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { success: false, code: "EMAIL_SEND_FAILED", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
