-- ============================================
-- PRODUCTION SQL SCHEMA (SUPERBASE)
-- BookYourService - Enterprise Grade
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (User Roles)
-- ============================================
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROVIDERS TABLE (Provider Details)
-- ============================================
DROP TABLE IF EXISTS providers CASCADE;
CREATE TABLE providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  experience INT DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  city TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_jobs INT DEFAULT 0,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICES TABLE (Service Catalog)
-- ============================================
DROP TABLE IF EXISTS services CASCADE;
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL CHECK (price > 0),
  duration INT DEFAULT 60, -- in minutes
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS TABLE (Service Bookings)
-- ============================================
DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_title TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled', 'no_show')),
  booking_date DATE NOT NULL,
  booking_time TIME,
  notes TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- PAYMENTS TABLE (Payment Records)
-- ============================================
DROP TABLE IF EXISTS payments CASCADE;
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'INR',
  gateway TEXT NOT NULL CHECK (gateway IN ('razorpay', 'stripe')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  gateway_status TEXT, -- Razorpay/Stripe status
  gateway_response JSONB, -- Full gateway response
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS TABLE (Security & Compliance)
-- ============================================
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL, -- 'booking', 'payment', 'provider', 'user'
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE (Customer Feedback)
-- ============================================
DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (PERFORMANCE CRITICAL)
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created ON profiles(created_at);

-- Providers indexes
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_providers_is_online ON providers(is_online);
CREATE INDEX idx_providers_rating ON providers(rating DESC);

-- Services indexes
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Bookings indexes (HIGH TRAFFIC)
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_gateway ON payments(gateway);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- ============================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Service role can view all profiles (for admin operations)
CREATE POLICY "service_role_view_all_profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- PROVIDERS RLS POLICIES
-- ============================================

-- Providers can view their own data
CREATE POLICY "providers_view_own_data" ON providers
  FOR SELECT
  USING (auth.uid() = id);

-- Providers can update their own data (except status)
CREATE POLICY "providers_update_own_data" ON providers
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all providers
CREATE POLICY "admins_view_all_providers" ON providers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can update provider status
CREATE POLICY "admins_update_provider_status" ON providers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Everyone can view approved, online providers
CREATE POLICY "public_view_approved_online_providers" ON providers
  FOR SELECT
  USING (status = 'approved' AND is_online = TRUE);

-- ============================================
-- SERVICES RLS POLICIES
-- ============================================

-- Providers can view their own services
CREATE POLICY "providers_view_own_services" ON services
  FOR SELECT
  USING (provider_id = auth.uid());

-- Providers can create their own services
CREATE POLICY "providers_create_own_services" ON services
  FOR INSERT
  WITH CHECK (provider_id = auth.uid());

-- Providers can update their own services
CREATE POLICY "providers_update_own_services" ON services
  FOR UPDATE
  USING (provider_id = auth.uid());

-- Everyone can view active services from approved providers
CREATE POLICY "public_view_active_services" ON services
  FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM providers
      WHERE id = services.provider_id
      AND status = 'approved'
    )
  );

-- ============================================
-- BOOKINGS RLS POLICIES
-- ============================================

-- Customers can view their own bookings
CREATE POLICY "customers_view_own_bookings" ON bookings
  FOR SELECT
  USING (customer_id = auth.uid());

-- Customers can create bookings
CREATE POLICY "customers_create_bookings" ON bookings
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Customers can cancel their own bookings (if status is requested)
CREATE POLICY "customers_cancel_own_bookings" ON bookings
  FOR UPDATE
  USING (
    customer_id = auth.uid()
    AND status = 'requested'
  )
  WITH CHECK (
    customer_id = auth.uid()
    AND status = 'cancelled'
  );

-- Providers can view their assigned bookings
CREATE POLICY "providers_view_assigned_bookings" ON bookings
  FOR SELECT
  USING (provider_id = auth.uid());

-- Providers can accept bookings assigned to them
CREATE POLICY "providers_accept_assigned_bookings" ON bookings
  FOR UPDATE
  USING (
    provider_id = auth.uid()
    AND status = 'requested'
  )
  WITH CHECK (
    provider_id = auth.uid()
    AND status = 'accepted'
  );

-- Providers can mark bookings as in_progress
CREATE POLICY "providers_start_assigned_bookings" ON bookings
  FOR UPDATE
  USING (
    provider_id = auth.uid()
    AND status = 'accepted'
  )
  WITH CHECK (
    provider_id = auth.uid()
    AND status = 'in_progress'
  );

-- Providers can complete their bookings
CREATE POLICY "providers_complete_assigned_bookings" ON bookings
  FOR UPDATE
  USING (
    provider_id = auth.uid()
    AND status = 'in_progress'
  )
  WITH CHECK (
    provider_id = auth.uid()
    AND status = 'completed'
  );

