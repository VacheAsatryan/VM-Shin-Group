import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth.server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

/**
 * Shared Protected Layout Shell for all Admin Panel routes (`/[locale]/admin/*`).
 * Calls `requireAdmin()` once on the server for all dashboard routes.
 * Redirects unauthenticated or unauthorized visitors to `/[locale]/admin/login`.
 */
export default async function AdminDashboardLayout({
  children,
  params,
}: AdminDashboardLayoutProps) {
  const { locale } = await params;

  // Server-side Layout Authorization Guard
  try {
    await requireAdmin();
  } catch {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex flex-col relative overflow-x-hidden">
      {/* Desktop Sidebar (Fixed left) */}
      <AdminSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header */}
        <AdminHeader />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
