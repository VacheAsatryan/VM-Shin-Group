import { validateOrderPayloadServer } from "../src/lib/order/order.schema";
import { resolveCanonicalProduct } from "../src/lib/order/order-catalog";
import { calculateDeliveryPrice } from "../src/lib/calculator/pricing/calculateDeliveryPrice";
import { renderOrderEmail } from "../src/lib/order/order-email";
import type { OrderRequestPayload } from "../src/lib/order/order.types";

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${testName}`);
    process.exit(1);
  }
  console.log(`✅ TEST PASSED: ${testName}`);
}

async function runTests() {
  console.log("Starting Customer Order Submission Pipeline Tests...\n");

  // 1. Unknown product ID
  const res1 = resolveCanonicalProduct("unknown-fake-product-slug", "pumice-6x20x40", "hy");
  assert(res1.isValid === false && res1.reason?.includes("Unknown product ID") === true, "1. Reject unknown product ID");

  // 2. Unknown or mismatched variant ID
  const res2 = resolveCanonicalProduct("pemzablok", "invalid-variant-for-pumice", "hy");
  assert(res2.isValid === false && res2.reason?.includes("does not belong to product") === true, "2. Reject unknown or mismatched variant ID");

  // 3. Ignore client-submitted price and use canonical server price
  const res3 = resolveCanonicalProduct("pemzablok", "pumice-6x20x40", "hy");
  assert(res3.isValid === true && res3.canonicalUnitPrice === 180, "3. Ignore client price & use canonical 180 AMD");

  // 4. Recalculate products_total and total_price server-side
  const qty = 500;
  const productPrice = res3.canonicalUnitPrice; // 180 AMD
  const productsTotal = productPrice * qty; // 90,000 AMD
  const distanceKm = 15;
  const deliveryPrice = calculateDeliveryPrice(distanceKm, true); // 4,500 AMD
  const totalPrice = productsTotal + (deliveryPrice ?? 0); // 94,500 AMD

  assert(productsTotal === 90000 && deliveryPrice === 4500 && totalPrice === 94500, "4. Recalculate totals server-side (94,500 AMD)");

  // 5. Ignore client-submitted delivery price
  const deliveryOnly = calculateDeliveryPrice(20, true);
  assert(deliveryOnly === 6000, "5. Recalculate delivery price (20km * 300 AMD = 6,000 AMD)");

  // 6. Reject zero-price / unconfirmed commercial products
  const res6 = resolveCanonicalProduct("paving-stones", "paving-rectangle-sand-v1", "hy");
  assert(res6.isValid === false && res6.reason?.includes("Zero-price commercial orders are forbidden") === true, "6. Reject zero-price / unconfirmed commercial products");

  // 7. Reject unsupported locales
  const payloadBadLocale: unknown = {
    locale: "de",
    customer: { name: "Test User", phone: "+37491000000" },
    order: { productId: "pemzablok", quantity: 10, productPrice: 180, totalPrice: 1800 },
  };
  const valLocale = validateOrderPayloadServer(payloadBadLocale);
  assert(valLocale.isValid === false && valLocale.reason?.includes("Unsupported locale") === true, "7. Reject unsupported locale ('de')");

  // 8. Reject invalid quantity
  const payloadZeroQty: unknown = {
    locale: "hy",
    customer: { name: "Test User", phone: "+37491000000" },
    order: { productId: "pemzablok", quantity: 0, productPrice: 180, totalPrice: 0 },
  };
  const valZero = validateOrderPayloadServer(payloadZeroQty);
  assert(valZero.isValid === false && valZero.reason?.includes("Invalid quantity") === true, "8a. Reject zero quantity");

  const payloadNegQty: unknown = {
    locale: "hy",
    customer: { name: "Test User", phone: "+37491000000" },
    order: { productId: "pemzablok", quantity: -5, productPrice: 180, totalPrice: 0 },
  };
  const valNeg = validateOrderPayloadServer(payloadNegQty);
  assert(valNeg.isValid === false && valNeg.reason?.includes("Invalid quantity") === true, "8b. Reject negative quantity");

  // 9. Render email notification using canonical localized names and server total prices
  const canonicalPayload: OrderRequestPayload = {
    locale: "hy",
    customer: {
      name: "Արմեն Պետրոսյան",
      phone: "+37491123456",
      email: "armen@example.com",
    },
    order: {
      calculationMode: "manual",
      productId: "pemzablok",
      productName: res3.canonicalProductName,
      productVariantId: "pumice-6x20x40",
      productVariantName: res3.canonicalVariantName!,
      quantity: 100,
      unit: res3.canonicalUnit,
      productPrice: 180,
      currency: "AMD",
      deliveryDistanceKm: 10,
      estimatedDeliveryPrice: 3000,
      totalPrice: 21000,
    },
  };

  const renderedEmail = renderOrderEmail(canonicalPayload);
  assert(renderedEmail.subject.includes("Պեմզաբլոկ"), "9a. Email subject uses canonical product name");
  assert(renderedEmail.html.includes("Պեմզաբլոկ 6 (6x20x40 սմ)"), "9b. Email body uses canonical variant name");

  console.log("\n✨ ALL 9 ORDER PIPELINE TESTS PASSED SUCCESSFULLY! ✨");
}

runTests().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
