import AdminSectionPlaceholder from "@/components/admin/AdminSectionPlaceholder";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDocumentsPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <AdminSectionPlaceholder
      sectionKey="documents"
      icon="📜"
      locale={locale}
    />
  );
}
