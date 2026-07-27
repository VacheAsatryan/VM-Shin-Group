export const DEFAULT_NOTIFICATION_EMAIL = "vm.shingroup@gmail.com";
export const DEFAULT_FROM_EMAIL = "VM SHIN GROUP Website <onboarding@resend.dev>";

export function getResendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.trim() === "") {
    return undefined;
  }
  return key.trim();
}

export function getNotificationEmail(): string {
  const email = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!email || email.trim() === "") {
    return DEFAULT_NOTIFICATION_EMAIL;
  }
  return email.trim();
}

export function getFromEmail(): string {
  const from = process.env.ORDER_FROM_EMAIL;
  if (!from || from.trim() === "") {
    return DEFAULT_FROM_EMAIL;
  }
  return from.trim();
}

export function isOrderEmailConfigured(): boolean {
  return getResendApiKey() !== undefined;
}
