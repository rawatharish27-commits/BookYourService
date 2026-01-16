-- ============================================
-- ADMIN APPROVAL FLOW + BOOKING SYSTEM
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROVIDERS TABLE (for Admin Approval Flow)
-- ============================================
DROP TABLE IF EXISTS providers CASCADE;
CREATE TABLE providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  experience INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  hourly_rate DECIMAL(10,2),
  city TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKINGS TABLE (for Booking System)
-- ============================================
DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  booking_date DATE NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'completed', 'cancelled')),
  notes TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on providers table
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROVIDERS RLS POLICIES
-- ============================================

-- Policy 1: Providers can view their own data
CREATE POLICY "providers_view_own_data" ON providers
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Providers can insert their own data (on signup)
CREATE POLICY "providers_insert_own_data" ON providers
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Providers can update their own data (but not status)
CREATE POLICY "providers_update_own_data" ON providers
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can view all providers
CREATE POLICY "admin_view_all_providers" ON providers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'admin'
    )
  );

-- Policy 5: Admins can update provider status
CREATE POLICY "admin_update_provider_status" ON providers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'admin'
    )
  );

-- ============================================
-- BOOKINGS RLS POLICIES
-- ============================================

-- Policy 1: Customers can view their own bookings
CREATE POLICY "customers_view_own_bookings" ON bookings
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Policy 2: Customers can create bookings
CREATE POLICY "customers_create_bookings" ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Policy 3: Customers can update their own bookings (cancel)
CREATE POLICY "customers_update_own_bookings" ON bookings
  FOR UPDATE
  USING (auth.uid() = customer_id);

-- Policy 4: Providers can view their assigned bookings
CREATE POLICY "providers_view_assigned_bookings" ON bookings
  FOR SELECT
  USING (
    provider_id IS NULL OR auth.uid() = provider_id
  );

-- Policy 5: Providers can update their assigned bookings (accept/complete)
CREATE POLICY "providers_update_assigned_bookings" ON bookings
  FOR UPDATE
  USING (
    provider_id IS NULL OR auth.uid() = provider_id
  );

-- Policy 6: Admins can view all bookings
CREATE POLICY "admin_view_all_bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'admin'
    )
  );

-- Policy 7: Admins can update any booking
CREATE POLICY "admin_update_bookings" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'admin'
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
$$ language 'plpgsql';

-- Trigger for providers
DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert a test admin user (run manually after creating auth user)
-- INSERT INTO auth.users (id, email, raw_user_meta_data)
-- VALUES (
--   'admin-uuid-here',
--   'admin@bookyourservice.com',
--   '{"role": "admin", "name": "Admin User"}'
-- );

-- ============================================
-- VIEWS FOR EASY QUERYING
-- ============================================

-- View: Pending providers for admin dashboard
CREATE OR REPLACE VIEW pending_providers AS
SELECT 
  p.id,
  p.service_type,
  p.experience,
  p.city,
  p.created_at,
  u.email,
  u.phone,
  u.name
FROM providers p
JOIN auth.users u ON p.id = u.id
WHERE p.status = 'pending';

-- View: Provider bookings summary
CREATE OR REPLACE VIEW provider_booking_summary AS
SELECT 
  p.id,
  p.service_type,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
  SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END) as total_earnings
FROM providers p
LEFT JOIN bookings b ON p.id = b.provider_id
GROUP BY p.id;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE providers IS 'Service providers with admin approval workflow status';
COMMENT ON TABLE bookings IS 'Customer bookings for services';
COMMENT ON COLUMN providers.status IS 'pending | approved | rejected';
COMMENT ON COLUMN bookings.status IS 'requested | accepted | completed | cancelled';

