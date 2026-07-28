export interface AdminUser {
  id: string;
  email: string;
  role: "admin";
  lastSignInAt?: string;
  createdAt: string;
}

export type AuthErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "CONFIG_ERROR"
  | "INVALID_CREDENTIALS"
  | "INTERNAL_ERROR";

export class AuthError extends Error {
  public readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export interface AuthResult<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: AuthErrorCode;
    message: string;
  };
}
