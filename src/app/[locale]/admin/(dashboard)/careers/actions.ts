"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth.server";
import { createClient } from "@/lib/supabase/server";
import type { CareerInsert, CareerStatus, CareerUpdate, EmploymentType, SupportedLocale } from "@/lib/supabase/types";
import { slugifyText, generateAutoSlug } from "@/lib/utils/slugify";

export type CareerActionResult =
  | { success: true; careerId: string; slug: string }
  | { success: false; code: string; message: string; fieldErrors?: Record<string, string> };

function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 1 && slug.length <= 150;
}

function validateImageUrl(url: string): boolean {
  if (!url) return true;
  if (url.length > 1000) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
}

export async function createCareerAction(
  locale: string,
  formData: FormData
): Promise<CareerActionResult> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const requestedSource = (formData.get("source_locale") as string || "").trim();
    const sourceLocale: SupportedLocale =
      requestedSource === "ru" || requestedSource === "en" || requestedSource === "hy"
        ? requestedSource
        : locale === "ru" || locale === "en" || locale === "hy"
        ? (locale as SupportedLocale)
        : "hy";

    const status = (formData.get("status") as CareerStatus) || "draft";
    const publishedAtInput = (formData.get("published_at") as string || "").trim();
    const coverImageUrl = (formData.get("cover_image_url") as string || "").trim();
    const department = (formData.get("department") as string || "").trim() || null;
    const location = (formData.get("location") as string || "").trim() || null;
    
    const empTypeRaw = (formData.get("employment_type") as string || "").trim();
    const employmentType: EmploymentType | null =
      empTypeRaw === "full_time" || empTypeRaw === "part_time" || empTypeRaw === "contract" || empTypeRaw === "internship"
        ? empTypeRaw
        : null;

    const salaryFromRaw = (formData.get("salary_from") as string || "").trim();
    const salaryToRaw = (formData.get("salary_to") as string || "").trim();
    const currency = (formData.get("currency") as string || "").trim() || "AMD";

    const salaryFrom = salaryFromRaw ? Number(salaryFromRaw) : null;
    const salaryTo = salaryToRaw ? Number(salaryToRaw) : null;

    const applicationEmail = (formData.get("application_email") as string || "").trim() || null;

    const appInstHy = (formData.get("application_instructions_hy") as string || "").trim() || null;
    const appInstRu = (formData.get("application_instructions_ru") as string || "").trim() || null;
    const appInstEn = (formData.get("application_instructions_en") as string || "").trim() || null;

    const titleHy = (formData.get("title_hy") as string || "").trim();
    const titleRu = (formData.get("title_ru") as string || "").trim();
    const titleEn = (formData.get("title_en") as string || "").trim();

    const summaryHy = (formData.get("summary_hy") as string || "").trim();
    const summaryRu = (formData.get("summary_ru") as string || "").trim();
    const summaryEn = (formData.get("summary_en") as string || "").trim();

    const contentHy = (formData.get("content_hy") as string || "").trim();
    const contentRu = (formData.get("content_ru") as string || "").trim();
    const contentEn = (formData.get("content_en") as string || "").trim();

    const fieldErrors: Record<string, string> = {};

    if (applicationEmail && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(applicationEmail)) {
      fieldErrors.application_email = "Please enter a valid email address (e.g., hr@vmshin.am)";
    }

    const titles: Record<SupportedLocale, string> = { hy: titleHy, ru: titleRu, en: titleEn };
    const summaries: Record<SupportedLocale, string> = { hy: summaryHy, ru: summaryRu, en: summaryEn };
    const contents: Record<SupportedLocale, string> = { hy: contentHy, ru: contentRu, en: contentEn };

    const sourceTitle = titles[sourceLocale];
    const sourceSummary = summaries[sourceLocale];
    const sourceContent = contents[sourceLocale];

    if (!sourceTitle || sourceTitle.length > 200) {
      fieldErrors[`title_${sourceLocale}`] = `Title for ${sourceLocale.toUpperCase()} is required (max 200 chars).`;
    }
    if (!sourceSummary || sourceSummary.length > 500) {
      fieldErrors[`summary_${sourceLocale}`] = `Summary for ${sourceLocale.toUpperCase()} is required (max 500 chars).`;
    }
    if (!sourceContent) {
      fieldErrors[`content_${sourceLocale}`] = `Content for ${sourceLocale.toUpperCase()} is required.`;
    }

    const allLocales: SupportedLocale[] = ["hy", "ru", "en"];
    for (const loc of allLocales) {
      if (loc === sourceLocale) continue;

      const tVal = titles[loc];
      const sVal = summaries[loc];
      const cVal = contents[loc];

      const hasAny = Boolean(tVal || sVal || cVal);

      if (hasAny) {
        if (!tVal || tVal.length > 200) {
          fieldErrors[`title_${loc}`] = `Title for ${loc.toUpperCase()} is required when translation is started.`;
        }
        if (!sVal || sVal.length > 500) {
          fieldErrors[`summary_${loc}`] = `Summary for ${loc.toUpperCase()} is required when translation is started.`;
        }
        if (!cVal) {
          fieldErrors[`content_${loc}`] = `Content for ${loc.toUpperCase()} is required when translation is started.`;
        }
      }
    }

    let rawSlug = (formData.get("slug") as string || "").trim();
    if (!rawSlug) {
      const otherLocales = allLocales.filter((l) => l !== sourceLocale);
      rawSlug = generateAutoSlug(sourceTitle, titles[otherLocales[0]] || "", titles[otherLocales[1]] || "");
    } else {
      rawSlug = slugifyText(rawSlug) || generateAutoSlug(sourceTitle, "", "");
    }

    if (!validateSlug(rawSlug)) {
      fieldErrors.slug = "Slug must be lowercase, 1-150 characters, and URL-safe";
    }

    if (coverImageUrl && !validateImageUrl(coverImageUrl)) {
      fieldErrors.cover_image_url = "Cover image URL must start with http://, https://, or /";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors,
      };
    }

    let publishedAt: string | null = null;
    if (status === "published") {
      if (publishedAtInput) {
        const parsedDate = new Date(publishedAtInput);
        publishedAt = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
      } else {
        publishedAt = new Date().toISOString();
      }
    } else if (publishedAtInput) {
      const parsedDate = new Date(publishedAtInput);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    // Auto unique slug suffix (-2, -3...)
    let finalSlug = rawSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("careers")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (!existing) {
        break;
      }
      counter++;
      finalSlug = `${rawSlug.slice(0, 110)}-${counter}`;
    }

    const newCareer: CareerInsert = {
      slug: finalSlug,
      source_locale: sourceLocale,
      status,
      published_at: publishedAt,
      department,
      location,
      employment_type: employmentType,
      salary_from: salaryFrom,
      salary_to: salaryTo,
      currency,
      cover_image_url: coverImageUrl || null,
      application_email: applicationEmail,
      application_instructions_hy: appInstHy,
      application_instructions_ru: appInstRu,
      application_instructions_en: appInstEn,
      title_hy: titleHy || null,
      title_ru: titleRu || null,
      title_en: titleEn || null,
      summary_hy: summaryHy || null,
      summary_ru: summaryRu || null,
      summary_en: summaryEn || null,
      content_hy: contentHy || null,
      content_ru: contentRu || null,
      content_en: contentEn || null,
    };

    const { data: insertedRow, error: insertError } = await supabase
      .from("careers")
      .insert(newCareer)
      .select("id, slug, status, published_at, source_locale")
      .single();

    if (insertError || !insertedRow || !insertedRow.id) {
      return {
        success: false,
        code: insertError?.code || "DB_INSERT_ERROR",
        message: insertError?.message || "Failed to create vacancy in database.",
      };
    }

    revalidatePath("/admin/vacancies");
    revalidatePath(`/${locale}/admin/vacancies`);
    revalidatePath("/careers");
    revalidatePath(`/${locale}/careers`);
    revalidatePath(`/${locale}/careers/${insertedRow.slug}`);

    return {
      success: true,
      careerId: insertedRow.id,
      slug: insertedRow.slug,
    };
  } catch (err) {
    return {
      success: false,
      code: "UNAUTHORIZED_OR_SERVER_ERROR",
      message: err instanceof Error ? err.message : "Server error or unauthorized.",
    };
  }
}

