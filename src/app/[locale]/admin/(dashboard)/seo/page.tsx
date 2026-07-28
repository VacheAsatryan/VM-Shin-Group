import AdminSectionPlaceholder from "@/components/admin/AdminSectionPlaceholder";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSeoPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <AdminSectionPlaceholder
      sectionKey="seo"
      icon="🔍"
      locale={locale}
    />
  );
}
