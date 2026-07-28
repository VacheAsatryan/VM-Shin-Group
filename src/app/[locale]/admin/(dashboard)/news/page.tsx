import AdminSectionPlaceholder from "@/components/admin/AdminSectionPlaceholder";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminNewsPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <AdminSectionPlaceholder
      sectionKey="news"
      icon="📰"
      locale={locale}
    />
  );
}
