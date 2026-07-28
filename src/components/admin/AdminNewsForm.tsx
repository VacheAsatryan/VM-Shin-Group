"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NewsRow } from "@/lib/supabase/types";
import { createNewsAction, updateNewsAction, type NewsActionResult } from "@/app/[locale]/admin/(dashboard)/news/actions";
import { generateAutoSlug, slugifyText } from "@/lib/utils/slugify";

interface AdminNewsFormProps {
  article?: NewsRow;
  locale: string;
}

export default function AdminNewsForm({ article, locale }: AdminNewsFormProps) {
  const t = useTranslations("adminNews");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(article);
  const [activeTab, setActiveTab] = useState<"hy" | "ru" | "en">("hy");

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
    article?.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url || "");

  const [formResult, setFormResult] = useState<NewsActionResult | null>(null);

  const handleTitleHyChange = (val: string) => {
    setTitleHy(val);
    if (!isEdit && !isSlugManuallyEdited) {
      setSlug(generateAutoSlug(titleEn, titleRu, val));
    }
  };

  const handleTitleRuChange = (val: string) => {
    setTitleRu(val);
    if (!isEdit && !isSlugManuallyEdited) {
      setSlug(generateAutoSlug(titleEn, val, titleHy));
    }
  };

  const handleTitleEnChange = (val: string) => {
    setTitleEn(val);
    if (!isEdit && !isSlugManuallyEdited) {
      setSlug(generateAutoSlug(val, titleRu, titleHy));
    }
  };

  const handleSlugInputChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(slugifyText(val));
  };

  const handleResetAutoSlug = () => {
    setIsSlugManuallyEdited(false);
    setIsEditingSlug(false);
    const auto = generateAutoSlug(titleEn, titleRu, titleHy);
    setSlug(auto);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormResult(null);

    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("status", status);
    formData.append("published_at", publishedAt);
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

        // Auto-switch to the first tab containing an invalid field & focus it
        if (res.fieldErrors) {
          const errKeys = Object.keys(res.fieldErrors);
          const firstKey = errKeys[0];

          if (firstKey.endsWith("_hy")) {
            setActiveTab("hy");
          } else if (firstKey.endsWith("_ru")) {
            setActiveTab("ru");
          } else if (firstKey.endsWith("_en")) {
            setActiveTab("en");
          } else if (firstKey === "slug") {
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

  // Calculate per-tab error counts
  const hyErrorCount = fieldErrors ? Object.keys(fieldErrors).filter((k) => k.endsWith("_hy")).length : 0;
  const ruErrorCount = fieldErrors ? Object.keys(fieldErrors).filter((k) => k.endsWith("_ru")).length : 0;
  const enErrorCount = fieldErrors ? Object.keys(fieldErrors).filter((k) => k.endsWith("_en")).length : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? t("editTitle") : t("newTitle")}
          </h1>
          {isEdit && article && <p className="text-xs font-mono text-[#F5C21B] mt-1">ID: {article.id}</p>}
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

      {/* Global Error Banner with Field List */}
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

      {/* General Settings Card */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-4">
        <h2 className="text-xs font-bold text-[#F5C21B] uppercase tracking-wider">
          Publication Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          {/* Cover Image URL */}
          <div>
            <label htmlFor="input-cover_image_url" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("form.coverImageUrl")}
            </label>
            <input
              id="input-cover_image_url"
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                fieldErrors?.cover_image_url
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-zinc-800 focus:border-[#F5C21B]"
              }`}
            />
            {fieldErrors?.cover_image_url && (
              <p className="text-rose-400 text-[11px] mt-1">⚠️ {fieldErrors.cover_image_url}</p>
            )}
          </div>
        </div>

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

          {/* Collapsible Advanced Settings (Slug Controls) */}
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

      {/* Multilingual Content Tabs */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
          <h2 className="text-xs font-bold text-[#F5C21B] uppercase tracking-wider">
            Multilingual Content
          </h2>

          {/* Language Switcher Tabs with Error Badges */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("hy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "hy"
                  ? "bg-[#F5C21B] text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>🇦🇲 Armenian (HY) *</span>
              {hyErrorCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                  {hyErrorCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ru")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "ru"
                  ? "bg-[#F5C21B] text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>🇷🇺 Russian (RU) *</span>
              {ruErrorCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                  {ruErrorCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "en"
                  ? "bg-[#F5C21B] text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>🇬🇧 English (EN) *</span>
              {enErrorCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                  {enErrorCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 1. ARMENIAN TAB */}
        {activeTab === "hy" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="input-title_hy" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.titleHy")} <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-title_hy"
                type="text"
                value={titleHy}
                onChange={(e) => handleTitleHyChange(e.target.value)}
                placeholder="Հոդվածի վերնագիրը հայերեն..."
                className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.title_hy
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.title_hy && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.title_hy}</p>
              )}
            </div>

            <div>
              <label htmlFor="input-excerpt_hy" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.excerptHy")} <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="input-excerpt_hy"
                rows={2}
                value={excerptHy}
                onChange={(e) => setExcerptHy(e.target.value)}
                placeholder="Համառոտ նկարագրություն հայերեն..."
                className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.excerpt_hy
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.excerpt_hy && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.excerpt_hy}</p>
              )}
            </div>

            <div>
              <label htmlFor="input-content_hy" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.contentHy")} <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="input-content_hy"
                rows={8}
                value={contentHy}
                onChange={(e) => setContentHy(e.target.value)}
                placeholder="Հոդվածի ամբողջական տեքստը հայերեն..."
                className={`w-full px-3.5 py-2.5 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.content_hy
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.content_hy && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.content_hy}</p>
              )}
            </div>
          </div>
        )}

        {/* 2. RUSSIAN TAB */}
        {activeTab === "ru" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="input-title_ru" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.titleRu")} <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-title_ru"
                type="text"
                value={titleRu}
                onChange={(e) => handleTitleRuChange(e.target.value)}
                placeholder="Заголовок статьи на русском..."
                className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.title_ru
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.title_ru && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.title_ru}</p>
              )}
            </div>

            <div>
              <label htmlFor="input-excerpt_ru" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.excerptRu")} <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="input-excerpt_ru"
                rows={2}
                value={excerptRu}
                onChange={(e) => setExcerptRu(e.target.value)}
                placeholder="Краткое описание на русском..."
                className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.excerpt_ru
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.excerpt_ru && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.excerpt_ru}</p>
              )}
            </div>

            <div>
              <label htmlFor="input-content_ru" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.contentRu")} <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="input-content_ru"
                rows={8}
                value={contentRu}
                onChange={(e) => setContentRu(e.target.value)}
                placeholder="Полный текст статьи на русском..."
                className={`w-full px-3.5 py-2.5 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.content_ru
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.content_ru && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.content_ru}</p>
              )}
            </div>
          </div>
        )}

        {/* 3. ENGLISH TAB */}
        {activeTab === "en" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="input-title_en" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.titleEn")} <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-title_en"
                type="text"
                value={titleEn}
                onChange={(e) => handleTitleEnChange(e.target.value)}
                placeholder="Article title in English..."
                className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.title_en
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.title_en && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.title_en}</p>
              )}
            </div>

            <div>
              <label htmlFor="input-excerpt_en" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.excerptEn")} <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="input-excerpt_en"
                rows={2}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                placeholder="Short excerpt in English..."
                className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.excerpt_en
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.excerpt_en && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.excerpt_en}</p>
              )}
            </div>

            <div>
              <label htmlFor="input-content_en" className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("form.contentEn")} <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="input-content_en"
                rows={8}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="Full article content in English..."
                className={`w-full px-3.5 py-2.5 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                  fieldErrors?.content_en
                    ? "border-rose-500 ring-1 ring-rose-500/50"
                    : "border-zinc-800 focus:border-[#F5C21B]"
                }`}
              />
              {fieldErrors?.content_en && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.content_en}</p>
              )}
            </div>
          </div>
        )}
      </div>

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
