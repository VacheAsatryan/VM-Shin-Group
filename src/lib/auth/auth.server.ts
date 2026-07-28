import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "./auth.config";
import {
  AuthError,
  type AdminUser,
  type AuthResult,
  type AuthErrorCode,
} from "./auth.types";

/**
 * Retrieves and authorizes the current administrator user.
 * Fails closed if ADMIN_EMAIL is missing/unconfigured, user is unauthenticated, or email does not match.
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const adminEmail = getAdminEmail();

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email || !user.email.trim()) {
      return null;
    }

    const authenticatedEmail = user.email.trim().toLowerCase();

    if (authenticatedEmail !== adminEmail) {
      return null;
    }

    return {
      id: user.id,
      email: authenticatedEmail,
      role: "admin",
      lastSignInAt: user.last_sign_in_at,
      createdAt: user.created_at,
    };
  } catch {
    // Fail closed on configuration or network error
    return null;
  }
}

/**
 * Server authorization guard that enforces administrator access.
 * Throws typed `AuthError` if the requester is unauthenticated, unauthorized, or ADMIN_EMAIL configuration is missing.
 */
export async function requireAdmin(): Promise<AdminUser> {
  let adminEmail: string;
  try {
    adminEmail = getAdminEmail();
  } catch (configErr) {
    throw new AuthError(
      "CONFIG_ERROR",
      configErr instanceof Error ? configErr.message : "Server authentication configuration missing."
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email || !user.email.trim()) {
    throw new AuthError(
      "UNAUTHENTICATED",
      "Authentication required. No valid authenticated user session."
    );
  }

  const authenticatedEmail = user.email.trim().toLowerCase();

  if (authenticatedEmail !== adminEmail) {
    throw new AuthError(
      "UNAUTHORIZED",
      "Access denied. User email does not match administrator authorization criteria."
    );
  }

  return {
    id: user.id,
    email: authenticatedEmail,
    role: "admin",
    lastSignInAt: user.last_sign_in_at,
    createdAt: user.created_at,
  };
}

/**
 * Non-throwing server authorization helper.
 * Returns an authorization state object for conditional rendering or status checks.
 */
export async function requireAdminOrNull(): Promise<{
  isAuthorized: boolean;
  user: AdminUser | null;
  errorCode?: AuthErrorCode;
}> {
  let adminEmail: string;
  try {
    adminEmail = getAdminEmail();
  } catch {
    return {
      isAuthorized: false,
      user: null,
      errorCode: "CONFIG_ERROR",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email || !user.email.trim()) {
    return {
      isAuthorized: false,
      user: null,
      errorCode: "UNAUTHENTICATED",
    };
  }

  const authenticatedEmail = user.email.trim().toLowerCase();

  if (authenticatedEmail !== adminEmail) {
    return {
      isAuthorized: false,
      user: null,
      errorCode: "UNAUTHORIZED",
    };
  }

  return {
    isAuthorized: true,
    user: {
      id: user.id,
      email: authenticatedEmail,
      role: "admin",
      lastSignInAt: user.last_sign_in_at,
      createdAt: user.created_at,
    },
  };
}

/**
 * Server authentication helper for admin credential verification.
 * Relies entirely on official `@supabase/ssr` server client for session & cookie management.
 */
export async function signInAdmin(credentials: {
  email: string;
  password: string;
}): Promise<AuthResult<AdminUser>> {
  try {
    const adminEmail = getAdminEmail();
    const inputEmail = credentials.email.trim().toLowerCase();

    if (inputEmail !== adminEmail) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid administrator credentials.",
        },
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: inputEmail,
      password: credentials.password,
    });

    if (error || !data.user || !data.user.email) {
      return {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: error?.message || "Invalid credentials provided.",
        },
      };
    }

    const authenticatedEmail = data.user.email.trim().toLowerCase();
    if (authenticatedEmail !== adminEmail) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authenticated email does not match mandatory ADMIN_EMAIL.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: data.user.id,
        email: authenticatedEmail,
        role: "admin",
        lastSignInAt: data.user.last_sign_in_at,
        createdAt: data.user.created_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: err instanceof AuthError && err.code === "CONFIG_ERROR" ? "CONFIG_ERROR" : "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Authentication error",
      },
    };
  }
}

/**
 * Server sign-out helper that terminates the session.
 * Relies entirely on official `@supabase/ssr` server client for cookie purging.
 */
export async function signOutAdmin(): Promise<AuthResult<void>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message,
        },
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Sign out error",
      },
    };
  }
}
