"use server";

import { requireAdmin } from "@/lib/auth/auth.server";
import { createClient } from "@/lib/supabase/server";
import type { OrderRequestStatus } from "@/lib/supabase/types";

const VALID_STATUSES: OrderRequestStatus[] = [
  "new",
  "in_progress",
  "contacted",
  "closed",
  "cancelled",
];

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderRequestStatus
): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Enforce Server Admin Authorization
    await requireAdmin();

    // 2. Validate Status Parameter
    if (!VALID_STATUSES.includes(newStatus)) {
      return { success: false, message: "Invalid status value" };
    }

    if (!orderId || typeof orderId !== "string") {
      return { success: false, message: "Invalid order ID" };
    }

    // 3. Perform Server Database Update
    const supabase = await createClient();
    const { error } = await supabase
      .from("order_requests")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("[Admin Status Update Error]", error.message);
      return { success: false, message: "Failed to update order status in database" };
    }

    return { success: true };
  } catch (err) {
    console.error("[Admin Status Action Exception]", err instanceof Error ? err.message : String(err));
    return { success: false, message: "Unauthorized or server error" };
  }
}
