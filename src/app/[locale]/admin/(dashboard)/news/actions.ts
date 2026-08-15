"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/auth.server";
import { createClient } from "@/lib/supabase/server";
import type { NewsInsert, NewsStatus, NewsUpdate, SupportedLocale } from "@/lib/supabase/types";
import { slugifyText, generateAutoSlug } from "@/lib/utils/slugify";
import { routing } from "@/i18n/routing";

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
    await requireAdmin();
    const supabase = await createClient();

    // 1. Determine Source Locale & Parse Inputs
    const requestedSource = (formData.get("source_locale") as string || "").trim();
    const sourceLocale: SupportedLocale =
      requestedSource === "ru" || requestedSource === "en" || requestedSource === "hy"
        ? requestedSource
        : locale === "ru" || locale === "en" || locale === "hy"
        ? (locale as SupportedLocale)
        : "hy";

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

    // 2. Validate Source Language Fields (Mandatory)
    const fieldErrors: Record<string, string> = {};

    const titles: Record<SupportedLocale, string> = { hy: titleHy, ru: titleRu, en: titleEn };
    const excerpts: Record<SupportedLocale, string> = { hy: excerptHy, ru: excerptRu, en: excerptEn };
    const contents: Record<SupportedLocale, string> = { hy: contentHy, ru: contentRu, en: contentEn };

    const sourceTitle = titles[sourceLocale];
    const sourceExcerpt = excerpts[sourceLocale];
    const sourceContent = contents[sourceLocale];

    if (!sourceTitle || sourceTitle.length > 200) {
      fieldErrors[`title_${sourceLocale}`] = `Title for source language (${sourceLocale.toUpperCase()}) is required (max 200 chars).`;
    }
    if (!sourceExcerpt || sourceExcerpt.length > 500) {
      fieldErrors[`excerpt_${sourceLocale}`] = `Excerpt for source language (${sourceLocale.toUpperCase()}) is required (max 500 chars).`;
    }
    if (!sourceContent) {
      fieldErrors[`content_${sourceLocale}`] = `Content for source language (${sourceLocale.toUpperCase()}) is required.`;
    }

    // 3. Validate Optional Languages (If partially filled, require all 3 fields for that language)
    const allLocales: SupportedLocale[] = ["hy", "ru", "en"];
    for (const loc of allLocales) {
      if (loc === sourceLocale) continue;

      const tVal = titles[loc];
      const eVal = excerpts[loc];
      const cVal = contents[loc];

      const hasAny = Boolean(tVal || eVal || cVal);

      if (hasAny) {
        if (!tVal || tVal.length > 200) {
          fieldErrors[`title_${loc}`] = `Title for optional translation (${loc.toUpperCase()}) is required when translation is started.`;
        }
        if (!eVal || eVal.length > 500) {
          fieldErrors[`excerpt_${loc}`] = `Excerpt for optional translation (${loc.toUpperCase()}) is required when translation is started.`;
        }
        if (!cVal) {
          fieldErrors[`content_${loc}`] = `Content for optional translation (${loc.toUpperCase()}) is required when translation is started.`;
        }
      }
    }

    // 4. Auto-generate Slug (Priority: Source title -> Other completed titles -> Timestamp)
    let rawSlug = (formData.get("slug") as string || "").trim();
    if (!rawSlug) {
      // Pass source language title as priority 1 to generateAutoSlug
      const otherLocales = allLocales.filter((l) => l !== sourceLocale);
      const title1 = sourceTitle;
      const title2 = titles[otherLocales[0]] || "";
      const title3 = titles[otherLocales[1]] || "";
      rawSlug = generateAutoSlug(title1, title2, title3);
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

    // 5. Timezone & Datetime Parsing
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

    // 6. Automatic Unique Slug Suffix Resolving (-2, -3, -4...)
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

    // 7. DB Insert
    const newArticle: NewsInsert = {
      slug: finalSlug,
      source_locale: sourceLocale,
      status,
      published_at: publishedAt,
      cover_image_url: coverImageUrl || null,
      title_hy: titleHy || null,
      title_ru: titleRu || null,
      title_en: titleEn || null,
      excerpt_hy: excerptHy || null,
      excerpt_ru: excerptRu || null,
      excerpt_en: excerptEn || null,
      content_hy: contentHy || null,
      content_ru: contentRu || null,
      content_en: contentEn || null,
    };

    const { data: insertedRow, error: insertError } = await supabase
      .from("news")
      .insert(newArticle)
      .select("id, slug, status, published_at, source_locale")
      .single();

    if (insertError || !insertedRow || !insertedRow.id) {
      console.error("[Create News DB Insert Failure]", insertError?.message || "No inserted row returned");
      return {
        success: false,
        code: insertError?.code || "DB_INSERT_ERROR",
        message: insertError?.message || "Database insert failed. No row was created.",
      };
    }

    // 8. Cache Revalidation across all configured locales
    revalidatePath("/admin/news");
    revalidatePath("/news");
    for (const loc of routing.locales) {
      revalidatePath(`/${loc}/admin/news`);
      revalidatePath(`/${loc}/news`);
      revalidatePath(`/${loc}/news/${insertedRow.slug}`);
    }

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

    const supabase = await createClient();

    // Fetch existing article to preserve source_locale if not explicitly provided
    const { data: existingArticle } = await supabase
      .from("news")
      .select("source_locale")
      .eq("id", id)
      .single();

    const requestedSource = (formData.get("source_locale") as string || "").trim();
    const sourceLocale: SupportedLocale =
      requestedSource === "ru" || requestedSource === "en" || requestedSource === "hy"
        ? requestedSource
        : existingArticle?.source_locale || "hy";

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

    const fieldErrors: Record<string, string> = {};

    const titles: Record<SupportedLocale, string> = { hy: titleHy, ru: titleRu, en: titleEn };
    const excerpts: Record<SupportedLocale, string> = { hy: excerptHy, ru: excerptRu, en: excerptEn };
    const contents: Record<SupportedLocale, string> = { hy: contentHy, ru: contentRu, en: contentEn };

    const sourceTitle = titles[sourceLocale];
    const sourceExcerpt = excerpts[sourceLocale];
    const sourceContent = contents[sourceLocale];

    if (!sourceTitle || sourceTitle.length > 200) {
      fieldErrors[`title_${sourceLocale}`] = `Title for source language (${sourceLocale.toUpperCase()}) is required (max 200 chars).`;
    }
    if (!sourceExcerpt || sourceExcerpt.length > 500) {
      fieldErrors[`excerpt_${sourceLocale}`] = `Excerpt for source language (${sourceLocale.toUpperCase()}) is required (max 500 chars).`;
    }
    if (!sourceContent) {
      fieldErrors[`content_${sourceLocale}`] = `Content for source language (${sourceLocale.toUpperCase()}) is required.`;
    }

    const allLocales: SupportedLocale[] = ["hy", "ru", "en"];
    for (const loc of allLocales) {
      if (loc === sourceLocale) continue;

      const tVal = titles[loc];
      const eVal = excerpts[loc];
      const cVal = contents[loc];

      const hasAny = Boolean(tVal || eVal || cVal);

      if (hasAny) {
        if (!tVal || tVal.length > 200) {
          fieldErrors[`title_${loc}`] = `Title for optional translation (${loc.toUpperCase()}) is required when translation is started.`;
        }
        if (!eVal || eVal.length > 500) {
          fieldErrors[`excerpt_${loc}`] = `Excerpt for optional translation (${loc.toUpperCase()}) is required when translation is started.`;
        }
        if (!cVal) {
          fieldErrors[`content_${loc}`] = `Content for optional translation (${loc.toUpperCase()}) is required when translation is started.`;
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

    // Unique slug resolving for update
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
      source_locale: sourceLocale,
      status,
      published_at: publishedAt,
      cover_image_url: coverImageUrl || null,
      title_hy: titleHy || null,
      title_ru: titleRu || null,
      title_en: titleEn || null,
      excerpt_hy: excerptHy || null,
      excerpt_ru: excerptRu || null,
      excerpt_en: excerptEn || null,
      content_hy: contentHy || null,
      content_ru: contentRu || null,
      content_en: contentEn || null,
    };

    const { data: updatedRow, error: updateError } = await supabase
      .from("news")
      .update(updatePayload)
      .eq("id", id)
      .select("id, slug, status, published_at, source_locale")
      .single();

    if (updateError || !updatedRow || !updatedRow.id) {
      return {
        success: false,
        code: "DB_UPDATE_ERROR",
        message: updateError?.message || "Failed to update article in database.",
      };
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");
    for (const loc of routing.locales) {
      revalidatePath(`/${loc}/admin/news`);
      revalidatePath(`/${loc}/admin/news/${id}/edit`);
      revalidatePath(`/${loc}/news`);
      revalidatePath(`/${loc}/news/${updatedRow.slug}`);
    }

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
    for (const loc of routing.locales) {
      revalidatePath(`/${loc}/admin/news`);
      revalidatePath(`/${loc}/news`);
    }

    return { success: true };
  } catch {
    return { success: false, message: "Unauthorized or server error" };
  }
}
