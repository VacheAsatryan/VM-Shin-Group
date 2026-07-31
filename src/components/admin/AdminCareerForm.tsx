"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CareerRow, EmploymentType, SupportedLocale } from "@/lib/supabase/types";
import { createCareerAction, updateCareerAction, type CareerActionResult } from "@/app/[locale]/admin/(dashboard)/careers/actions";
import { generateAutoSlug, slugifyText } from "@/lib/utils/slugify";
import NewsImageUploader from "./NewsImageUploader";

interface AdminCareerFormProps {
  career?: CareerRow;
  locale: string;
}

export default function AdminCareerForm({ career, locale }: AdminCareerFormProps) {
  const t = useTranslations("adminCareers");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(career);

  const sourceLocale: SupportedLocale =
    career?.source_locale ||
    (locale === "ru" || locale === "en" || locale === "hy" ? (locale as SupportedLocale) : "hy");

  const allLocales: SupportedLocale[] = ["hy", "ru", "en"];
  const optionalLocales = allLocales.filter((l) => l !== sourceLocale);

  const [activeOptionalTranslations, setActiveOptionalTranslations] = useState<Record<SupportedLocale, boolean>>(() => {
    if (!career) return { hy: false, ru: false, en: false };
    return {
      hy: Boolean(career.title_hy || career.summary_hy || career.content_hy),
      ru: Boolean(career.title_ru || career.summary_ru || career.content_ru),
      en: Boolean(career.title_en || career.summary_en || career.content_en),
    };
  });

  // Vacancy metadata
  const [department, setDepartment] = useState(career?.department || "");
  const [locationVal, setLocationVal] = useState(career?.location || "");
  const [employmentType, setEmploymentType] = useState<EmploymentType>(career?.employment_type || "full_time");
  const [salaryFrom, setSalaryFrom] = useState(career?.salary_from ? String(career.salary_from) : "");
  const [salaryTo, setSalaryTo] = useState(career?.salary_to ? String(career.salary_to) : "");
  const [currency, setCurrency] = useState(career?.currency || "AMD");
  const [applicationEmail, setApplicationEmail] = useState(career?.application_email || "");

  // Instructions
  const [appInstHy, setAppInstHy] = useState(career?.application_instructions_hy || "");
  const [appInstRu, setAppInstRu] = useState(career?.application_instructions_ru || "");
  const [appInstEn, setAppInstEn] = useState(career?.application_instructions_en || "");

  // Title, Summary, Content
  const [titleHy, setTitleHy] = useState(career?.title_hy || "");
  const [titleRu, setTitleRu] = useState(career?.title_ru || "");
  const [titleEn, setTitleEn] = useState(career?.title_en || "");

  const [summaryHy, setSummaryHy] = useState(career?.summary_hy || "");
  const [summaryRu, setSummaryRu] = useState(career?.summary_ru || "");
  const [summaryEn, setSummaryEn] = useState(career?.summary_en || "");

  const [contentHy, setContentHy] = useState(career?.content_hy || "");
  const [contentRu, setContentRu] = useState(career?.content_ru || "");
  const [contentEn, setContentEn] = useState(career?.content_en || "");

  // Settings & Slug
  const [slug, setSlug] = useState(career?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const [status, setStatus] = useState<"draft" | "published" | "closed">(career?.status || "draft");
  const [publishedAt, setPublishedAt] = useState(
    career?.published_at ? new Date(career.published_at).toISOString().slice(0, 16) : ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(career?.cover_image_url || "");

  const [formResult, setFormResult] = useState<CareerActionResult | null>(null);

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
      if (loc === "hy") { setTitleHy(""); setSummaryHy(""); setContentHy(""); setAppInstHy(""); }
      else if (loc === "ru") { setTitleRu(""); setSummaryRu(""); setContentRu(""); setAppInstRu(""); }
      else if (loc === "en") { setTitleEn(""); setSummaryEn(""); setContentEn(""); setAppInstEn(""); }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormResult(null);

    const formData = new FormData();
    formData.append("source_locale", sourceLocale);
    formData.append("slug", slug);
    formData.append("status", status);
    formData.append("published_at", publishedAt);
    formData.append("cover_image_url", coverImageUrl);
    formData.append("department", department);
    formData.append("location", locationVal);
    formData.append("employment_type", employmentType);
    formData.append("salary_from", salaryFrom);
    formData.append("salary_to", salaryTo);
    formData.append("currency", currency);
    formData.append("application_email", applicationEmail);

    formData.append("application_instructions_hy", appInstHy);
    formData.append("application_instructions_ru", appInstRu);
    formData.append("application_instructions_en", appInstEn);

    formData.append("title_hy", titleHy);
    formData.append("title_ru", titleRu);
    formData.append("title_en", titleEn);

    formData.append("summary_hy", summaryHy);
    formData.append("summary_ru", summaryRu);
    formData.append("summary_en", summaryEn);

    formData.append("content_hy", contentHy);
    formData.append("content_ru", contentRu);
    formData.append("content_en", contentEn);

    startTransition(async () => {
      let res: CareerActionResult;
      if (isEdit && career) {
        res = await updateCareerAction(career.id, locale, formData);
      } else {
        res = await createCareerAction(locale, formData);
      }

      if (res.success) {
        const param = isEdit ? "updated=1" : "created=1";
        router.push(`/${locale}/admin/vacancies?${param}`);
        router.refresh();
      } else {
        setFormResult(res);

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
    if (loc === "hy") return t("languageHy");
    if (loc === "ru") return t("languageRu");
    return t("languageEn");
  };

  const getFieldValue = (field: "title" | "summary" | "content" | "instructions", loc: SupportedLocale) => {
    if (field === "title") return loc === "hy" ? titleHy : loc === "ru" ? titleRu : titleEn;
    if (field === "summary") return loc === "hy" ? summaryHy : loc === "ru" ? summaryRu : summaryEn;
    if (field === "instructions") return loc === "hy" ? appInstHy : loc === "ru" ? appInstRu : appInstEn;
    return loc === "hy" ? contentHy : loc === "ru" ? contentRu : contentEn;
  };

  const setFieldValue = (field: "title" | "summary" | "content" | "instructions", loc: SupportedLocale, val: string) => {
    if (field === "title") {
      if (loc === "hy") setTitleHy(val);
      else if (loc === "ru") setTitleRu(val);
      else setTitleEn(val);
    } else if (field === "summary") {
      if (loc === "hy") setSummaryHy(val);
      else if (loc === "ru") setSummaryRu(val);
      else setSummaryEn(val);
    } else if (field === "instructions") {
      if (loc === "hy") setAppInstHy(val);
      else if (loc === "ru") setAppInstRu(val);
      else setAppInstEn(val);
    } else {
      if (loc === "hy") setContentHy(val);
      else if (loc === "ru") setContentRu(val);
      else setContentEn(val);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <input type="hidden" name="source_locale" value={sourceLocale} />

      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? t("editTitle") : t("newTitle")}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5C21B]/10 border border-[#F5C21B]/30 text-[#F5C21B]">
              {t("authoringLanguage")}: {getLanguageName(sourceLocale)}
            </span>
            {isEdit && career && <span className="text-xs font-mono text-zinc-500">ID: {career.id}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/vacancies`}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
          >
            {t("cancel")}
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs shadow-lg transition-colors disabled:opacity-50"
          >
            {isPending ? t("saving") : isEdit ? t("saveChanges") : t("createVacancy")}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {formResult && !formResult.success && (
        <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-2xl text-rose-200 text-xs font-medium space-y-2 animate-fade-in">
          <div className="font-bold text-rose-100 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{t("validationNotice")}</span>
          </div>
          {fieldErrors && Object.keys(fieldErrors).length > 0 && (
            <div className="text-[11px] text-rose-300/90 pl-6 space-y-1">
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

      {/* Vacancy Details Card */}
      <div className="bg-zinc-900/60 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-5">
        <h2 className="text-xs font-bold text-[#F5C21B] uppercase tracking-wider">
          {t("vacancyDetailsAndSettings")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="input-status" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("status")}
            </label>
            <select
              id="input-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published" | "closed")}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-semibold focus:outline-none focus:border-[#F5C21B]"
            >
              <option value="draft">{t("statusDraft")}</option>
              <option value="published">{t("statusPublished")}</option>
              <option value="closed">{t("statusClosed")}</option>
            </select>
          </div>

          {/* Published At */}
          <div>
            <label htmlFor="input-published_at" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("publishedAt")}
            </label>
            <input
              id="input-published_at"
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#F5C21B]"
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="input-department" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("department")}
            </label>
            <input
              id="input-department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Production, Logistics"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#F5C21B]"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="input-location" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("location")}
            </label>
            <input
              id="input-location"
              type="text"
              value={locationVal}
              onChange={(e) => setLocationVal(e.target.value)}
              placeholder="e.g. Armavir, Yerevan"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#F5C21B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Employment Type */}
          <div>
            <label htmlFor="input-employment_type" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("employmentType")}
            </label>
            <select
              id="input-employment_type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-semibold focus:outline-none focus:border-[#F5C21B]"
            >
              <option value="full_time">{t("empFullTime")}</option>
              <option value="part_time">{t("empPartTime")}</option>
              <option value="contract">{t("empContract")}</option>
              <option value="internship">{t("empInternship")}</option>
            </select>
          </div>

          {/* Salary From */}
          <div>
            <label htmlFor="input-salary_from" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("salaryFrom")}
            </label>
            <input
              id="input-salary_from"
              type="number"
              value={salaryFrom}
              onChange={(e) => setSalaryFrom(e.target.value)}
              placeholder={t("minSalaryPlaceholder")}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#F5C21B]"
            />
          </div>

          {/* Salary To */}
          <div>
            <label htmlFor="input-salary_to" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("salaryTo")}
            </label>
            <input
              id="input-salary_to"
              type="number"
              value={salaryTo}
              onChange={(e) => setSalaryTo(e.target.value)}
              placeholder={t("maxSalaryPlaceholder")}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#F5C21B]"
            />
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="input-currency" className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("currency")}
            </label>
            <select
              id="input-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-semibold focus:outline-none focus:border-[#F5C21B]"
            >
              <option value="AMD">AMD (֏)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="RUB">RUB (₽)</option>
            </select>
          </div>
        </div>

        {/* Application Email */}
        <div>
          <label htmlFor="input-application_email" className="block text-xs font-semibold text-zinc-300 mb-1">
            {t("applicationEmail")}
          </label>
          <input
            id="input-application_email"
            type="email"
            value={applicationEmail}
            onChange={(e) => setApplicationEmail(e.target.value)}
            placeholder="hr@vmshingroup.am"
            className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
              fieldErrors?.application_email
                ? "border-rose-500 ring-1 ring-rose-500/50"
                : "border-zinc-800 focus:border-[#F5C21B]"
            }`}
          />
          {fieldErrors?.application_email && (
            <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors.application_email}</p>
          )}
        </div>

        {/* Image Uploader */}
        <NewsImageUploader
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          error={fieldErrors?.cover_image_url}
          bucketName="career-images"
          label={t("coverImage")}
        />

        {/* Public URL Preview & Advanced Slug Controls */}
        <div className="pt-2 border-t border-zinc-800/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-400 font-medium block">{t("publicUrlPreview")}</span>
              <span className="font-mono text-[#F5C21B] break-all">
                /{locale}/careers/{slug || "..."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="self-start sm:self-auto text-xs font-semibold text-zinc-400 hover:text-zinc-200 underline transition-colors"
            >
              {showAdvanced ? "▲ " : "▼ "} {t("advancedSettings")}
            </button>
          </div>

          {showAdvanced && (
            <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label htmlFor="input-slug" className="block text-xs font-semibold text-zinc-300">
                  {t("slugLabel")}
                </label>
                {!isEditingSlug ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingSlug(true)}
                    className="text-[11px] font-semibold text-[#F5C21B] hover:underline"
                  >
                    ✏️ {t("editSlug")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetAutoSlug}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 hover:underline"
                  >
                    🔄 {t("autoSlug")}
                  </button>
                )}
              </div>

              <input
                id="input-slug"
                type="text"
                disabled={!isEditingSlug}
                value={slug}
                onChange={(e) => handleSlugInputChange(e.target.value)}
                placeholder="vacancy-slug"
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

      {/* Single Clean Content Editor (NO TABS) */}
      <div className="bg-zinc-900/60 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-bold text-[#F5C21B] uppercase tracking-wider">
            {t("vacancyContent")} ({getLanguageName(sourceLocale)})
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">
            {t("mandatoryFieldsNotice")}
          </span>
        </div>

        <div className="space-y-4">
          {/* Job Title */}
          <div>
            <label htmlFor={`input-title_${sourceLocale}`} className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("jobTitle")} ({getLanguageName(sourceLocale)}) <span className="text-rose-400">*</span>
            </label>
            <input
              id={`input-title_${sourceLocale}`}
              type="text"
              value={getFieldValue("title", sourceLocale)}
              onChange={(e) => handleSourceTitleChange(e.target.value)}
              placeholder={t("jobTitlePlaceholder")}
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

          {/* Short Summary */}
          <div>
            <label htmlFor={`input-summary_${sourceLocale}`} className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("shortSummary")} ({getLanguageName(sourceLocale)}) <span className="text-rose-400">*</span>
            </label>
            <textarea
              id={`input-summary_${sourceLocale}`}
              rows={2}
              value={getFieldValue("summary", sourceLocale)}
              onChange={(e) => setFieldValue("summary", sourceLocale, e.target.value)}
              placeholder={t("shortSummaryPlaceholder")}
              className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                fieldErrors?.[`summary_${sourceLocale}`]
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-zinc-800 focus:border-[#F5C21B]"
              }`}
            />
            {fieldErrors?.[`summary_${sourceLocale}`] && (
              <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`summary_${sourceLocale}`]}</p>
            )}
          </div>

          {/* Full Content */}
          <div>
            <label htmlFor={`input-content_${sourceLocale}`} className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("fullDescription")} ({getLanguageName(sourceLocale)}) <span className="text-rose-400">*</span>
            </label>
            <textarea
              id={`input-content_${sourceLocale}`}
              rows={8}
              value={getFieldValue("content", sourceLocale)}
              onChange={(e) => setFieldValue("content", sourceLocale, e.target.value)}
              placeholder={t("fullDescriptionPlaceholder")}
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

          {/* Application Instructions */}
          <div>
            <label htmlFor={`input-application_instructions_${sourceLocale}`} className="block text-xs font-semibold text-zinc-300 mb-1">
              {t("applicationInstructions")} ({getLanguageName(sourceLocale)}) <span className="text-zinc-500 font-normal">{t("optionalLabel")}</span>
            </label>
            <textarea
              id={`input-application_instructions_${sourceLocale}`}
              rows={3}
              value={getFieldValue("instructions", sourceLocale)}
              onChange={(e) => setFieldValue("instructions", sourceLocale, e.target.value)}
              placeholder={t("instructionsPlaceholder")}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F5C21B]"
            />
          </div>
        </div>
      </div>

      {/* Translations Section (ONLY ON EDIT PAGE) */}
      {isEdit && (
        <div className="bg-zinc-900/60 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <span>🌐</span>
                <span>{t("translationsTitle")}</span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {t("translationsNotice")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {optionalLocales.map((optLoc) => {
              const isActive = activeOptionalTranslations[optLoc];
              if (isActive) return null;

              return (
                <button
                  key={optLoc}
                  type="button"
                  onClick={() => toggleOptionalTranslation(optLoc, true)}
                  className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-semibold text-[#F5C21B] transition-colors flex items-center gap-1.5"
                >
                  <span>+ {t("addTranslation")} ({getLanguageName(optLoc)})</span>
                </button>
              );
            })}
          </div>

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
                      {getLanguageName(optLoc)} {t("translationsTitle")}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleOptionalTranslation(optLoc, false)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-medium"
                    >
                      {t("removeTranslation")}
                    </button>
                  </div>

                  <div>
                    <label htmlFor={`input-title_${optLoc}`} className="block text-xs font-semibold text-zinc-300 mb-1">
                      {t("jobTitle")} ({getLanguageName(optLoc)})
                    </label>
                    <input
                      id={`input-title_${optLoc}`}
                      type="text"
                      value={getFieldValue("title", optLoc)}
                      onChange={(e) => setFieldValue("title", optLoc, e.target.value)}
                      placeholder={t("jobTitlePlaceholder")}
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
                    <label htmlFor={`input-summary_${optLoc}`} className="block text-xs font-semibold text-zinc-300 mb-1">
                      {t("shortSummary")} ({getLanguageName(optLoc)})
                    </label>
                    <textarea
                      id={`input-summary_${optLoc}`}
                      rows={2}
                      value={getFieldValue("summary", optLoc)}
                      onChange={(e) => setFieldValue("summary", optLoc, e.target.value)}
                      placeholder={t("shortSummaryPlaceholder")}
                      className={`w-full px-3.5 py-2 bg-zinc-950 border rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none ${
                        fieldErrors?.[`summary_${optLoc}`]
                          ? "border-rose-500 ring-1 ring-rose-500/50"
                          : "border-zinc-800 focus:border-[#F5C21B]"
                      }`}
                    />
                    {fieldErrors?.[`summary_${optLoc}`] && (
                      <p className="text-rose-400 text-[11px] mt-1 font-medium">⚠️ {fieldErrors[`summary_${optLoc}`]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`input-content_${optLoc}`} className="block text-xs font-semibold text-zinc-300 mb-1">
                      {t("fullDescription")} ({getLanguageName(optLoc)})
                    </label>
                    <textarea
                      id={`input-content_${optLoc}`}
                      rows={8}
                      value={getFieldValue("content", optLoc)}
                      onChange={(e) => setFieldValue("content", optLoc, e.target.value)}
                      placeholder={t("fullDescriptionPlaceholder")}
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

                  <div>
                    <label htmlFor={`input-application_instructions_${optLoc}`} className="block text-xs font-semibold text-zinc-300 mb-1">
                      {t("applicationInstructions")} ({getLanguageName(optLoc)})
                    </label>
                    <textarea
                      id={`input-application_instructions_${optLoc}`}
                      rows={3}
                      value={getFieldValue("instructions", optLoc)}
                      onChange={(e) => setFieldValue("instructions", optLoc, e.target.value)}
                      placeholder={t("instructionsPlaceholder")}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F5C21B]"
                    />
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
          href={`/${locale}/admin/vacancies`}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
        >
          {t("cancel")}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs shadow-lg transition-colors disabled:opacity-50"
        >
          {isPending ? t("saving") : isEdit ? t("saveChanges") : t("createVacancy")}
        </button>
      </div>
    </form>
  );
}
