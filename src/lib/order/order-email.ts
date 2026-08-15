import type { OrderRequestPayload } from "./order.types";
import { escapeHtml, formatAmd, formatKm, formatMinutes } from "./order-formatters";

export interface RenderedOrderEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderOrderEmail(payload: OrderRequestPayload): RenderedOrderEmail {
  const { customer, order, locale, metadata } = payload;

  const safeCustomerName = escapeHtml(customer.name);
  const safeCustomerPhone = escapeHtml(customer.phone);
  const safeCustomerEmail = customer.email ? escapeHtml(customer.email) : undefined;
  const safeCustomerComment = customer.comment ? escapeHtml(customer.comment) : undefined;

  const safeProductName = escapeHtml(order.productName);
  const safeVariantName = order.productVariantName ? escapeHtml(order.productVariantName) : undefined;
  const safeDeliveryAddress = order.deliveryAddress ? escapeHtml(order.deliveryAddress) : undefined;

  const submittedAt = metadata?.submittedAt || new Date().toISOString();
  const dateFormatted = new Date(submittedAt).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Yerevan",
  });

  const isManualMode = order.calculationMode === "manual";
  const modeText = isManualMode
    ? "Manual Quantity Entry (Ձեռքով քանակ)"
    : "Parameter-based Calculation (Պարամետրերով հաշվարկ)";

  const subject = `Նոր հայտ կայքից — ${order.productName} — ${customer.name}`;

  const isConcrete = order.productId === "concrete";
  const isOver40Km = order.deliveryDistanceKm !== undefined && order.deliveryDistanceKm > 40;

  const emailProductPriceText = formatAmd(order.productPrice);

  const emailDeliveryCostText =
    isOver40Km
      ? "Determined after order / Որոշվում է պատվերից հետո"
      : formatAmd(order.estimatedDeliveryPrice);

  const emailTotalText =
    isConcrete && isOver40Km
      ? "Determined after order / Որոշվում է պատվերից հետո"
      : formatAmd(order.totalPrice);

  // Formatted Input Parameters (if parameter mode)
  let inputsFormatted = "";
  let inputsTextFormatted = "";
  if (order.inputs && Object.keys(order.inputs).length > 0) {
    const rows = Object.entries(order.inputs)
      .map(
        ([key, val]) =>
          `<tr>
            <td style="padding: 6px 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px;">${escapeHtml(
              key
            )}</td>
            <td style="padding: 6px 12px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-size: 13px; font-weight: 600;">${escapeHtml(
              String(val)
            )}</td>
          </tr>`
      )
      .join("");

    inputsFormatted = `
      <div style="margin-top: 12px; margin-bottom: 12px;">
        <span style="font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Entered Calculation Parameters:</span>
        <table style="width: 100%; border-collapse: collapse; margin-top: 6px; background-color: #18181b; border-radius: 8px; overflow: hidden;">
          ${rows}
        </table>
      </div>
    `;

    inputsTextFormatted = Object.entries(order.inputs)
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join("\n");
  }

  // HTML Template with Gold & Dark Theme
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
                New Website Order Request / Կայքի Նոր Պատվերի Հայտ
              </div>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 32px;">

              <!-- Request Info Badge -->
              <div style="padding: 12px 16px; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; margin-bottom: 24px; font-size: 12px; color: #a1a1aa;">
                <div><strong>Submission Date:</strong> ${dateFormatted} (Yerevan Time)</div>
                <div><strong>Locale:</strong> ${locale.toUpperCase()}</div>
                <div><strong>Calculation Mode:</strong> ${modeText}</div>
              </div>

              <!-- Customer Section -->
              <div style="margin-bottom: 28px;">
                <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #F5C21B; margin: 0 0 12px 0; border-bottom: 1px solid #27272a; padding-bottom: 6px;">
                  👤 Customer Contact Info / Պատվիրատու
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa; width: 130px;">Name:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${safeCustomerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Phone:</td>
                    <td style="padding: 6px 0; color: #F5C21B; font-weight: 700; font-size: 15px;">
                      <a href="tel:${safeCustomerPhone}" style="color: #F5C21B; text-decoration: none;">${safeCustomerPhone}</a>
                    </td>
                  </tr>
                  ${
                    safeCustomerEmail
                      ? `<tr>
                          <td style="padding: 6px 0; color: #a1a1aa;">Email:</td>
                          <td style="padding: 6px 0; color: #ffffff;">
                            <a href="mailto:${safeCustomerEmail}" style="color: #60a5fa; text-decoration: none;">${safeCustomerEmail}</a>
                          </td>
                        </tr>`
                      : ""
                  }
                  ${
                    safeCustomerComment
                      ? `<tr>
                          <td style="padding: 6px 0; color: #a1a1aa; vertical-align: top;">Comment:</td>
                          <td style="padding: 6px 0; color: #e4e4e7; background: #18181b; padding: 10px; border-radius: 6px; font-style: italic;">
                            "${safeCustomerComment}"
                          </td>
                        </tr>`
                      : ""
                  }
                </table>
              </div>

              <!-- Product Details Section -->
              <div style="margin-bottom: 28px;">
                <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #F5C21B; margin: 0 0 12px 0; border-bottom: 1px solid #27272a; padding-bottom: 6px;">
                  📦 Product Details / Ապրանքի Տվյալներ
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa; width: 130px;">Product:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${safeProductName}</td>
                  </tr>
                  ${
                    safeVariantName
                      ? `<tr>
                          <td style="padding: 6px 0; color: #a1a1aa;">Variant:</td>
                          <td style="padding: 6px 0; color: #ffffff;">${safeVariantName}</td>
                        </tr>`
                      : ""
                  }
                  ${
                    order.quantity !== undefined
                      ? `<tr>
                          <td style="padding: 6px 0; color: #a1a1aa;">Quantity:</td>
                          <td style="padding: 6px 0; color: #F5C21B; font-weight: 700;">
                            ${order.quantity} ${order.unit ? escapeHtml(order.unit) : ""}
                          </td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Product Price:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${emailProductPriceText}</td>
                  </tr>
                </table>

                ${inputsFormatted}
              </div>

              <!-- Delivery Details Section -->
              <div style="margin-bottom: 28px;">
                <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #F5C21B; margin: 0 0 12px 0; border-bottom: 1px solid #27272a; padding-bottom: 6px;">
                  🚛 Delivery Info / Առաքման Տվյալներ
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa; width: 130px;">Destination:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">
                      ${safeDeliveryAddress || "No delivery address provided"}
                    </td>
                  </tr>
                  ${
                    order.destinationLatitude !== undefined && order.destinationLongitude !== undefined
                      ? `<tr>
                          <td style="padding: 6px 0; color: #a1a1aa;">Coordinates:</td>
                          <td style="padding: 6px 0; color: #a1a1aa; font-family: monospace; font-size: 12px;">
                            ${order.destinationLatitude.toFixed(6)}, ${order.destinationLongitude.toFixed(6)}
                            ${
                              order.deliveryLocationAdjustedManually
                                ? ` <span style="color: #F5C21B; font-weight: bold;">(Adjusted manually on map)</span>`
                                : ""
                            }
                          </td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Route Distance:</td>
                    <td style="padding: 6px 0; color: #ffffff;">${formatKm(order.deliveryDistanceKm)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Est. Duration:</td>
                    <td style="padding: 6px 0; color: #ffffff;">${formatMinutes(order.estimatedDurationMinutes)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Delivery Cost:</td>
                    <td style="padding: 6px 0; color: #F5C21B; font-weight: 700;">${emailDeliveryCostText}</td>
                  </tr>
                </table>
              </div>

              <!-- Total Estimated Breakdown Box -->
              <div style="padding: 20px; background-color: #18181b; border: 1px solid #F5C21B; border-radius: 12px; text-align: center;">
                <div style="font-size: 12px; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.1em;">
                  Estimated Total Price / Ընդհանուր Հաշվարկ
                </div>
                <div style="font-size: 28px; font-weight: 900; color: #F5C21B; margin-top: 6px; font-family: monospace;">
                  ${emailTotalText}
                </div>
                <div style="font-size: 11px; color: #a1a1aa; margin-top: 4px;">
                  Includes VAT / Ներառյալ ԱԱՀ (VAT included / Ներառյալ ավելացված արժեքի հարկը)
                </div>
                <div style="font-size: 11px; color: #71717a; margin-top: 6px; font-style: italic;">
                  * Website estimate only. Final terms and pricing confirmed by manager upon contact.
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center; font-size: 12px; color: #71717a;">
              VM SHIN GROUP Automated Website Order Notification Service
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain Text Version
  const text = `
==================================================
VM SHIN GROUP — NEW WEBSITE ORDER REQUEST
==================================================

SUBMISSION DETAILS
Date: ${dateFormatted} (Yerevan Time)
Locale: ${locale.toUpperCase()}
Mode: ${modeText}

CUSTOMER CONTACT INFO
Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || "N/A"}
Comment: ${customer.comment || "None"}

PRODUCT DETAILS
Product: ${order.productName}
Variant: ${order.productVariantName || "Default"}
Quantity: ${order.quantity !== undefined ? `${order.quantity} ${order.unit || ""}` : "N/A"}
Product Price: ${emailProductPriceText}

${inputsTextFormatted ? `INPUT PARAMETERS:\n${inputsTextFormatted}\n` : ""}
DELIVERY DETAILS
Destination Address: ${order.deliveryAddress || "N/A"}
Coordinates: ${
    order.destinationLatitude && order.destinationLongitude
      ? `${order.destinationLatitude}, ${order.destinationLongitude}`
      : "N/A"
  }
Route Distance: ${formatKm(order.deliveryDistanceKm)}
Est. Duration: ${formatMinutes(order.estimatedDurationMinutes)}
Delivery Cost: ${emailDeliveryCostText}

ESTIMATED TOTAL PRICE: ${emailTotalText}

* Preliminary website estimate only. Final specifications and price confirmed by manager upon phone contact.
==================================================
  `.trim();

  return { subject, html, text };
}
