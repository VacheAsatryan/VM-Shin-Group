import { createClient } from "@/lib/supabase/server";
import type { CareerRow } from "@/lib/supabase/types";
import AdminCareersManager from "@/components/admin/AdminCareersManager";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminVacanciesPage({ params }: PageProps) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: careers } = await supabase
    .from("careers")
    .select("*")
    .order("created_at", { ascending: false });

  const vacanciesList: CareerRow[] = careers || [];

  return (
    <div className="space-y-6">
      <AdminCareersManager initialVacancies={vacanciesList} locale={locale} />
    </div>
  );
}
