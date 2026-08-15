"use client";

import { useState, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { OrderRequestRow, OrderRequestStatus } from "@/lib/supabase/types";
import { updateOrderStatusAction } from "@/app/[locale]/admin/(dashboard)/requests/actions";

interface AdminRequestsManagerProps {
  initialRequests: OrderRequestRow[];
  locale: string;
}

const STATUS_OPTIONS: OrderRequestStatus[] = [
  "new",
  "in_progress",
  "contacted",
  "closed",
  "cancelled",
];

const STATUS_BADGE_CLASSES: Record<OrderRequestStatus, string> = {
  new: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  contacted: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  closed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

export default function AdminRequestsManager({
  initialRequests,
}: AdminRequestsManagerProps) {
  const t = useTranslations("adminRequests");
  const [, startTransition] = useTransition();

  const [requests, setRequests] = useState<OrderRequestRow[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const PAGE_SIZE = 20;

  // Search & Filter Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Status Filter
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false;
      }

      // 2. Search Query (Customer Name, Phone, Email)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = req.customer_name.toLowerCase().includes(query);
        const phoneMatch = req.customer_phone.toLowerCase().includes(query);
        const emailMatch = req.customer_email ? req.customer_email.toLowerCase().includes(query) : false;

        return nameMatch || phoneMatch || emailMatch;
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);

  const paginatedRequests = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPageSafe]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Status Mutation Handler
  const handleStatusChange = (orderId: string, newStatus: OrderRequestStatus) => {
    setUpdatingId(orderId);
    
    // Optimistic Update
    setRequests((prev) =>
      prev.map((item) => (item.id === orderId ? { ...item, status: newStatus } : item))
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus);
      setUpdatingId(null);

      if (!res.success) {
        // Revert on error
        setRequests(initialRequests);
        setToastMessage({ text: res.message || t("statusUpdateError"), isError: true });
      } else {
        setToastMessage({ text: t("statusUpdatedSuccess") });
      }

      setTimeout(() => setToastMessage(null), 3000);
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("hy-AM", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(val) + " ֏";
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("hy-AM", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getStatusLabel = (status: OrderRequestStatus) => {
    switch (status) {
      case "new":
        return t("statusNew");
      case "in_progress":
        return t("statusInProgress");
      case "contacted":
        return t("statusContacted");
      case "closed":
        return t("statusClosed");
      case "cancelled":
        return t("statusCancelled");
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium transition-all ${
            toastMessage.isError
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{t("title")}</h1>
          <p className="text-sm text-zinc-400 mt-1">{t("subtitle")}</p>
        </div>
        <div className="text-xs text-zinc-400 bg-zinc-900/80 px-3 py-2 rounded-lg border border-zinc-800 self-start sm:self-auto">
          {t("pagination.showing", {
            from: filteredRequests.length === 0 ? 0 : (currentPageSafe - 1) * PAGE_SIZE + 1,
            to: Math.min(currentPageSafe * PAGE_SIZE, filteredRequests.length),
            total: filteredRequests.length,
          })}
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        {/* Search Bar */}
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#F5C21B] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-[#F5C21B] text-zinc-950 font-semibold"
                : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {t("filterAll")} ({requests.length})
          </button>
          {STATUS_OPTIONS.map((st) => {
            const count = requests.filter((r) => r.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => handleFilterChange(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? "bg-[#F5C21B] text-zinc-950 font-semibold"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {getStatusLabel(st)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {paginatedRequests.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
          <div className="text-4xl mb-3">📥</div>
          <p className="text-zinc-400 text-sm">{t("noRequestsFound")}</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE (Hidden on Mobile) */}
          <div className="hidden md:block overflow-hidden bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t("columns.orderId")}</th>
                  <th className="px-5 py-3.5">{t("columns.date")}</th>
                  <th className="px-5 py-3.5">{t("columns.customer")}</th>
                  <th className="px-5 py-3.5">{t("columns.phone")}</th>
                  <th className="px-5 py-3.5">{t("columns.product")}</th>
                  <th className="px-5 py-3.5">{t("columns.quantity")}</th>
                  <th className="px-5 py-3.5">{t("columns.totalPrice")}</th>
                  <th className="px-5 py-3.5">{t("columns.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {paginatedRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedOrder(req)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Order ID */}
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[#F5C21B] group-hover:underline">
                      #{req.id.slice(0, 8)}
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-zinc-400 whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                    {/* Customer */}
                    <td className="px-5 py-4 font-medium text-zinc-100">
                      {req.customer_name}
                      {req.customer_email && (
                        <div className="text-xs text-zinc-500 font-normal">{req.customer_email}</div>
                      )}
                    </td>
                    {/* Phone */}
                    <td className="px-5 py-4 text-xs font-mono text-zinc-300 whitespace-nowrap">
                      {req.customer_phone}
                    </td>
                    {/* Product */}
                    <td className="px-5 py-4">
                      {req.product_slug === "consultation" ? (
                        <div className="font-semibold text-purple-400 flex items-center gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                            💬 Խորհրդատվություն / Consultation
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-zinc-200">{req.product_name}</div>
                          {req.product_variant && (
                            <div className="text-xs text-zinc-400">{req.product_variant}</div>
                          )}
                        </>
                      )}
                    </td>
                    {/* Quantity */}
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-zinc-300">
                      {req.product_slug === "consultation" ? (
                        <span className="text-zinc-500">—</span>
                      ) : (
                        `${req.quantity} ${req.unit}`
                      )}
                    </td>
                    {/* Total Price */}
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-zinc-100">
                      {req.product_slug === "consultation" ? (
                        <span className="text-zinc-500">—</span>
                      ) : (
                        formatCurrency(req.total_price)
                      )}
                    </td>
                    {/* Status Dropdown Badge */}
                    <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={req.status}
                        disabled={updatingId === req.id}
                        onChange={(e) =>
                          handleStatusChange(req.id, e.target.value as OrderRequestStatus)
                        }
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none transition-colors ${
                          STATUS_BADGE_CLASSES[req.status]
                        }`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st} className="bg-zinc-900 text-zinc-200">
                            {getStatusLabel(st)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS LAYOUT (Visible on Mobile) */}
          <div className="md:hidden space-y-4">
            {paginatedRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedOrder(req)}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3 cursor-pointer hover:border-zinc-700 transition-colors"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                  <div className="font-mono text-xs font-bold text-[#F5C21B]">
                    #{req.id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-zinc-400">{formatDate(req.created_at)}</div>
                </div>

                {/* Card Customer & Product Info */}
                <div className="space-y-1">
                  <div className="font-semibold text-zinc-100 text-base">{req.customer_name}</div>
                  <div className="text-xs font-mono text-zinc-400">{req.customer_phone}</div>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/40 text-xs space-y-1">
                  {req.product_slug === "consultation" ? (
                    <div className="font-semibold text-purple-400 flex items-center gap-1.5 text-xs py-1">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                        💬 Խորհրդատվություն / Consultation
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-zinc-200">{req.product_name}</div>
                      {req.product_variant && (
                        <div className="text-zinc-400">{req.product_variant}</div>
                      )}
                      <div className="flex justify-between items-center pt-1 text-zinc-300 font-medium">
                        <span>
                          {req.quantity} {req.unit}
                        </span>
                        <span className="font-bold text-[#F5C21B] text-sm">
                          {formatCurrency(req.total_price)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Card Footer Status Dropdown */}
                <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-zinc-400 font-medium">{t("columns.status")}:</span>
                  <select
                    value={req.status}
                    disabled={updatingId === req.id}
                    onChange={(e) =>
                      handleStatusChange(req.id, e.target.value as OrderRequestStatus)
                    }
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border appearance-none cursor-pointer focus:outline-none transition-colors ${
                      STATUS_BADGE_CLASSES[req.status]
                    }`}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-zinc-900 text-zinc-200">
                        {getStatusLabel(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
              <button
                disabled={currentPageSafe === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← {t("pagination.previous")}
              </button>

              <span className="text-xs text-zinc-400 font-medium">
                {currentPageSafe} / {totalPages}
              </span>

              <button
                disabled={currentPageSafe === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t("pagination.next")} →
              </button>
            </div>
          )}
        </>
      )}

      {/* DETAILS DRAWER / OVERLAY MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">{t("drawer.title")}</h2>
                  <p className="text-xs font-mono text-[#F5C21B] mt-0.5">#{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Status Selector in Drawer */}
              <div className="flex items-center justify-between bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-xs font-medium text-zinc-400">{t("columns.status")}:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderRequestStatus)
                  }
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none transition-colors ${
                    STATUS_BADGE_CLASSES[selectedOrder.status]
                  }`}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st} className="bg-zinc-900 text-zinc-200">
                      {getStatusLabel(st)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 1. Customer Section */}
              <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5C21B]">
                  {t("drawer.customerSection")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">{t("drawer.name")}</span>
                    <span className="text-zinc-200 font-semibold">{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">{t("drawer.phone")}</span>
                    <span className="text-zinc-200 font-mono font-semibold">{selectedOrder.customer_phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-500 block">{t("drawer.email")}</span>
                    <span className="text-zinc-200 font-mono">
                      {selectedOrder.customer_email || t("drawer.notSpecified")}
                    </span>
                  </div>
                  {selectedOrder.customer_comment && (
                    <div className="sm:col-span-2 pt-2 border-t border-zinc-800/60">
                      <span className="text-zinc-500 block mb-1">{t("drawer.comment")}</span>
                      <p className="text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60 text-xs whitespace-pre-wrap">
                        {selectedOrder.customer_comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Order Details Section */}
              <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5C21B]">
                  {selectedOrder.product_slug === "consultation" ? "Խորհրդատվության Հայտ" : t("drawer.orderSection")}
                </h3>
                {selectedOrder.product_slug === "consultation" ? (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-2">
                    <span>💬</span>
                    <span>Խորհրդատվություն / Consultation Request</span>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs divide-y divide-zinc-800/40">
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">{t("drawer.product")}:</span>
                      <span className="font-semibold text-zinc-100">{selectedOrder.product_name}</span>
                    </div>
                    {selectedOrder.product_variant && (
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">{t("drawer.variant")}:</span>
                        <span className="text-zinc-200">{selectedOrder.product_variant}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">{t("drawer.quantity")}:</span>
                      <span className="font-medium text-zinc-200">
                        {selectedOrder.quantity} {selectedOrder.unit}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">{t("drawer.productPrice")}:</span>
                      <span className="font-mono text-zinc-300">
                        {formatCurrency(selectedOrder.product_price)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">{t("drawer.productsTotal")}:</span>
                      <span className="font-mono text-zinc-200">
                        {formatCurrency(selectedOrder.products_total)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">{t("drawer.deliveryPrice")}:</span>
                      <span className="font-mono text-zinc-300">
                        {(selectedOrder.product_slug === "concrete" && selectedOrder.delivery_distance_km !== null && selectedOrder.delivery_distance_km > 40)
                          ? t("drawer.determinedAfterOrder")
                          : selectedOrder.delivery_price !== null
                          ? formatCurrency(selectedOrder.delivery_price)
                          : t("drawer.notCalculated")}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 text-sm font-bold">
                      <span className="text-zinc-100">{t("drawer.totalPrice")}:</span>
                      <div className="flex flex-col items-end">
                        <span className="text-[#F5C21B] font-mono">
                          {(selectedOrder.product_slug === "concrete" && selectedOrder.delivery_distance_km !== null && selectedOrder.delivery_distance_km > 40)
                            ? t("drawer.determinedAfterOrder")
                            : formatCurrency(selectedOrder.total_price)}
                        </span>
                        {!(selectedOrder.product_slug === "concrete" && selectedOrder.delivery_distance_km !== null && selectedOrder.delivery_distance_km > 40) && (
                          <span className="text-[10px] text-zinc-500 font-normal block mt-0.5">
                            ({t("drawer.vatIncluded")})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Delivery Section */}
              <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5C21B]">
                  {t("drawer.deliverySection")}
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500 block mb-0.5">{t("drawer.deliveryAddress")}</span>
                    <span className="text-zinc-200">
                      {selectedOrder.delivery_address || t("drawer.notSpecified")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/40">
                    <div>
                      <span className="text-zinc-500 block">{t("drawer.distance")}</span>
                      <span className="text-zinc-200 font-mono font-medium">
                        {selectedOrder.delivery_distance_km !== null
                          ? `${selectedOrder.delivery_distance_km} km`
                          : t("drawer.notCalculated")}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">{t("drawer.duration")}</span>
                      <span className="text-zinc-200 font-mono font-medium">
                        {selectedOrder.delivery_duration_minutes !== null
                          ? `${selectedOrder.delivery_duration_minutes} min`
                          : t("drawer.notCalculated")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
              >
                {t("drawer.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
