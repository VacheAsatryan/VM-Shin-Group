import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateCustomer } from "@/lib/order/order.schema";
import {
  getResendApiKey,
  getNotificationEmail,
  getFromEmail,
} from "@/lib/order/order-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml } from "@/lib/order/order-formatters";
import type { Json } from "@/lib/supabase/types";

export interface ConsultationApiPayload {
  locale?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  pageUrl?: string;
  honeypot?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
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

    const payload = body as ConsultationApiPayload;

    // Honeypot bot protection (silent success drop)
    if (payload.honeypot && typeof payload.honeypot === "string" && payload.honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // 1. Validation
    const validation = validateCustomer({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      comment: payload.message,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, code: "VALIDATION_ERROR", errors: validation.errors },
        { status: 400 }
      );
    }

    const locale = (payload.locale as "hy" | "ru" | "en") || "hy";
    const name = payload.name.trim().slice(0, 100);
    const phone = payload.phone.trim().slice(0, 50);
    const email = payload.email && payload.email.trim() !== "" ? payload.email.trim().slice(0, 255) : null;
    const message = payload.message && payload.message.trim() !== "" ? payload.message.trim().slice(0, 2000) : null;
    const sourcePageUrl = payload.pageUrl && payload.pageUrl.trim() !== "" ? payload.pageUrl.trim().slice(0, 500) : undefined;
    const submittedAt = new Date().toISOString();

    // 2. Persist to Supabase Database (order_requests table)
    let savedOrderId: string | null = null;
    try {
      const supabaseAdmin = createAdminClient();
      const insertResult = await supabaseAdmin
        .from("order_requests")
        .insert({
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          locale: locale,
          product_slug: "consultation",
          product_name: "Խորհրդատվություն / Consultation",
          product_variant: null,
          quantity: 1,
          unit: "request",
          product_price: 0,
          products_total: 0,
          delivery_address: null,
          delivery_distance_km: null,
          delivery_duration_minutes: null,
          delivery_price: null,
          total_price: 0,
          customer_comment: message,
          order_payload: {
            requestType: "consultation",
            sourcePageUrl,
            submittedAt,
          } as unknown as Json,
        })
        .select("id")
        .single();

      if (insertResult.error) {
        console.error(
          "[Consultation API Supabase Insert Error]",
          insertResult.error.code,
          insertResult.error.message
        );
      } else if (insertResult.data) {
        savedOrderId = insertResult.data.id;
      }
    } catch (err) {
      console.error(
        "[Consultation API Supabase Exception]",
        err instanceof Error ? err.message : String(err)
      );
    }

    if (!savedOrderId) {
      return NextResponse.json(
        { success: false, code: "DATABASE_SAVE_FAILED", message: "Failed to save consultation request" },
        { status: 500 }
      );
    }

    // 3. Dispatch Email via Resend
    const apiKey = getResendApiKey();
    if (!apiKey) {
      console.error(
        `[Consultation API Warning] Request saved to DB (ID: ${savedOrderId}), but RESEND_API_KEY is not configured.`
      );
      return NextResponse.json({ success: true });
    }

    const notificationRecipient = getNotificationEmail();
    const fromSender = getFromEmail();

    const dateFormatted = new Date(submittedAt).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Yerevan",
    });

    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeEmail = email ? escapeHtml(email) : undefined;
    const safeMessage = message ? escapeHtml(message) : undefined;
    const safePageUrl = sourcePageUrl ? escapeHtml(sourcePageUrl) : undefined;

    const subject = `[Խորհրդատվության Հայտ / Consultation Request] — ${name} (${phone})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #09090b; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #121215; border: 1px solid #F5C21B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); border-bottom: 2px solid #F5C21B;">
              <div style="font-size: 20px; font-weight: 900; color: #F5C21B; letter-spacing: 0.1em; text-transform: uppercase;">
                VM SHIN GROUP
              </div>
              <div style="font-size: 13px; color: #d4d4d8; margin-top: 4px; font-weight: 500;">
                💬 Consultation Request / Խորհրդատվության Նոր Հայտ
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">

              <div style="padding: 12px 16px; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; margin-bottom: 24px; font-size: 12px; color: #a1a1aa;">
                <div><strong>Submission Date:</strong> ${dateFormatted} (Yerevan Time)</div>
                <div><strong>Locale:</strong> ${locale.toUpperCase()}</div>
                ${safePageUrl ? `<div><strong>Source Page:</strong> <a href="${safePageUrl}" style="color: #F5C21B; text-decoration: underline;">${safePageUrl}</a></div>` : ""}
              </div>

              <!-- Customer Info -->
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #F5C21B; margin: 0 0 12px 0; border-bottom: 1px solid #27272a; padding-bottom: 6px;">
                  👤 Customer Contact Info / Պատվիրատու
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa; width: 130px;">Name:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Phone:</td>
                    <td style="padding: 6px 0; color: #F5C21B; font-weight: 700; font-size: 15px;">
                      <a href="tel:${safePhone}" style="color: #F5C21B; text-decoration: none;">${safePhone}</a>
                    </td>
                  </tr>
                  ${
                    safeEmail
                      ? `<tr>
                          <td style="padding: 6px 0; color: #a1a1aa;">Email:</td>
                          <td style="padding: 6px 0; color: #ffffff;">
                            <a href="mailto:${safeEmail}" style="color: #60a5fa; text-decoration: none;">${safeEmail}</a>
                          </td>
                        </tr>`
                      : ""
                  }
                </table>
              </div>

              <!-- Message Section -->
              ${
                safeMessage
                  ? `<div style="margin-bottom: 24px;">
                      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #F5C21B; margin: 0 0 12px 0; border-bottom: 1px solid #27272a; padding-bottom: 6px;">
                        💬 Question / Message (Հարց / Մեկնաբանություն)
                      </h2>
                      <div style="background: #18181b; padding: 14px; border-radius: 8px; border: 1px solid #27272a; color: #e4e4e7; font-size: 14px; line-height: 1.6; whitespace-pre-wrap;">
                        ${safeMessage}
                      </div>
                    </div>`
                  : ""
              }

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center; font-size: 12px; color: #71717a;">
              VM SHIN GROUP Consultation Notification Service
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `
VM SHIN GROUP — Consultation Request / Խորհրդատվության Հայտ

Submission Date: ${dateFormatted}
Locale: ${locale.toUpperCase()}
${sourcePageUrl ? `Source Page: ${sourcePageUrl}\n` : ""}
Customer Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}

Message / Question:
${message || "No specific message provided"}
    `.trim();

    const resend = new Resend(apiKey);

    const emailOptions: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
      replyTo?: string;
    } = {
      from: fromSender,
      to: notificationRecipient,
      subject: `[Consultation #${savedOrderId.slice(0, 8)}] ${subject}`,
      html,
      text,
    };

    if (email) {
      emailOptions.replyTo = email;
    }

    const resendResponse = await resend.emails.send(emailOptions);

    if (resendResponse.error) {
      console.error(
        `[Consultation API Resend Provider Error] Request ID ${savedOrderId}:`,
        resendResponse.error.name,
        resendResponse.error.message
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Consultation API Unexpected Error]", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { success: false, code: "SEND_FAILED", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
