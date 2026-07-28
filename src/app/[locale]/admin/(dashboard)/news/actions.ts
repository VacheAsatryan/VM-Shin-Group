"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth.server";
import { createClient } from "@/lib/supabase/server";
import type { NewsInsert, NewsStatus, NewsUpdate } from "@/lib/supabase/types";
import { slugifyText, generateAutoSlug } from "@/lib/utils/slugify";

export type NewsActionResult =
  | { success: true; newsId: string; slug: string }
  | { success: false; code: string; message: string; fieldErrors?: Record<string, string> };

function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 1 && slug.length <= 150;
}

function validateImageUrl(url: string): boolean {
  if (!url) return true;
  if (url.length > 1000) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
}

export async function createNewsAction(
  locale: string,
  formData: FormData
): Promise<NewsActionResult> {
  try {
    // 1. Authorize Admin Server Session
    await requireAdmin();
    const supabase = await createClient();

    // 2. Parse & Sanitize Inputs
    const status = (formData.get("status") as NewsStatus) || "draft";
    const publishedAtInput = (formData.get("published_at") as string || "").trim();
    const coverImageUrl = (formData.get("cover_image_url") as string || "").trim();

    const titleHy = (formData.get("title_hy") as string || "").trim();
    const titleRu = (formData.get("title_ru") as string || "").trim();
    const titleEn = (formData.get("title_en") as string || "").trim();

    const excerptHy = (formData.get("excerpt_hy") as string || "").trim();
    const excerptRu = (formData.get("excerpt_ru") as string || "").trim();
    const excerptEn = (formData.get("excerpt_en") as string || "").trim();

    const contentHy = (formData.get("content_hy") as string || "").trim();
    const contentRu = (formData.get("content_ru") as string || "").trim();
    const contentEn = (formData.get("content_en") as string || "").trim();

    let rawSlug = (formData.get("slug") as string || "").trim();

    // Auto-generate slug if not manually provided
    if (!rawSlug) {
      rawSlug = generateAutoSlug(titleEn, titleRu, titleHy);
    } else {
      rawSlug = slugifyText(rawSlug) || generateAutoSlug(titleEn, titleRu, titleHy);
    }

    // 3. Server Field Validation
    const fieldErrors: Record<string, string> = {};

    if (!validateSlug(rawSlug)) {
      fieldErrors.slug = "Slug must be lowercase, 1-150 characters, and URL-safe";
    }
    if (!titleHy || titleHy.length > 200) fieldErrors.title_hy = "Armenian title is required (max 200 chars)";
    if (!titleRu || titleRu.length > 200) fieldErrors.title_ru = "Russian title is required (max 200 chars)";
    if (!titleEn || titleEn.length > 200) fieldErrors.title_en = "English title is required (max 200 chars)";

    if (!excerptHy || excerptHy.length > 500) fieldErrors.excerpt_hy = "Armenian excerpt is required (max 500 chars)";
    if (!excerptRu || excerptRu.length > 500) fieldErrors.excerpt_ru = "Russian excerpt is required (max 500 chars)";
    if (!excerptEn || excerptEn.length > 500) fieldErrors.excerpt_en = "English excerpt is required (max 500 chars)";

    if (!contentHy) fieldErrors.content_hy = "Armenian content is required";
    if (!contentRu) fieldErrors.content_ru = "Russian content is required";
    if (!contentEn) fieldErrors.content_en = "English content is required";

    if (coverImageUrl && !validateImageUrl(coverImageUrl)) {
      fieldErrors.cover_image_url = "Cover image URL must start with http://, https://, or /";
    }

    if (Object.keys(fieldErrors).length > 0) {
      const firstKey = Object.keys(fieldErrors)[0];
      const invalidTab = firstKey.endsWith("_hy") ? "hy" : firstKey.endsWith("_ru") ? "ru" : firstKey.endsWith("_en") ? "en" : "general";

      console.log("[SAFE VALIDATION RESULT]", {
        fieldErrorsKeys: Object.keys(fieldErrors),
        firstInvalidField: firstKey,
        invalidTab,
        submittedLengths: {
          title_hy: titleHy.length,
          title_ru: titleRu.length,
          title_en: titleEn.length,
          excerpt_hy: excerptHy.length,
          excerpt_ru: excerptRu.length,
          excerpt_en: excerptEn.length,
          content_hy: contentHy.length,
          content_ru: contentRu.length,
          content_en: contentEn.length,
        },
      });

      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors,
      };
    }

    // 4. Timezone & Datetime Parsing
    let publishedAt: string | null = null;
    if (status === "published") {
      if (publishedAtInput) {
        const parsedDate = new Date(publishedAtInput);
        if (isNaN(parsedDate.getTime())) {
          return {
            success: false,
            code: "INVALID_DATE",
            message: "Invalid publication date format.",
            fieldErrors: { published_at: "Invalid publication date." },
          };
        }
        publishedAt = parsedDate.toISOString();
      } else {
        publishedAt = new Date().toISOString();
      }
    } else if (publishedAtInput) {
      const parsedDate = new Date(publishedAtInput);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    // 5. Automatic Unique Slug Suffix Resolving (-2, -3, -4...)
    let finalSlug = rawSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("news")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (!existing) {
        break;
      }
      counter++;
      finalSlug = `${rawSlug.slice(0, 110)}-${counter}`;
    }

    // 6. DB Insert with .select('id, slug, status, published_at').single()
    const newArticle: NewsInsert = {
      slug: finalSlug,
      status,
      published_at: publishedAt,
      cover_image_url: coverImageUrl || null,
      title_hy: titleHy,
      title_ru: titleRu,
      title_en: titleEn,
      excerpt_hy: excerptHy,
      excerpt_ru: excerptRu,
      excerpt_en: excerptEn,
      content_hy: contentHy,
      content_ru: contentRu,
      content_en: contentEn,
    };

    const { data: insertedRow, error: insertError } = await supabase
      .from("news")
      .insert(newArticle)
      .select("id, slug, status, published_at")
      .single();

    if (insertError || !insertedRow || !insertedRow.id) {
      console.error("[Create News DB Insert Failure]", insertError?.message || "No inserted row returned");
      return {
        success: false,
        code: insertError?.code || "DB_INSERT_ERROR",
        message: insertError?.message || "Database insert failed. No row was created.",
      };
    }

    // 7. Comprehensive Cache Revalidation
    revalidatePath("/admin/news");
    revalidatePath(`/${locale}/admin/news`);
    revalidatePath("/news");
    revalidatePath(`/${locale}/news`);
    revalidatePath(`/${locale}/news/${insertedRow.slug}`);

    return {
      success: true,
      newsId: insertedRow.id,
      slug: insertedRow.slug,
    };
  } catch (err) {
    console.error("[Create News Exception]", err instanceof Error ? err.message : String(err));
    return {
      success: false,
      code: "UNAUTHORIZED_OR_SERVER_ERROR",
      message: err instanceof Error ? err.message : "Unauthorized or server exception occurred.",
    };
  }
}

