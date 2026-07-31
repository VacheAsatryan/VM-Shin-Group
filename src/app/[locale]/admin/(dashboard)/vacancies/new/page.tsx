import AdminCareerForm from "@/components/admin/AdminCareerForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewVacancyPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="space-y-6">
      <AdminCareerForm locale={locale} />
    </div>
  );
}
