import { requireAdmin } from "@/lib/auth/auth.server";
import AdminNewsForm from "@/components/admin/AdminNewsForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminCreateNewsPage({ params }: PageProps) {
  const { locale } = await params;

  // Enforce Server Admin Authorization
  await requireAdmin();

  return <AdminNewsForm locale={locale} />;
}
