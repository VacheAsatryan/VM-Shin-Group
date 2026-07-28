import { requireAdmin } from "@/lib/auth/auth.server";
import { createClient } from "@/lib/supabase/server";
import AdminNewsManager from "@/components/admin/AdminNewsManager";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminNewsPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Require Server Admin Authorization
  await requireAdmin();

  // 2. Fetch all news articles from Supabase (newest first)
  const supabase = await createClient();
  const { data: newsList, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin News Page DB Query Error]", error.message);
  }

  return (
    <AdminNewsManager
      initialNews={newsList || []}
      queryError={error ? error.message : null}
      locale={locale}
    />
  );
}
