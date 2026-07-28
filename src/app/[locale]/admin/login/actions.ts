"use server";

import { signInAdmin, signOutAdmin } from "@/lib/auth/auth.server";
import { redirect } from "next/navigation";

export interface AdminLoginState {
  success: boolean;
  errorKey?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

/**
 * Server Action for Administrator Login.
 * Performs strict server-side validation and delegates authentication to `signInAdmin()`.
 * Returns a generic error key ("genericError") on failure to prevent account enumeration.
 */
export async function loginAdminAction(
  locale: string,
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");

  const email = typeof emailRaw === "string" ? emailRaw.trim() : "";
  const password = typeof passwordRaw === "string" ? passwordRaw.trim() : "";

  // Server-side Input Validation
  if (!email || !password || email.length > 254 || password.length > 256) {
    return {
      success: false,
      errorKey: "genericError",
    };
  }

  // Basic Email Syntax Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      errorKey: "genericError",
    };
  }

  // Authenticate via Server Supabase Client
  const result = await signInAdmin({ email, password });

  if (!result.success || !result.data) {
    // ALWAYS return generic error to prevent account enumeration
    return {
      success: false,
      errorKey: "genericError",
    };
  }

  // Successful authentication -> redirect to localized admin dashboard root
  redirect(`/${locale}/admin`);
}

/**
 * Server Action for Administrator Logout.
 * Clears session cookies and redirects to the localized login page.
 */
export async function logoutAdminAction(locale: string): Promise<void> {
  await signOutAdmin();
  redirect(`/${locale}/admin/login`);
}