export async function updateNewsAction(
  id: string,
  locale: string,
  formData: FormData
): Promise<NewsActionResult> {
  try {
    await requireAdmin();

    if (!id || typeof id !== "string") {
      return {
        success: false,
        code: "INVALID_ID",
        message: "Invalid article ID.",
      };
    }

    const status = (formData.get("status") as NewsStatus) || "draft";
    const publishedAtInput = (formData.get("published_at") as string || "").trim();
    const coverImageUrl = (formData.get("cover_image_url") as string || "").trim();

    const titleHy = (formData.get("title_hy") as string || "").trim();
    const titleRu = (formData.get("title_ru") as string || "").trim();
    const titleEn = (formData.get("title_en") as string || "").trim();

    const excerptHy = (formData.get("excerpt_hy") as string || "").trim();
    const excerptRu = (formData.get("excerpt_ru") as string || "").trim();
    const excerptEn = (formData.get("excerpt_en") as string || "").trim();

    const contentHy = (formData.get("content_hy") as string || "").trim();
    const contentRu = (formData.get("content_ru") as string || "").trim();
    const contentEn = (formData.get("content_en") as string || "").trim();

    let rawSlug = (formData.get("slug") as string || "").trim();
    if (!rawSlug) {
      rawSlug = generateAutoSlug(titleEn, titleRu, titleHy);
    } else {
      rawSlug = slugifyText(rawSlug) || generateAutoSlug(titleEn, titleRu, titleHy);
    }

    const fieldErrors: Record<string, string> = {};

    if (!validateSlug(rawSlug)) {
      fieldErrors.slug = "Slug must be lowercase, 1-150 characters, and URL-safe";
    }
    if (!titleHy || titleHy.length > 200) fieldErrors.title_hy = "Armenian title is required (max 200 chars)";
    if (!titleRu || titleRu.length > 200) fieldErrors.title_ru = "Russian title is required (max 200 chars)";
    if (!titleEn || titleEn.length > 200) fieldErrors.title_en = "English title is required (max 200 chars)";

    if (!excerptHy || excerptHy.length > 500) fieldErrors.excerpt_hy = "Armenian excerpt is required (max 500 chars)";
    if (!excerptRu || excerptRu.length > 500) fieldErrors.excerpt_ru = "Russian excerpt is required (max 500 chars)";
    if (!excerptEn || excerptEn.length > 500) fieldErrors.excerpt_en = "English excerpt is required (max 500 chars)";

    if (!contentHy) fieldErrors.content_hy = "Armenian content is required";
    if (!contentRu) fieldErrors.content_ru = "Russian content is required";
    if (!contentEn) fieldErrors.content_en = "English content is required";

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

    const supabase = await createClient();

    // Unique slug resolving for update (excluding self ID)
    let finalSlug = rawSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("news")
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

    const updatePayload: NewsUpdate = {
      slug: finalSlug,
      status,
      published_at: publishedAt,
      cover_image_url: coverImageUrl || null,
      title_hy: titleHy,
      title_ru: titleRu,
      title_en: titleEn,
      excerpt_hy: excerptHy,
      excerpt_ru: excerptRu,
      excerpt_en: excerptEn,
      content_hy: contentHy,
      content_ru: contentRu,
      content_en: contentEn,
    };

    const { data: updatedRow, error: updateError } = await supabase
      .from("news")
      .update(updatePayload)
      .eq("id", id)
      .select("id, slug, status, published_at")
      .single();

    if (updateError || !updatedRow || !updatedRow.id) {
      return {
        success: false,
        code: "DB_UPDATE_ERROR",
        message: updateError?.message || "Failed to update article in database.",
      };
    }

    revalidatePath("/admin/news");
    revalidatePath(`/${locale}/admin/news`);
    revalidatePath(`/admin/news/${id}/edit`);
    revalidatePath(`/${locale}/admin/news/${id}/edit`);
    revalidatePath("/news");
    revalidatePath(`/${locale}/news`);
    revalidatePath(`/${locale}/news/${updatedRow.slug}`);

    return {
      success: true,
      newsId: updatedRow.id,
      slug: updatedRow.slug,
    };
  } catch (err) {
    return {
      success: false,
      code: "UNAUTHORIZED_OR_SERVER_ERROR",
      message: err instanceof Error ? err.message : "Server error or unauthorized action.",
    };
  }
}

export async function deleteNewsAction(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin();

    if (!id || typeof id !== "string") {
      return { success: false, message: "Invalid article ID" };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      return { success: false, message: error.message || "Failed to delete article" };
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");

    return { success: true };
  } catch {
    return { success: false, message: "Unauthorized or server error" };
  }
}
