import AdminSectionPlaceholder from "@/components/admin/AdminSectionPlaceholder";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminVacanciesPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <AdminSectionPlaceholder
      sectionKey="vacancies"
      icon="💼"
      locale={locale}
    />
  );
}
