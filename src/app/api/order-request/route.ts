import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { OrderRequestPayload, OrderServerResponse } from "@/lib/order/order.types";
import { validateOrderPayloadServer } from "@/lib/order/order.schema";
import { renderOrderEmail } from "@/lib/order/order-email";
import {
  getResendApiKey,
  getNotificationEmail,
  getFromEmail,
} from "@/lib/order/order-config";

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

    // Server-side Payload Validation
    const validation = validateOrderPayloadServer(payload);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, code: "VALIDATION_ERROR", message: validation.reason || "Validation failed" },
        { status: 400 }
      );
    }

    // Server Environment Configuration Check
    const apiKey = getResendApiKey();
    if (!apiKey) {
      console.error("[Order API Error] RESEND_API_KEY environment variable is not configured.");
      return NextResponse.json(
        { success: false, code: "EMAIL_NOT_CONFIGURED", message: "Email service not configured" },
        { status: 500 }
      );
    }

    const notificationRecipient = getNotificationEmail();
    const fromSender = getFromEmail();

    const { subject, html, text } = renderOrderEmail(payload);

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
      subject,
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
      console.error("[Order API Resend Provider Error]", resendResponse.error.name, resendResponse.error.message);
      return NextResponse.json(
        { success: false, code: "EMAIL_SEND_FAILED", message: "Email sending failed" },
        { status: 500 }
      );
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
