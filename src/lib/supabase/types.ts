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

export type NewsStatus = "draft" | "published";

export type SupportedLocale = "hy" | "ru" | "en";

export interface Database {
  public: {
    Tables: {
      news: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          status: NewsStatus;
          slug: string;
          cover_image_url: string | null;
          title_hy: string;
          title_ru: string;
          title_en: string;
          excerpt_hy: string;
          excerpt_ru: string;
          excerpt_en: string;
          content_hy: string;
          content_ru: string;
          content_en: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          status?: NewsStatus;
          slug: string;
          cover_image_url?: string | null;
          title_hy: string;
          title_ru: string;
          title_en: string;
          excerpt_hy: string;
          excerpt_ru: string;
          excerpt_en: string;
          content_hy: string;
          content_ru: string;
          content_en: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          status?: NewsStatus;
          slug?: string;
          cover_image_url?: string | null;
          title_hy?: string;
          title_ru?: string;
          title_en?: string;
          excerpt_hy?: string;
          excerpt_ru?: string;
          excerpt_en?: string;
          content_hy?: string;
          content_ru?: string;
          content_en?: string;
        };
        Relationships: [];
      };
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

export type NewsRow = Database["public"]["Tables"]["news"]["Row"];
export type NewsInsert = Database["public"]["Tables"]["news"]["Insert"];
export type NewsUpdate = Database["public"]["Tables"]["news"]["Update"];
export type OrderRequestRow = Database["public"]["Tables"]["order_requests"]["Row"];
export type OrderRequestInsert = Database["public"]["Tables"]["order_requests"]["Insert"];
export type OrderRequestUpdate = Database["public"]["Tables"]["order_requests"]["Update"];
