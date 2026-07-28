import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth.server";
import { createClient } from "@/lib/supabase/server";
import AdminNewsForm from "@/components/admin/AdminNewsForm";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AdminEditNewsPage({ params }: PageProps) {
  const { locale, id } = await params;

  // 1. Require Server Admin Authorization
  await requireAdmin();

  // 2. Fetch existing article
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!article) {
    notFound();
  }

  return <AdminNewsForm article={article} locale={locale} />;
}
