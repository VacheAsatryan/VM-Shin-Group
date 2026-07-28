import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth.server";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

interface AdminLoginPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { locale } = await params;

  // Server-side check: if administrator is already logged in, redirect immediately to /[locale]/admin
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect(`/${locale}/admin`);
  }

  const t = await getTranslations({ locale, namespace: "adminAuth" });

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Background Soft Glow Accents */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md bg-surface border border-gold-border rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col">
        {/* Top Metallic Gold Accent Line */}
        <div
          className="h-1 w-full bg-gradient-to-r from-transparent via-primary-yellow to-transparent"
          aria-hidden="true"
        />

        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl sm:text-2xl font-black text-text-primary uppercase tracking-tight">
              {t("loginTitle")}
            </h1>
            <p className="text-xs text-text-secondary font-medium">
              {t("loginSubtitle")}
            </p>
          </div>

          <div className="h-px bg-gold-border/40 w-full" aria-hidden="true" />

          {/* Login Form */}
          <AdminLoginForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
