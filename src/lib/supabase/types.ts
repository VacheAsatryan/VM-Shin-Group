export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderRequestStatus =
  | "new"
  | "in_progress"
  | "contacted"
  | "closed"
  | "cancelled";

export type SupportedLocale = "hy" | "ru" | "en";

export interface Database {
  public: {
    Tables: {
      order_requests: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          status: OrderRequestStatus;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          locale: SupportedLocale;
          product_slug: string;
          product_name: string;
          product_variant: string | null;
          quantity: number;
          unit: string;
          product_price: number;
          products_total: number;
          delivery_address: string | null;
          delivery_distance_km: number | null;
          delivery_duration_minutes: number | null;
          delivery_price: number | null;
          total_price: number;
          customer_comment: string | null;
          order_payload: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: OrderRequestStatus;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          locale: SupportedLocale;
          product_slug: string;
          product_name: string;
          product_variant?: string | null;
          quantity: number;
          unit: string;
          product_price: number;
          products_total: number;
          delivery_address?: string | null;
          delivery_distance_km?: number | null;
          delivery_duration_minutes?: number | null;
          delivery_price?: number | null;
          total_price: number;
          customer_comment?: string | null;
          order_payload?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: OrderRequestStatus;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          locale?: SupportedLocale;
          product_slug?: string;
          product_name?: string;
          product_variant?: string | null;
          quantity?: number;
          unit?: string;
          product_price?: number;
          products_total?: number;
          delivery_address?: string | null;
          delivery_distance_km?: number | null;
          delivery_duration_minutes?: number | null;
          delivery_price?: number | null;
          total_price?: number;
          customer_comment?: string | null;
          order_payload?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type OrderRequestRow = Database["public"]["Tables"]["order_requests"]["Row"];
export type OrderRequestInsert = Database["public"]["Tables"]["order_requests"]["Insert"];
export type OrderRequestUpdate = Database["public"]["Tables"]["order_requests"]["Update"];
