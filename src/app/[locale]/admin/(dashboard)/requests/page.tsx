import { requireAdmin } from "@/lib/auth/auth.server";
import { createClient } from "@/lib/supabase/server";
import AdminRequestsManager from "@/components/admin/AdminRequestsManager";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminRequestsPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Require Server Admin Authorization
  await requireAdmin();

  // 2. Fetch order requests from Supabase (newest first)
  const supabase = await createClient();
  const { data: orderRequests } = await supabase
    .from("order_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminRequestsManager
      initialRequests={orderRequests || []}
      locale={locale}
    />
  );
}
