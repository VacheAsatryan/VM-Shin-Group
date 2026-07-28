export interface AdminAuthConfig {
  readonly allowPublicSignup: false;
  readonly adminEmail: string;
}

/**
 * Returns the mandatory normalized admin email from environment variables.
 * Fails closed by throwing an Error if ADMIN_EMAIL is missing or empty.
 */
export function getAdminEmail(): string {
  const rawEmail = process.env.ADMIN_EMAIL;

  if (!rawEmail || !rawEmail.trim()) {
    throw new Error(
      "[Auth Config Error] Mandatory environment variable ADMIN_EMAIL is missing or empty. Server failing closed."
    );
  }

  return rawEmail.trim().toLowerCase();
}

/**
 * Returns single-admin authorization configuration.
 * Public signups are explicitly disabled.
 */
export function getAdminAuthConfig(): AdminAuthConfig {
  const adminEmail = getAdminEmail();

  return {
    allowPublicSignup: false,
    adminEmail,
  };
}
