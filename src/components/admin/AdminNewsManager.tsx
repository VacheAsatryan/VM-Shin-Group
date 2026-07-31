"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import { useSearchParams } from "next/navigation";
import type { NewsRow } from "@/lib/supabase/types";
import { deleteNewsAction } from "@/app/[locale]/admin/(dashboard)/news/actions";

interface AdminNewsManagerProps {
  initialNews: NewsRow[];
  queryError?: string | null;
  locale: string;
}

export default function AdminNewsManager({
  initialNews,
  queryError,
  locale,
}: AdminNewsManagerProps) {
  const t = useTranslations("adminNews");
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [news, setNews] = useState<NewsRow[]>(initialNews);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Detect created=1 or updated=1 URL parameter on load
  useEffect(() => {
    const created = searchParams.get("created");
    const updated = searchParams.get("updated");

    if (created === "1" || updated === "1") {
      const msgText = created === "1" ? t("createSuccess") : t("updateSuccess");
      const showTimer = setTimeout(() => {
        setToast({ text: msgText });
        window.history.replaceState({}, "", window.location.pathname);
      }, 0);

      const hideTimer = setTimeout(() => setToast(null), 4000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [searchParams, t]);

  // Filter & Search Logic
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch =
          item.title_hy.toLowerCase().includes(q) ||
          item.title_ru.toLowerCase().includes(q) ||
          item.title_en.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q);
        return titleMatch;
      }
      return true;
    });
  }, [news, statusFilter, searchQuery]);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const targetId = deleteId;

    startTransition(async () => {
      const res = await deleteNewsAction(targetId);
      setIsDeleting(false);
      setDeleteId(null);

      if (res.success) {
        setNews((prev) => prev.filter((item) => item.id !== targetId));
        setToast({ text: t("deleteSuccess") });
      } else {
        setToast({ text: res.message || t("deleteError"), isError: true });
      }

      setTimeout(() => setToast(null), 3000);
    });
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("hy-AM", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-semibold transition-all animate-bounce ${
            toast.isError
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Database Query Failure Banner */}
      {queryError && (
        <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-xl text-rose-200 text-xs font-medium space-y-1">
          <div className="font-bold text-rose-100">⚠️ {t("queryError")}</div>
          <div className="text-[11px] font-mono text-rose-300/80">{queryError}</div>
        </div>
      )}

      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{t("title")}</h1>
          <p className="text-sm text-zinc-400 mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href={`/${locale}/admin/news/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5C21B] hover:bg-[#e0b016] text-zinc-950 font-bold rounded-xl text-xs shadow-lg transition-colors self-start sm:self-auto"
        >
          {t("createBtn")}
        </Link>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
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
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#F5C21B] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-[#F5C21B] text-zinc-950 font-semibold"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {t("filterAll")} ({news.length})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === "draft"
                ? "bg-[#F5C21B] text-zinc-950 font-semibold"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {t("statusDraft")} ({news.filter((n) => n.status === "draft").length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === "published"
                ? "bg-[#F5C21B] text-zinc-950 font-semibold"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {t("statusPublished")} ({news.filter((n) => n.status === "published").length})
          </button>
        </div>
      </div>

      {/* Articles Grid / List */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
          <div className="text-4xl mb-3">📰</div>
          <p className="text-zinc-400 text-sm">{t("noNewsFound")}</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-hidden bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t("columns.article")}</th>
                  <th className="px-5 py-3.5">{t("columns.status")}</th>
                  <th className="px-5 py-3.5">{t("columns.publishedDate")}</th>
                  <th className="px-5 py-3.5">{t("columns.createdDate")}</th>
                  <th className="px-5 py-3.5 text-right">{t("columns.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Article Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0">
                          {item.cover_image_url ? (
                            <SafeImage
                              src={item.cover_image_url}
                              alt={item.title_hy}
                              fill
                              className="object-cover"
                              fallbackText="No Image"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100 flex items-center gap-2">
                            <span>
                              {item.source_locale === "ru"
                                ? item.title_ru || item.title_hy || item.title_en
                                : item.source_locale === "en"
                                ? item.title_en || item.title_hy || item.title_ru
                                : item.title_hy || item.title_ru || item.title_en}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                              {item.source_locale || "hy"}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 font-mono">/{item.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          item.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {item.status === "published" ? t("statusPublished") : t("statusDraft")}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-4 text-xs text-zinc-400 whitespace-nowrap">
                      {formatDate(item.published_at)}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/${locale}/admin/news/${item.id}/edit`}
                        className="inline-flex px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        {t("edit")}
                      </Link>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="inline-flex px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors"
                      >
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS LAYOUT */}
          <div className="md:hidden space-y-4">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 relative rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0">
                    {item.cover_image_url ? (
                      <Image
                        src={item.cover_image_url}
                        alt={item.title_hy}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-zinc-100 text-sm leading-tight">
                      {item.title_hy}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">/{item.slug}</div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        item.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {item.status === "published" ? t("statusPublished") : t("statusDraft")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                  <span className="text-zinc-500">{formatDate(item.published_at || item.created_at)}</span>
                  <div className="space-x-2">
                    <Link
                      href={`/${locale}/admin/news/${item.id}/edit`}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      {t("edit")}
                    </Link>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="px-3 py-1 bg-rose-950/60 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100">{t("delete")}</h3>
            <p className="text-sm text-zinc-400">{t("confirmDelete")}</p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
              >
                {t("form.cancel")}
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-lg transition-colors"
              >
                {isDeleting ? t("form.saving") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
