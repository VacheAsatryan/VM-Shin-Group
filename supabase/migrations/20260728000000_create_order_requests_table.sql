-- Migration: 20260728000000_create_order_requests_table.sql
-- Description: Create private schema, admin_users allowlist table, is_admin() SECURITY DEFINER function, order_requests table with validation constraints, updated_at trigger, indexes, explicit privileges, and RLS policies.

-- 1. Private Schema for Internal Authorization Infrastructure
CREATE SCHEMA IF NOT EXISTS private;

-- Restrict schema usage
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

-- 2. Private Admin Users Allowlist Table
CREATE TABLE IF NOT EXISTS private.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE private.admin_users IS 'Private allowlist table containing authorized administrator Supabase auth.users UUIDs.';

-- Revoke all direct client access on private.admin_users
REVOKE ALL ON TABLE private.admin_users FROM PUBLIC, anon, authenticated;

-- Enable RLS on private.admin_users (fail-closed, no direct client access)
ALTER TABLE private.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Secure SECURITY DEFINER Helper Function
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = private, auth, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM private.admin_users
        WHERE user_id = auth.uid()
    );
END;
$$;

COMMENT ON FUNCTION private.is_admin() IS 'Evaluates whether the currently authenticated Supabase session auth.uid() exists in private.admin_users allowlist.';

-- Permissions on private.is_admin()
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- 4. Customer Order Requests Table (Public Schema)
CREATE TABLE IF NOT EXISTS public.order_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'closed', 'cancelled')),
    customer_name TEXT NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 100),
    customer_phone TEXT NOT NULL CHECK (char_length(customer_phone) BETWEEN 3 AND 50),
    customer_email TEXT NULL CHECK (customer_email IS NULL OR char_length(customer_email) <= 255),
    locale TEXT NOT NULL CHECK (locale IN ('hy', 'ru', 'en')),
    product_slug TEXT NOT NULL CHECK (char_length(product_slug) BETWEEN 1 AND 100),
    product_name TEXT NOT NULL CHECK (char_length(product_name) BETWEEN 1 AND 150),
    product_variant TEXT NULL CHECK (product_variant IS NULL OR char_length(product_variant) <= 150),
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL CHECK (char_length(unit) BETWEEN 1 AND 20),
    product_price NUMERIC(12, 2) NOT NULL CHECK (product_price >= 0),
    products_total NUMERIC(12, 2) NOT NULL CHECK (products_total >= 0),
    delivery_address TEXT NULL CHECK (delivery_address IS NULL OR char_length(delivery_address) <= 500),
    delivery_distance_km NUMERIC(8, 2) NULL CHECK (delivery_distance_km IS NULL OR delivery_distance_km >= 0),
    delivery_duration_minutes NUMERIC(8, 2) NULL CHECK (delivery_duration_minutes IS NULL OR delivery_duration_minutes >= 0),
    delivery_price NUMERIC(12, 2) NULL CHECK (delivery_price IS NULL OR delivery_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    customer_comment TEXT NULL CHECK (customer_comment IS NULL OR char_length(customer_comment) <= 2000),
    order_payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Comments on Table & Columns
COMMENT ON TABLE public.order_requests IS 'Stores customer order requests submitted from the calculator or order forms.';
COMMENT ON COLUMN public.order_requests.id IS 'Unique order request identifier (UUIDv4).';
COMMENT ON COLUMN public.order_requests.created_at IS 'Timestamp when the order request was created.';
COMMENT ON COLUMN public.order_requests.updated_at IS 'Timestamp when the order request was last updated.';
COMMENT ON COLUMN public.order_requests.status IS 'Order request status: new, in_progress, contacted, closed, cancelled.';
COMMENT ON COLUMN public.order_requests.customer_name IS 'Full name of the customer.';
COMMENT ON COLUMN public.order_requests.customer_phone IS 'Contact phone number of the customer.';
COMMENT ON COLUMN public.order_requests.customer_email IS 'Optional contact email of the customer.';
COMMENT ON COLUMN public.order_requests.locale IS 'Language locale used during submission (hy, ru, en).';
COMMENT ON COLUMN public.order_requests.product_slug IS 'Unique identifier/slug of the requested product.';
COMMENT ON COLUMN public.order_requests.product_name IS 'Human-readable name of the requested product.';
COMMENT ON COLUMN public.order_requests.product_variant IS 'Optional variant/specification of the product.';
COMMENT ON COLUMN public.order_requests.quantity IS 'Quantity of product ordered (must be > 0).';
COMMENT ON COLUMN public.order_requests.unit IS 'Measurement unit (e.g., m3, t, pcs).';
COMMENT ON COLUMN public.order_requests.product_price IS 'Unit price of the product in AMD.';
COMMENT ON COLUMN public.order_requests.products_total IS 'Total cost of products before delivery in AMD.';
COMMENT ON COLUMN public.order_requests.delivery_address IS 'Optional delivery destination address.';
COMMENT ON COLUMN public.order_requests.delivery_distance_km IS 'Calculated delivery distance in kilometers.';
COMMENT ON COLUMN public.order_requests.delivery_duration_minutes IS 'Calculated delivery duration in minutes.';
COMMENT ON COLUMN public.order_requests.delivery_price IS 'Calculated delivery price in AMD.';
COMMENT ON COLUMN public.order_requests.total_price IS 'Final order total price in AMD.';
COMMENT ON COLUMN public.order_requests.customer_comment IS 'Optional customer notes or instructions.';
COMMENT ON COLUMN public.order_requests.order_payload IS 'Full JSON payload of original order submission for future compatibility.';

-- Automated updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute update_updated_at_column on order_requests
DROP TRIGGER IF EXISTS set_order_requests_updated_at ON public.order_requests;
CREATE TRIGGER set_order_requests_updated_at
    BEFORE UPDATE ON public.order_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_requests_created_at ON public.order_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_requests_status ON public.order_requests (status);
CREATE INDEX IF NOT EXISTS idx_order_requests_customer_phone ON public.order_requests (customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_requests_customer_email ON public.order_requests (customer_email) WHERE customer_email IS NOT NULL;

-- 5. Table Privileges & Row Level Security (RLS) Configuration
REVOKE ALL ON TABLE public.order_requests FROM PUBLIC, anon;
GRANT SELECT, UPDATE ON TABLE public.order_requests TO authenticated;

ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Only exact authorized admin user listed in private.admin_users can SELECT
CREATE POLICY "Allow exact admin user to read order requests"
    ON public.order_requests
    FOR SELECT
    TO authenticated
    USING (private.is_admin());

-- Policy: Only exact authorized admin user listed in private.admin_users can UPDATE
CREATE POLICY "Allow exact admin user to update order requests"
    ON public.order_requests
    FOR UPDATE
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());
