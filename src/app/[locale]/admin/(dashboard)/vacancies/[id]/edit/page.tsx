import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminCareerForm from "@/components/admin/AdminCareerForm";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditVacancyPage({ params }: PageProps) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const { data: career } = await supabase
    .from("careers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!career) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminCareerForm career={career} locale={locale} />
    </div>
  );
}
