"use client";

import { useState, useActionState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { loginAdminAction, type AdminLoginState } from "@/app/[locale]/admin/login/actions";
import { Button } from "@/components/ui/Button";

interface AdminLoginFormProps {
  locale: string;
}

const initialState: AdminLoginState = {
  success: false,
};

export default function AdminLoginForm({ locale }: AdminLoginFormProps) {
  const t = useTranslations("adminAuth");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const actionWithLocale = loginAdminAction.bind(null, locale);

  const [state, formAction] = useActionState(
    async (prevState: AdminLoginState, formData: FormData) => {
      let result: AdminLoginState = { success: false };
      startTransition(() => {});
      try {
        result = await actionWithLocale(prevState, formData);
      } catch (err) {
        // Next.js redirect throws a special error that must be rethrown
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
      }
      return result;
    },
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Generic Error Alert */}
      {state.errorKey && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300 font-medium animate-in fade-in duration-200"
        >
          <span className="text-base text-red-400">⚠️</span>
          <span>{t(state.errorKey)}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-email"
          className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase"
        >
          {t("emailLabel")} *
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="username"
          placeholder={t("emailPlaceholder")}
          className="w-full bg-background/90 text-text-primary text-sm font-medium rounded-lg px-3.5 py-2.5 border border-gold-border outline-none focus:border-primary-yellow/80 focus:ring-1 focus:ring-primary-yellow/40 transition-all placeholder:text-text-secondary/50"
        />
      </div>

      {/* Password Input with Toggle */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password"
          className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase"
        >
          {t("passwordLabel")} *
        </label>
        <div className="relative flex items-center">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            maxLength={256}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            className="w-full bg-background/90 text-text-primary text-sm font-medium rounded-lg pl-3.5 pr-10 py-2.5 border border-gold-border outline-none focus:border-primary-yellow/80 focus:ring-1 focus:ring-primary-yellow/40 transition-all placeholder:text-text-secondary/50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            title={showPassword ? t("hidePassword") : t("showPassword")}
            className="absolute right-3 p-1 text-text-secondary hover:text-primary-yellow focus:outline-none transition-colors"
          >
            {showPassword ? (
              /* Eye Off Icon */
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 013.122-.813c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.04-4.04a3 3 0 11-4.243-4.243M3 3l18 18" />
              </svg>
            ) : (
              /* Eye Icon */
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={isPending}
        className="w-full mt-2 py-3 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>{t("submittingButton")}</span>
          </>
        ) : (
          <span>{t("submitButton")}</span>
        )}
      </Button>
    </form>
  );
}