export async function updateCareerAction(
  id: string,
  locale: string,
  formData: FormData
): Promise<CareerActionResult> {
  try {
    await requireAdmin();
    if (!id || typeof id !== "string") {
      return { success: false, code: "INVALID_ID", message: "Invalid vacancy ID" };
    }

    const supabase = await createClient();

    const { data: existingCareer } = await supabase
      .from("careers")
      .select("source_locale")
      .eq("id", id)
      .single();

    const requestedSource = (formData.get("source_locale") as string || "").trim();
    const sourceLocale: SupportedLocale =
      requestedSource === "ru" || requestedSource === "en" || requestedSource === "hy"
        ? requestedSource
        : existingCareer?.source_locale || "hy";

    const status = (formData.get("status") as CareerStatus) || "draft";
    const publishedAtInput = (formData.get("published_at") as string || "").trim();
    const coverImageUrl = (formData.get("cover_image_url") as string || "").trim();
    const department = (formData.get("department") as string || "").trim() || null;
    const location = (formData.get("location") as string || "").trim() || null;

    const empTypeRaw = (formData.get("employment_type") as string || "").trim();
    const employmentType: EmploymentType | null =
      empTypeRaw === "full_time" || empTypeRaw === "part_time" || empTypeRaw === "contract" || empTypeRaw === "internship"
        ? empTypeRaw
        : null;

    const salaryFromRaw = (formData.get("salary_from") as string || "").trim();
    const salaryToRaw = (formData.get("salary_to") as string || "").trim();
    const currency = (formData.get("currency") as string || "").trim() || "AMD";

    const salaryFrom = salaryFromRaw ? Number(salaryFromRaw) : null;
    const salaryTo = salaryToRaw ? Number(salaryToRaw) : null;

    const applicationEmail = (formData.get("application_email") as string || "").trim() || null;

    const appInstHy = (formData.get("application_instructions_hy") as string || "").trim() || null;
    const appInstRu = (formData.get("application_instructions_ru") as string || "").trim() || null;
    const appInstEn = (formData.get("application_instructions_en") as string || "").trim() || null;

    const titleHy = (formData.get("title_hy") as string || "").trim();
    const titleRu = (formData.get("title_ru") as string || "").trim();
    const titleEn = (formData.get("title_en") as string || "").trim();

    const summaryHy = (formData.get("summary_hy") as string || "").trim();
    const summaryRu = (formData.get("summary_ru") as string || "").trim();
    const summaryEn = (formData.get("summary_en") as string || "").trim();

    const contentHy = (formData.get("content_hy") as string || "").trim();
    const contentRu = (formData.get("content_ru") as string || "").trim();
    const contentEn = (formData.get("content_en") as string || "").trim();

    const fieldErrors: Record<string, string> = {};

    if (applicationEmail && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(applicationEmail)) {
      fieldErrors.application_email = "Please enter a valid email address (e.g., hr@vmshin.am)";
    }

    const titles: Record<SupportedLocale, string> = { hy: titleHy, ru: titleRu, en: titleEn };
    const summaries: Record<SupportedLocale, string> = { hy: summaryHy, ru: summaryRu, en: summaryEn };
    const contents: Record<SupportedLocale, string> = { hy: contentHy, ru: contentRu, en: contentEn };

    const sourceTitle = titles[sourceLocale];
    const sourceSummary = summaries[sourceLocale];
    const sourceContent = contents[sourceLocale];

    if (!sourceTitle || sourceTitle.length > 200) {
      fieldErrors[`title_${sourceLocale}`] = `Title for ${sourceLocale.toUpperCase()} is required (max 200 chars).`;
    }
    if (!sourceSummary || sourceSummary.length > 500) {
      fieldErrors[`summary_${sourceLocale}`] = `Summary for ${sourceLocale.toUpperCase()} is required (max 500 chars).`;
    }
    if (!sourceContent) {
      fieldErrors[`content_${sourceLocale}`] = `Content for ${sourceLocale.toUpperCase()} is required.`;
    }

    const allLocales: SupportedLocale[] = ["hy", "ru", "en"];
    for (const loc of allLocales) {
      if (loc === sourceLocale) continue;

      const tVal = titles[loc];
      const sVal = summaries[loc];
      const cVal = contents[loc];

      const hasAny = Boolean(tVal || sVal || cVal);

      if (hasAny) {
        if (!tVal || tVal.length > 200) {
          fieldErrors[`title_${loc}`] = `Title for ${loc.toUpperCase()} is required when translation is started.`;
        }
        if (!sVal || sVal.length > 500) {
          fieldErrors[`summary_${loc}`] = `Summary for ${loc.toUpperCase()} is required when translation is started.`;
        }
        if (!cVal) {
          fieldErrors[`content_${loc}`] = `Content for ${loc.toUpperCase()} is required when translation is started.`;
        }
      }
    }

    let rawSlug = (formData.get("slug") as string || "").trim();
    if (!rawSlug) {
      const otherLocales = allLocales.filter((l) => l !== sourceLocale);
      rawSlug = generateAutoSlug(sourceTitle, titles[otherLocales[0]] || "", titles[otherLocales[1]] || "");
    } else {
      rawSlug = slugifyText(rawSlug) || generateAutoSlug(sourceTitle, "", "");
    }

    if (!validateSlug(rawSlug)) {
      fieldErrors.slug = "Slug must be lowercase, 1-150 characters, and URL-safe";
    }

    if (coverImageUrl && !validateImageUrl(coverImageUrl)) {
      fieldErrors.cover_image_url = "Cover image URL must start with http://, https://, or /";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors,
      };
    }

    let finalSlug = rawSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("careers")
        .select("id")
        .eq("slug", finalSlug)
        .neq("id", id)
        .maybeSingle();

      if (!existing) {
        break;
      }
      counter++;
      finalSlug = `${rawSlug.slice(0, 110)}-${counter}`;
    }

    let publishedAt: string | null = null;
    if (status === "published") {
      if (publishedAtInput) {
        const parsedDate = new Date(publishedAtInput);
        publishedAt = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
      } else {
        publishedAt = new Date().toISOString();
      }
    } else if (publishedAtInput) {
      const parsedDate = new Date(publishedAtInput);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    const updatePayload: CareerUpdate = {
      slug: finalSlug,
      source_locale: sourceLocale,
      status,
      published_at: publishedAt,
      department,
      location,
      employment_type: employmentType,
      salary_from: salaryFrom,
      salary_to: salaryTo,
      currency,
      cover_image_url: coverImageUrl || null,
      application_email: applicationEmail,
      application_instructions_hy: appInstHy,
      application_instructions_ru: appInstRu,
      application_instructions_en: appInstEn,
      title_hy: titleHy || null,
      title_ru: titleRu || null,
      title_en: titleEn || null,
      summary_hy: summaryHy || null,
      summary_ru: summaryRu || null,
      summary_en: summaryEn || null,
      content_hy: contentHy || null,
      content_ru: contentRu || null,
      content_en: contentEn || null,
    };

    const { data: updatedRow, error: updateError } = await supabase
      .from("careers")
      .update(updatePayload)
      .eq("id", id)
      .select("id, slug, status, published_at, source_locale")
      .single();

    if (updateError || !updatedRow || !updatedRow.id) {
      return {
        success: false,
        code: "DB_UPDATE_ERROR",
        message: updateError?.message || "Failed to update vacancy in database.",
      };
    }

    revalidatePath("/admin/vacancies");
    revalidatePath(`/${locale}/admin/vacancies`);
    revalidatePath(`/admin/vacancies/${id}/edit`);
    revalidatePath(`/${locale}/admin/vacancies/${id}/edit`);
    revalidatePath("/careers");
    revalidatePath(`/${locale}/careers`);
    revalidatePath(`/${locale}/careers/${updatedRow.slug}`);

    return {
      success: true,
      careerId: updatedRow.id,
      slug: updatedRow.slug,
    };
  } catch (err) {
    return {
      success: false,
      code: "UNAUTHORIZED_OR_SERVER_ERROR",
      message: err instanceof Error ? err.message : "Server error or unauthorized.",
    };
  }
}

export async function deleteCareerAction(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin();
    if (!id || typeof id !== "string") {
      return { success: false, message: "Invalid vacancy ID" };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("careers").delete().eq("id", id);

    if (error) {
      return { success: false, message: error.message || "Failed to delete vacancy" };
    }

    revalidatePath("/admin/vacancies");
    revalidatePath("/careers");

    return { success: true };
  } catch {
    return { success: false, message: "Unauthorized or server error" };
  }
}