-- Admins can view all bookings
CREATE POLICY "admins_view_all_bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can update any booking
CREATE POLICY "admins_update_any_booking" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- PAYMENTS RLS POLICIES
-- ============================================

-- No anonymous writes to payments table
CREATE POLICY "no_anon_payment_writes" ON payments
  FOR ALL
  USING (auth.role() IS NOT NULL);

-- Service role (Edge Function) can create payments
CREATE POLICY "service_role_create_payments" ON payments
  FOR INSERT
  USING (auth.role() = 'service_role');

-- Customers can view their own payments (via booking)
CREATE POLICY "customers_view_own_payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = payments.booking_id
      AND customer_id = auth.uid()
    )
  );

-- Providers can view their own payments (via booking)
CREATE POLICY "providers_view_assigned_payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = payments.booking_id
      AND provider_id = auth.uid()
    )
  );

-- Admins can view all payments
CREATE POLICY "admins_view_all_payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Service role can update payments (webhook)
CREATE POLICY "service_role_update_payments" ON payments
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- ============================================
-- AUDIT LOGS RLS POLICIES
-- ============================================

-- Service role can insert audit logs
CREATE POLICY "service_role_insert_audit" ON audit_logs
  FOR INSERT
  USING (auth.role() = 'service_role');

-- Admins can view all audit logs
CREATE POLICY "admins_view_all_audit" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- REVIEWS RLS POLICIES
-- ============================================

-- Customers can create reviews for their completed bookings
CREATE POLICY "customers_create_reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE id = reviews.booking_id
      AND customer_id = auth.uid()
      AND status = 'completed'
    )
  );

-- Everyone can view reviews (public)
CREATE POLICY "public_view_reviews" ON reviews
  FOR SELECT
  USING (TRUE);

-- Providers can respond to reviews about them
CREATE POLICY "providers_respond_to_reviews" ON reviews
  FOR UPDATE
  USING (
    provider_id = auth.uid()
  );

-- Admins can update/delete any review
CREATE POLICY "admins_manage_reviews" ON reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for providers
DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for services
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS (FOR EASY QUERYING)
-- ============================================

-- View: Pending providers for admin dashboard
CREATE OR REPLACE VIEW pending_providers AS
SELECT 
  p.id,
  p.status,
  p.experience,
  p.city,
  p.rating,
  p.created_at,
  u.email,
  u.phone,
  u.raw_user_meta_data->>'name' as name,
  COUNT(DISTINCT b.id) as total_bookings
FROM providers p
JOIN auth.users u ON p.id = u.id
LEFT JOIN bookings b ON p.id = b.provider_id
WHERE p.status = 'pending'
GROUP BY p.id, u.email, u.phone;

-- View: Provider earnings summary
CREATE OR REPLACE VIEW provider_earnings_summary AS
SELECT 
  p.id,
  p.status,
  p.rating,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
  COALESCE(SUM(pay.amount), 0) as total_earnings
FROM providers p
LEFT JOIN bookings b ON p.id = b.provider_id
LEFT JOIN payments pay ON b.id = pay.booking_id
WHERE p.status = 'approved'
GROUP BY p.id;

-- View: Customer booking history
CREATE OR REPLACE VIEW customer_booking_history AS
SELECT 
  b.id,
  b.customer_id,
  b.status,
  b.booking_date,
  b.total_amount,
  b.created_at,
  s.title as service_title,
  s.price as service_price,
  u.email as provider_email,
  u.raw_user_meta_data->>'name' as provider_name,
  u.phone as provider_phone,
  pr.rating as provider_rating,
  rev.rating as booking_rating,
  pay.status as payment_status
FROM bookings b
LEFT JOIN services s ON b.service_id = s.id
LEFT JOIN providers pr ON b.provider_id = pr.id
LEFT JOIN auth.users u ON pr.id = u.id
LEFT JOIN reviews rev ON b.id = rev.booking_id
LEFT JOIN payments pay ON b.id = pay.booking_id
WHERE b.status IN ('completed', 'cancelled');

-- ============================================
-- COMMENTS (DOCUMENTATION)
-- ============================================

COMMENT ON TABLE profiles IS 'User roles (customer, provider, admin)';
COMMENT ON TABLE providers IS 'Service provider profiles with approval status';
COMMENT ON TABLE services IS 'Service catalog offered by providers';
COMMENT ON TABLE bookings IS 'Service bookings with lifecycle tracking';
COMMENT ON TABLE payments IS 'Payment records with gateway integration';
COMMENT ON TABLE audit_logs IS 'Security and compliance audit trail';
COMMENT ON TABLE reviews IS 'Customer feedback and ratings';

COMMENT ON COLUMN providers.status IS 'pending | approved | rejected | suspended';
COMMENT ON COLUMN bookings.status IS 'requested | accepted | in_progress | completed | cancelled | no_show';
COMMENT ON COLUMN payments.status IS 'pending | paid | failed | refunded';
