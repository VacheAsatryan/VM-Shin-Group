"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CareerRow, CareerStatus, EmploymentType } from "@/lib/supabase/types";
import { deleteCareerAction } from "@/app/[locale]/admin/(dashboard)/careers/actions";
import SafeImage from "@/components/ui/SafeImage";

interface AdminCareersManagerProps {
  initialVacancies: CareerRow[];
  locale: string;
}

export default function AdminCareersManager({ initialVacancies, locale }: AdminCareersManagerProps) {
  const t = useTranslations("adminCareers");
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CareerStatus>("all");
  const [itemToDelete, setItemToDelete] = useState<CareerRow | null>(null);

  const isCreated = searchParams.get("created") === "1";
  const isUpdated = searchParams.get("updated") === "1";

  const getLocalizedTitle = (item: CareerRow): string => {
    const sLoc = item.source_locale || "hy";
    if (sLoc === "ru") return item.title_ru || item.title_hy || item.title_en || "Untitled";
    if (sLoc === "en") return item.title_en || item.title_hy || item.title_ru || "Untitled";
    return item.title_hy || item.title_ru || item.title_en || "Untitled";
  };

  const getEmploymentTypeLabel = (emp: EmploymentType | null): string => {
    if (!emp) return "—";
    if (emp === "full_time") return t("empFullTime");
    if (emp === "part_time") return t("empPartTime");
    if (emp === "contract") return t("empContract");
    return t("empInternship");
  };

  const filteredVacancies = initialVacancies.filter((item) => {
    const title = getLocalizedTitle(item).toLowerCase();
    const dept = (item.department || "").toLowerCase();
    const loc = (item.location || "").toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesQuery = !q || title.includes(q) || dept.includes(q) || loc.includes(q) || item.slug.includes(q);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    startTransition(async () => {
      const res = await deleteCareerAction(itemToDelete.id);
      if (res.success) {
        setItemToDelete(null);
      } else {
        alert(res.message || "Failed to delete vacancy");
      }
    });
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString(locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "hy-AM", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Notifications */}
      {isCreated && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
          <span>✅</span>
          <span>Vacancy successfully created and published!</span>
        </div>
      )}
      {isUpdated && (
        <div className="bg-blue-950/80 border border-blue-500/50 p-4 rounded-2xl text-blue-200 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
          <span>ℹ️</span>
          <span>Vacancy changes saved successfully!</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/vacancies/new`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto w-full sm:w-auto"
        >
          <span>+</span>
          <span>{t("newTitle")}</span>
        </Link>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 backdrop-blur-sm shadow-md">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[260px]">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#F5C21B] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs font-bold p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {(["all", "draft", "published", "closed"] as const).map((st) => {
            const label =
              st === "all"
                ? t("filterAll")
                : st === "draft"
                ? t("statusDraft")
                : st === "published"
                ? t("statusPublished")
                : t("statusClosed");

            const isSelected = statusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#F5C21B] text-zinc-950 shadow-md font-bold"
                    : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredVacancies.length === 0 ? (
        /* Professional Branded Empty State */
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#F5C21B]/10 border border-[#F5C21B]/30 text-[#F5C21B] flex items-center justify-center text-3xl mx-auto">
            💼
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-100">
              {t("emptyStateTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {t("emptyStateDescription")}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/${locale}/admin/vacancies/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs shadow-lg transition-all"
            >
              <span>+</span>
              <span>{t("createFirstVacancy")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="px-5 py-4">Vacancy Title</th>
                    <th className="px-5 py-4">{t("department")}</th>
                    <th className="px-5 py-4">{t("location")}</th>
                    <th className="px-5 py-4">Employment</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">{t("publishedAt")}</th>
                    <th className="px-5 py-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {filteredVacancies.map((item) => {
                    const title = getLocalizedTitle(item);

                    return (
                      <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors group">
                        {/* Title & Image */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0">
                              {item.cover_image_url ? (
                                <SafeImage
                                  src={item.cover_image_url}
                                  alt={title}
                                  fill
                                  className="object-cover"
                                  fallbackText="VM"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-mono font-bold">
                                  VM
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-100 group-hover:text-[#F5C21B] transition-colors flex items-center gap-2">
                                <span>{title}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                                  {item.source_locale || "hy"}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono">/{item.slug}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-5 py-4 text-zinc-300 font-medium">
                          {item.department || "—"}
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4 text-zinc-300">
                          {item.location || "—"}
                        </td>

                        {/* Employment Type */}
                        <td className="px-5 py-4 text-zinc-300 font-medium text-[11px]">
                          {getEmploymentTypeLabel(item.employment_type)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              item.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : item.status === "closed"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {item.status === "published"
                              ? t("statusPublished")
                              : item.status === "closed"
                              ? t("statusClosed")
                              : t("statusDraft")}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-zinc-400 whitespace-nowrap">
                          {formatDate(item.published_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/${locale}/admin/vacancies/${item.id}/edit`}
                              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-[#F5C21B] rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                            >
                              <span>✏️</span>
                              <span>{t("editAction")}</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950 border border-rose-800/50 text-rose-400 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                            >
                              <span>🗑️</span>
                              <span>{t("deleteAction")}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (visible only on mobile/small screens) */}
          <div className="block md:hidden space-y-4">
            {filteredVacancies.map((item) => {
              const title = getLocalizedTitle(item);

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800/80 space-y-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-zinc-800/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0">
                        {item.cover_image_url ? (
                          <SafeImage
                            src={item.cover_image_url}
                            alt={title}
                            fill
                            className="object-cover"
                            fallbackText="VM"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-mono font-bold">
                            VM
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">
                          {title}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">
                          /{item.slug}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        item.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : item.status === "closed"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {item.status === "published"
                        ? t("statusPublished")
                        : item.status === "closed"
                        ? t("statusClosed")
                        : t("statusDraft")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">{t("department")}</span>
                      <span className="text-zinc-200 font-medium">{item.department || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">{t("location")}</span>
                      <span className="text-zinc-200 font-medium">{item.location || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Employment</span>
                      <span className="text-zinc-200 font-medium">{getEmploymentTypeLabel(item.employment_type)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">{t("publishedAt")}</span>
                      <span className="text-zinc-400">{formatDate(item.published_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60">
                    <Link
                      href={`/${locale}/admin/vacancies/${item.id}/edit`}
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>✏️</span>
                      <span>{t("editAction")}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="px-4 py-2 bg-rose-950/40 hover:bg-rose-950 border border-rose-800/50 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>🗑️</span>
                      <span>{t("deleteAction")}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-zinc-100">
              Confirm Deletion
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t("confirmDelete")}{" "}
              <span className="text-zinc-200 font-semibold">{getLocalizedTitle(itemToDelete)}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isPending}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors"
              >
                {isPending ? "Deleting..." : t("deleteAction")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
