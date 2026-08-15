"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NewsRow, SupportedLocale } from "@/lib/supabase/types";
import { createNewsAction, updateNewsAction, type NewsActionResult } from "@/app/[locale]/admin/(dashboard)/news/actions";
import { generateAutoSlug, slugifyText } from "@/lib/utils/slugify";
import NewsImageUploader from "./NewsImageUploader";

const toLocalDateTimeString = (dateOrString: Date | string) => {
  const date = new Date(dateOrString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface AdminNewsFormProps {
  article?: NewsRow;
  locale: string;
}

export default function AdminNewsForm({ article, locale }: AdminNewsFormProps) {
  const t = useTranslations("adminNews");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(article);

  // Source locale: preserved on edit, initialized from route locale on creation
  const sourceLocale: SupportedLocale =
    article?.source_locale ||
    (locale === "ru" || locale === "en" || locale === "hy" ? (locale as SupportedLocale) : "hy");

  // Other optional locales for editing
  const allLocales: SupportedLocale[] = ["hy", "ru", "en"];
  const optionalLocales = allLocales.filter((l) => l !== sourceLocale);

  // State to track which optional translations are active on Edit screen
  const [activeOptionalTranslations, setActiveOptionalTranslations] = useState<Record<SupportedLocale, boolean>>(() => {
    if (!article) return { hy: false, ru: false, en: false };
    return {
      hy: Boolean(article.title_hy || article.excerpt_hy || article.content_hy),
      ru: Boolean(article.title_ru || article.excerpt_ru || article.content_ru),
      en: Boolean(article.title_en || article.excerpt_en || article.content_en),
    };
  });

  // Title & Excerpt & Content States
  const [titleHy, setTitleHy] = useState(article?.title_hy || "");
  const [titleRu, setTitleRu] = useState(article?.title_ru || "");
  const [titleEn, setTitleEn] = useState(article?.title_en || "");

  const [excerptHy, setExcerptHy] = useState(article?.excerpt_hy || "");
  const [excerptRu, setExcerptRu] = useState(article?.excerpt_ru || "");
  const [excerptEn, setExcerptEn] = useState(article?.excerpt_en || "");

  const [contentHy, setContentHy] = useState(article?.content_hy || "");
  const [contentRu, setContentRu] = useState(article?.content_ru || "");
  const [contentEn, setContentEn] = useState(article?.content_en || "");

  // Settings & Slug States
  const [slug, setSlug] = useState(article?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const [status, setStatus] = useState<"draft" | "published">(article?.status || "draft");
  const [publishedAt, setPublishedAt] = useState(
    article?.published_at ? toLocalDateTimeString(article.published_at) : ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url || "");

  const [formResult, setFormResult] = useState<NewsActionResult | null>(null);

  // Auto-slug update helper based on source language title
  const handleSourceTitleChange = (val: string) => {
    if (sourceLocale === "hy") setTitleHy(val);
    else if (sourceLocale === "ru") setTitleRu(val);
    else if (sourceLocale === "en") setTitleEn(val);

    if (!isEdit && !isSlugManuallyEdited) {
      const titles: Record<SupportedLocale, string> = {
        hy: sourceLocale === "hy" ? val : titleHy,
        ru: sourceLocale === "ru" ? val : titleRu,
        en: sourceLocale === "en" ? val : titleEn,
      };
      setSlug(generateAutoSlug(titles[sourceLocale], titles[optionalLocales[0]], titles[optionalLocales[1]]));
    }
  };

  const handleSlugInputChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(slugifyText(val));
  };

  const handleResetAutoSlug = () => {
    setIsSlugManuallyEdited(false);
    setIsEditingSlug(false);
    const titles: Record<SupportedLocale, string> = { hy: titleHy, ru: titleRu, en: titleEn };
    setSlug(generateAutoSlug(titles[sourceLocale], titles[optionalLocales[0]], titles[optionalLocales[1]]));
  };

  const toggleOptionalTranslation = (loc: SupportedLocale, enable: boolean) => {
    setActiveOptionalTranslations((prev) => ({ ...prev, [loc]: enable }));
    if (!enable) {
      if (loc === "hy") { setTitleHy(""); setExcerptHy(""); setContentHy(""); }
      else if (loc === "ru") { setTitleRu(""); setExcerptRu(""); setContentRu(""); }
      else if (loc === "en") { setTitleEn(""); setExcerptEn(""); setContentEn(""); }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormResult(null);

    const formData = new FormData();
    formData.append("source_locale", sourceLocale);
    formData.append("slug", slug);
    formData.append("status", status);
    const utcPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : "";
    formData.append("published_at", utcPublishedAt);
    formData.append("cover_image_url", coverImageUrl);

    formData.append("title_hy", titleHy);
    formData.append("title_ru", titleRu);
    formData.append("title_en", titleEn);

    formData.append("excerpt_hy", excerptHy);
    formData.append("excerpt_ru", excerptRu);
    formData.append("excerpt_en", excerptEn);

    formData.append("content_hy", contentHy);
    formData.append("content_ru", contentRu);
    formData.append("content_en", contentEn);

    startTransition(async () => {
      let res: NewsActionResult;
      if (isEdit && article) {
        res = await updateNewsAction(article.id, locale, formData);
      } else {
        res = await createNewsAction(locale, formData);
      }

      if (res.success) {
        const param = isEdit ? "updated=1" : "created=1";
        router.push(`/${locale}/admin/news?${param}`);
        router.refresh();
      } else {
        setFormResult(res);

        // Auto-activate optional translation section if error occurred there
        if (res.fieldErrors) {
          const errKeys = Object.keys(res.fieldErrors);
          const firstKey = errKeys[0];

          for (const optLoc of optionalLocales) {
            if (firstKey.endsWith(`_${optLoc}`)) {
              setActiveOptionalTranslations((prev) => ({ ...prev, [optLoc]: true }));
              break;
            }
          }

          if (firstKey === "slug") {
            setShowAdvanced(true);
            setIsEditingSlug(true);
          }

          setTimeout(() => {
            const inputEl = document.getElementById(`input-${firstKey}`);
            if (inputEl) {
              inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
              inputEl.focus();
            }
          }, 150);
        }
      }
    });
  };

  const fieldErrors = formResult && !formResult.success ? formResult.fieldErrors : undefined;

  const getLanguageName = (loc: SupportedLocale) => {
    if (loc === "hy") return "Armenian (🇦🇲)";
    if (loc === "ru") return "Russian (🇷🇺)";
    return "English (🇬🇧)";
  };

  const getFieldValue = (field: "title" | "excerpt" | "content", loc: SupportedLocale) => {
    if (field === "title") return loc === "hy" ? titleHy : loc === "ru" ? titleRu : titleEn;
    if (field === "excerpt") return loc === "hy" ? excerptHy : loc === "ru" ? excerptRu : excerptEn;
    return loc === "hy" ? contentHy : loc === "ru" ? contentRu : contentEn;
  };

  const setFieldValue = (field: "title" | "excerpt" | "content", loc: SupportedLocale, val: string) => {
    if (field === "title") {
      if (loc === "hy") setTitleHy(val);
      else if (loc === "ru") setTitleRu(val);
      else setTitleEn(val);
    } else if (field === "excerpt") {
      if (loc === "hy") setExcerptHy(val);
      else if (loc === "ru") setExcerptRu(val);
      else setExcerptEn(val);
    } else {
      if (loc === "hy") setContentHy(val);
      else if (loc === "ru") setContentRu(val);
      else setContentEn(val);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <input type="hidden" name="source_locale" value={sourceLocale} />

      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? t("editTitle") : t("newTitle")}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5C21B]/10 border border-[#F5C21B]/30 text-[#F5C21B]">
              Authoring Language: {getLanguageName(sourceLocale)}
            </span>
            {isEdit && article && <span className="text-xs font-mono text-zinc-500">ID: {article.id}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/news`}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
          >
            {t("form.cancel")}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs shadow-lg transition-colors disabled:opacity-50"
          >
            {isPending ? t("form.saving") : isEdit ? t("form.save") : t("form.create")}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {formResult && !formResult.success && (
        <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-xl text-rose-200 text-xs font-medium space-y-2 animate-fade-in">
          <div className="font-bold text-rose-100 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{formResult.message}</span>
          </div>
          {fieldErrors && Object.keys(fieldErrors).length > 0 && (
            <div className="text-[11px] text-rose-300/90 pl-6 space-y-1">
              <p className="font-semibold text-rose-200">Invalid / Missing fields:</p>
              <ul className="list-disc list-inside space-y-0.5 font-mono">
                {Object.entries(fieldErrors).map(([key, msg]) => (
                  <li key={key}>
                    <span className="font-semibold text-rose-100">{key}:</span> {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Publication Settings Card */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-4">
        <h2 className="text-xs font-bold text-[#F5C21B] uppercase tracking-wider">
          Publication Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="input-status" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("form.status")}
            </label>
            <select
              id="input-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-semibold focus:outline-none focus:border-[#F5C21B]"
            >
              <option value="draft">{t("statusDraft")}</option>
              <option value="published">{t("statusPublished")}</option>
            </select>
          </div>

          {/* Published At */}
          <div>
            <label htmlFor="input-published_at" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("form.publishedAt")}
            </label>
            <input
              id="input-published_at"
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 focus:outline-none ${
                fieldErrors?.published_at
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-zinc-800 focus:border-[#F5C21B]"
              }`}
            />
            {fieldErrors?.published_at && (
              <p className="text-rose-400 text-[11px] mt-1">⚠️ {fieldErrors.published_at}</p>
            )}
          </div>
        </div>

        {/* Drag & Drop Image Uploader */}
        <NewsImageUploader
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          error={fieldErrors?.cover_image_url}
        />

        {/* Public URL Preview & Advanced Slug Controls */}
        <div className="pt-2 border-t border-zinc-800/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-400 font-medium block">{t("form.urlPreview")}:</span>
              <span className="font-mono text-[#F5C21B] break-all">
                /{locale}/news/{slug || "..."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="self-start sm:self-auto text-xs font-semibold text-zinc-400 hover:text-zinc-200 underline transition-colors"
            >
              {showAdvanced ? "▲ " : "▼ "} {t("form.advancedSettings")}
            </button>
          </div>

          {showAdvanced && (
            <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label htmlFor="input-slug" className="block text-xs font-semibold text-zinc-300">
                  {t("form.slug")} (URL identifier)
                </label>
                {!isEditingSlug ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingSlug(true)}
                    className="text-[11px] font-semibold text-[#F5C21B] hover:underline"
                  >
                    ✏️ {t("form.editSlug")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetAutoSlug}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 hover:underline"
                  >
                    🔄 {t("form.lockSlug")}
                  </button>
                )}
              </div>

              <input
                id="input-slug"
                type="text"
                disabled={!isEditingSlug}
                value={slug}
                onChange={(e) => handleSlugInputChange(e.target.value)}
                placeholder="news-article-slug"
                className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 font-mono focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                  fieldErrors?.slug
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.slug && (
                <p className="text-rose-400 text-[11px] mt-1">⚠️ {fieldErrors.slug}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Single Clean Editor (Source Language ONLY - NO TABS) */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-bold text-[#F5C21B] uppercase tracking-wider">
            Article Content ({getLanguageName(sourceLocale)})
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">
            * Fields for this language are mandatory
          </span>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor={`input-title_${sourceLocale}`} className="block text-xs font-semibold text-zinc-300 mb-1">
              Title ({getLanguageName(sourceLocale)}) <span className="text-rose-400">*</span>
            </label>
            <input
              id={`input-title_${sourceLocale}`}
              type="text"
              value={getFieldValue("title", sourceLocale)}
              onChange={(e) => handleSourceTitleChange(e.target.value)}
              placeholder="Article title..."
              className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                fieldErrors?.[`title_${sourceLocale}`]
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-zinc-800 focus:border-[#F5C21B]"
              }`}
            />
            {fieldErrors?.[`title_${sourceLocale}`] && (
              <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`title_${sourceLocale}`]}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor={`input-excerpt_${sourceLocale}`} className="block text-xs font-semibold text-zinc-300 mb-1">
              Short Excerpt ({getLanguageName(sourceLocale)}) <span className="text-rose-400">*</span>
            </label>
            <textarea
              id={`input-excerpt_${sourceLocale}`}
              rows={2}
              value={getFieldValue("excerpt", sourceLocale)}
              onChange={(e) => setFieldValue("excerpt", sourceLocale, e.target.value)}
              placeholder="Short description or summary..."
              className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                fieldErrors?.[`excerpt_${sourceLocale}`]
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-zinc-800 focus:border-[#F5C21B]"
              }`}
            />
            {fieldErrors?.[`excerpt_${sourceLocale}`] && (
              <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`excerpt_${sourceLocale}`]}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor={`input-content_${sourceLocale}`} className="block text-xs font-semibold text-zinc-300 mb-1">
              Full Content ({getLanguageName(sourceLocale)}) <span className="text-rose-400">*</span>
            </label>
            <textarea
              id={`input-content_${sourceLocale}`}
              rows={8}
              value={getFieldValue("content", sourceLocale)}
              onChange={(e) => setFieldValue("content", sourceLocale, e.target.value)}
              placeholder="Full article body content..."
              className={`w-full px-3.5 py-2.5 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                fieldErrors?.[`content_${sourceLocale}`]
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-zinc-800 focus:border-[#F5C21B]"
              }`}
            />
            {fieldErrors?.[`content_${sourceLocale}`] && (
              <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`content_${sourceLocale}`]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Translations Section (ONLY ON EDIT PAGE) */}
      {isEdit && (
        <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <span>🌐</span>
                <span>Translations</span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                If no translation is provided, the original ({getLanguageName(sourceLocale)}) version will be displayed.
              </p>
            </div>
          </div>

          {/* Action Buttons to Add Optional Translations */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {optionalLocales.map((optLoc) => {
              const isActive = activeOptionalTranslations[optLoc];
              if (isActive) return null; // Already active editor shown below

              return (
                <button
                  key={optLoc}
                  type="button"
                  onClick={() => toggleOptionalTranslation(optLoc, true)}
                  className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-semibold text-[#F5C21B] transition-colors flex items-center gap-1.5"
                >
                  <span>+ Add {getLanguageName(optLoc)} translation</span>
                </button>
              );
            })}
          </div>

          {/* Active Optional Editors */}
          <div className="space-y-4">
            {optionalLocales.map((optLoc) => {
              const isActive = activeOptionalTranslations[optLoc];
              if (!isActive) return null;

              return (
                <div
                  key={optLoc}
                  className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                    <span className="text-xs font-bold text-zinc-200">
                      {getLanguageName(optLoc)} Translation
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleOptionalTranslation(optLoc, false)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-medium"
                    >
                      Remove translation
                    </button>
                  </div>

                  <div>
                    <label htmlFor={`input-title_${optLoc}`} className="block text-xs font-semibold text-zinc-300 mb-1">
                      Title ({getLanguageName(optLoc)})
                    </label>
                    <input
                      id={`input-title_${optLoc}`}
                      type="text"
                      value={getFieldValue("title", optLoc)}
                      onChange={(e) => setFieldValue("title", optLoc, e.target.value)}
                      placeholder={`Optional title in ${optLoc.toUpperCase()}...`}
                      className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                        fieldErrors?.[`title_${optLoc}`]
                          ? "border-rose-500 ring-1 ring-rose-500/50"
                          : "border-zinc-800 focus:border-[#F5C21B]"
                      }`}
                    />
                    {fieldErrors?.[`title_${optLoc}`] && (
                      <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`title_${optLoc}`]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`input-excerpt_${optLoc}`} className="block text-xs font-semibold text-zinc-300 mb-1">
                      Short Excerpt ({getLanguageName(optLoc)})
                    </label>
                    <textarea
                      id={`input-excerpt_${optLoc}`}
                      rows={2}
                      value={getFieldValue("excerpt", optLoc)}
                      onChange={(e) => setFieldValue("excerpt", optLoc, e.target.value)}
                      placeholder={`Optional excerpt in ${optLoc.toUpperCase()}...`}
                      className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                        fieldErrors?.[`excerpt_${optLoc}`]
                          ? "border-rose-500 ring-1 ring-rose-500/50"
                          : "border-zinc-800 focus:border-[#F5C21B]"
                      }`}
                    />
                    {fieldErrors?.[`excerpt_${optLoc}`] && (
                      <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`excerpt_${optLoc}`]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`input-content_${optLoc}`} className="block text-xs font-semibold text-zinc-300 mb-1">
                      Full Content ({getLanguageName(optLoc)})
                    </label>
                    <textarea
                      id={`input-content_${optLoc}`}
                      rows={8}
                      value={getFieldValue("content", optLoc)}
                      onChange={(e) => setFieldValue("content", optLoc, e.target.value)}
                      placeholder={`Optional content in ${optLoc.toUpperCase()}...`}
                      className={`w-full px-3.5 py-2.5 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                        fieldErrors?.[`content_${optLoc}`]
                          ? "border-rose-500 ring-1 ring-rose-500/50"
                          : "border-zinc-800 focus:border-[#F5C21B]"
                      }`}
                    />
                    {fieldErrors?.[`content_${optLoc}`] && (
                      <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`content_${optLoc}`]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Submit Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={`/${locale}/admin/news`}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
        >
          {t("form.cancel")}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs shadow-lg transition-colors disabled:opacity-50"
        >
          {isPending ? t("form.saving") : isEdit ? t("form.save") : t("form.create")}
        </button>
      </div>
    </form>
  );
}
