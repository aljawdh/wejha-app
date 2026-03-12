-- ============================================================================
-- قريب - Qreeb Database Schema
-- Enhanced schema for complete coupon platform with Arabic/English support
-- ============================================================================

-- Enable UUID extension and Arabic text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================================
-- Categories Table - Enhanced with multilingual support
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_ar TEXT,
  emoji TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  description_ar TEXT,
  color TEXT DEFAULT '#7C3AED',
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  merchants_count INTEGER DEFAULT 0,
  deals_count INTEGER DEFAULT 0,
  total_savings DECIMAL(10,2) DEFAULT 0,
  icon_url TEXT,
  banner_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Enhanced Merchants Table with complete business info
-- ============================================================================
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_ar TEXT,
  owner_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  whatsapp TEXT,
  category_id UUID REFERENCES categories(id),
  
  -- Location Info
  city TEXT DEFAULT 'الدوحة',
  city_en TEXT DEFAULT 'Doha',
  district TEXT,
  street_address TEXT,
  building_number TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  location_verified BOOLEAN DEFAULT false,
  
  -- Business Info
  commercial_register TEXT,
  cr_expiry_date DATE,
  tax_number TEXT,
  license_type TEXT,
  business_hours JSONB,
  website_url TEXT,
  instagram_handle TEXT,
  
  -- Banking Info
  bank_name TEXT,
  iban TEXT,
  swift_code TEXT,
  account_holder_name TEXT,
  
  -- Status & Metrics
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected', 'inactive')),
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  deals_count INTEGER DEFAULT 0,
  coupons_claimed INTEGER DEFAULT 0,
  coupons_used INTEGER DEFAULT 0,
  
  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images JSONB,
  
  -- Dates
  joined_date DATE DEFAULT CURRENT_DATE,
  last_active_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Enhanced Deals Table with comprehensive deal management
-- ============================================================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Deal Info
  title TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  subtitle TEXT,
  description TEXT,
  description_en TEXT,
  description_ar TEXT,
  category TEXT,
  tags JSONB DEFAULT '[]',
  
  -- Deal Type & Pricing
  deal_type TEXT DEFAULT 'product' CHECK (deal_type IN ('product', 'service', 'bill_discount', 'buy1get1', 'percentage', 'fixed_amount')),
  original_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  final_price DECIMAL(10,2) NOT NULL,
  savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (original_price - final_price) STORED,
  
  -- Availability
  max_coupons INTEGER DEFAULT 100,
  remaining_coupons INTEGER DEFAULT 100,
  max_per_user INTEGER DEFAULT 1,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Timing
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Asia/Qatar',
  
  -- Conditions
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_location BOOLEAN DEFAULT false,
  requires_membership BOOLEAN DEFAULT false,
  terms_conditions TEXT,
  restrictions TEXT,
  
  -- Media
  image_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  
  -- Location (for location-based deals)
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  delivery_available BOOLEAN DEFAULT false,
  pickup_available BOOLEAN DEFAULT true,
  
  -- Metrics
  views_count INTEGER DEFAULT 0,
  claims_count INTEGER DEFAULT 0,
  redemptions_count INTEGER DEFAULT 0,
  
  -- SEO
  slug TEXT,
  meta_title TEXT,
  meta_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Enhanced User Profiles Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  nationality TEXT,
  
  -- Preferences
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  preferred_categories JSONB DEFAULT '[]',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
  
  -- Location
  city TEXT DEFAULT 'الدوحة',
  district TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_sharing_enabled BOOLEAN DEFAULT true,
  
  -- Profile
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT,
  
  -- Metrics
  total_savings DECIMAL(10,2) DEFAULT 0,
  coupons_claimed INTEGER DEFAULT 0,
  coupons_used INTEGER DEFAULT 0,
  favorite_merchants JSONB DEFAULT '[]',
  
  -- Dates
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Enhanced Claimed Coupons Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS claimed_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_phone TEXT NOT NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- Coupon Details
  coupon_code TEXT UNIQUE NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER NOT NULL,
  savings_amount DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  
  -- Status & Timing
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled', 'refunded')),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  
  -- Usage Details
  used_by_staff_id UUID,
  usage_location JSONB,
  usage_notes TEXT,
  
  -- Payment & Commission
  commission_amount DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Verification
  verification_code TEXT,
  qr_code_data TEXT,
  barcode_data TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Enhanced Admin Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role & Permissions
  role TEXT DEFAULT 'support' CHECK (role IN ('super_admin', 'admin', 'merchant_manager', 'finance_manager', 'support', 'moderator', 'analyst')),
  permissions JSONB DEFAULT '[]',
  department TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Contact
  phone TEXT,
  emergency_contact TEXT,
  
  -- Activity
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Enhanced Payouts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  -- Amounts
  gross_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  coupons_count INTEGER DEFAULT 0,
  deals_count INTEGER DEFAULT 0,
  
  -- Banking
  bank_name TEXT NOT NULL,
  iban TEXT NOT NULL,
  swift_code TEXT,
  account_holder_name TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'check', 'cash')),
  
  -- Dates
  scheduled_date DATE NOT NULL,
  processed_date DATE,
  paid_date DATE,
  
  -- References
  transaction_reference TEXT,
  bank_reference TEXT,
  invoice_number TEXT,
  
  -- Notes
  notes TEXT,
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Complaints & Support Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Type & Target
  type TEXT NOT NULL CHECK (type IN ('merchant', 'deal', 'coupon', 'payment', 'technical', 'account', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Reporter
  reporter_phone TEXT,
  reporter_name TEXT,
  reporter_email TEXT,
  
  -- Target
  target_merchant_id UUID REFERENCES merchants(id),
  target_deal_id UUID REFERENCES deals(id),
  target_coupon_id UUID REFERENCES claimed_coupons(id),
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'escalated')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Assignment
  assigned_to UUID REFERENCES admin_users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_type TEXT,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- App Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Notifications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_phone TEXT,
  recipient_email TEXT,
  recipient_admin_id UUID REFERENCES admin_users(id),
  
  -- Content
  title TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_en TEXT,
  message_ar TEXT,
  
  -- Type & Channel
  type TEXT NOT NULL CHECK (type IN ('deal', 'coupon', 'payment', 'system', 'marketing', 'reminder')),
  channel TEXT NOT NULL CHECK (channel IN ('push', 'sms', 'email', 'in_app')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  
  -- Metadata
  data JSONB DEFAULT '{}',
  
  -- Timing
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_visible ON categories(is_visible);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Merchants indexes
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category_id);
CREATE INDEX IF NOT EXISTS idx_merchants_city ON merchants(city);
CREATE INDEX IF NOT EXISTS idx_merchants_location ON merchants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_merchants_rating ON merchants(rating);

-- Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_merchant ON deals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_featured ON deals(is_featured);
CREATE INDEX IF NOT EXISTS idx_deals_expires ON deals(expires_at);
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_type ON deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_location ON deals(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_deals_price ON deals(final_price);
CREATE INDEX IF NOT EXISTS idx_deals_discount ON deals(discount_percent);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON user_profiles(city);
CREATE INDEX IF NOT EXISTS idx_users_verified ON user_profiles(is_verified);

-- Coupons indexes
CREATE INDEX IF NOT EXISTS idx_coupons_user ON claimed_coupons(user_phone);
CREATE INDEX IF NOT EXISTS idx_coupons_merchant ON claimed_coupons(merchant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_deal ON claimed_coupons(deal_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON claimed_coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON claimed_coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupons_expires ON claimed_coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_used_at ON claimed_coupons(used_at);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_merchant ON payouts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON payouts(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payouts_scheduled ON payouts(scheduled_date);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_phone ON notifications(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_notifications_admin ON notifications(recipient_admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_at);

-- ============================================================================
-- Insert Default Data
-- ============================================================================

-- Default Categories (Arabic/English)
INSERT INTO categories (name, name_en, name_ar, emoji, description, description_en, description_ar, color, order_index, is_visible, is_featured, slug) VALUES
('مطاعم', 'Restaurants', 'مطاعم', '🍽️', 'مطاعم ووجبات جاهزة', 'Restaurants and fast food', 'مطاعم ووجبات جاهزة', '#E85C3A', 1, true, true, 'restaurants'),
('مقاهي', 'Cafes', 'مقاهي', '☕', 'مقاهي ومشروبات', 'Cafes and beverages', 'مقاهي ومشروبات', '#C9A84C', 2, true, true, 'cafes'),
('بوتيك وعطور', 'Fashion & Perfumes', 'بوتيك وعطور', '👗', 'ملابس وأزياء وعطور', 'Fashion, clothing and perfumes', 'ملابس وأزياء وعطور', '#C45AE0', 3, true, true, 'fashion-perfumes'),
('سوبر ماركت', 'Supermarkets', 'سوبر ماركت', '🛒', 'بقالة ومواد غذائية', 'Groceries and food items', 'بقالة ومواد غذائية', '#3BAF6E', 4, true, false, 'supermarkets'),
('صيدليات', 'Pharmacies', 'صيدليات', '💊', 'أدوية ومنتجات طبية', 'Medicine and medical products', 'أدوية ومنتجات طبية', '#3B9EDD', 5, true, false, 'pharmacies'),
('سبا ورياضة', 'Spa & Sports', 'سبا ورياضة', '🧖', 'تجميل ولياقة بدنية', 'Beauty and fitness', 'تجميل ولياقة بدنية', '#E85CA0', 6, true, false, 'spa-sports'),
('تكنولوجيا', 'Technology', 'تكنولوجيا', '📱', 'إلكترونيات وتكنولوجيا', 'Electronics and technology', 'إلكترونيات وتكنولوجيا', '#6366F1', 7, true, false, 'technology'),
('سفر وسياحة', 'Travel & Tourism', 'سفر وسياحة', '✈️', 'سفر وفنادق وسياحة', 'Travel, hotels and tourism', 'سفر وفنادق وسياحة', '#06B6D4', 8, false, false, 'travel-tourism')
ON CONFLICT (slug) DO NOTHING;

-- Default Admin User
INSERT INTO admin_users (email, name, role, permissions, is_active, is_verified) VALUES
('admin@qreeb.qa', 'مشرف قريب', 'super_admin', '["all"]', true, true)
ON CONFLICT (email) DO NOTHING;

-- Default App Settings
INSERT INTO app_settings (key, value, description, category, is_public) VALUES
('app_name', '{"ar": "قريب", "en": "Qreeb"}', 'Application name', 'general', true),
('app_tagline', '{"ar": "اكتشف العروض القريبة منك", "en": "Discover deals near you"}', 'Application tagline', 'general', true),
('commission_rate', '10.00', 'Default commission rate percentage', 'business', false),
('max_coupons_per_user', '5', 'Maximum coupons per user per day', 'business', false),
('otp_expiry_minutes', '5', 'OTP expiry time in minutes', 'security', false),
('currencies', '["QAR", "USD", "SAR"]', 'Supported currencies', 'business', true),
('supported_cities', '["الدوحة", "الريان", "الوكرة", "أم صلال", "الخور"]', 'Supported cities in Qatar', 'location', true),
('notification_templates', '{}', 'Notification message templates', 'notifications', false),
('maintenance_mode', 'false', 'Application maintenance mode', 'system', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Database Functions
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement remaining coupons
CREATE OR REPLACE FUNCTION decrement_remaining_coupons(deal_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE deals 
  SET remaining_coupons = GREATEST(remaining_coupons - 1, 0),
      claims_count = claims_count + 1
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate merchant stats
CREATE OR REPLACE FUNCTION update_merchant_stats(merchant_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE merchants SET
    deals_count = (SELECT COUNT(*) FROM deals WHERE merchant_id = merchants.id AND is_active = true),
    coupons_claimed = (SELECT COUNT(*) FROM claimed_coupons WHERE merchant_id = merchants.id),
    coupons_used = (SELECT COUNT(*) FROM claimed_coupons WHERE merchant_id = merchants.id AND status = 'used'),
    revenue = (SELECT COALESCE(SUM(final_price), 0) FROM claimed_coupons WHERE merchant_id = merchants.id AND status = 'used')
  WHERE id = merchant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique coupon code
CREATE OR REPLACE FUNCTION generate_coupon_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    code := 'QR' || UPPER(substr(encode(gen_random_bytes(4), 'base32'), 1, 6));
    SELECT COUNT(*) INTO exists_check FROM claimed_coupons WHERE coupon_code = code;
    EXIT WHEN exists_check = 0;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Triggers
-- ============================================================================

-- Auto-update timestamps
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_claimed_coupons_updated_at BEFORE UPDATE ON claimed_coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and active deals
CREATE POLICY "Public categories access" ON categories FOR SELECT USING (is_visible = true);
CREATE POLICY "Public deals access" ON deals FOR SELECT USING (is_active = true AND expires_at > NOW() AND remaining_coupons > 0);
CREATE POLICY "Public merchants access" ON merchants FOR SELECT USING (status = 'active');
CREATE POLICY "Public app settings access" ON app_settings FOR SELECT USING (is_public = true);

-- User policies (authenticated users can access their own data)
CREATE POLICY "Users can view their profile" ON user_profiles FOR SELECT USING (auth.jwt() ->> 'phone' = phone);
CREATE POLICY "Users can update their profile" ON user_profiles FOR UPDATE USING (auth.jwt() ->> 'phone' = phone);
CREATE POLICY "Users can view their coupons" ON claimed_coupons FOR SELECT USING (auth.jwt() ->> 'phone' = user_phone);
CREATE POLICY "Users can create coupons" ON claimed_coupons FOR INSERT WITH CHECK (true);

-- Merchant policies (merchants can access their own data)
CREATE POLICY "Merchants can access own data" ON merchants FOR ALL USING (auth.jwt() ->> 'email' = email);
CREATE POLICY "Merchants can access own deals" ON deals FOR ALL USING (
  merchant_id IN (SELECT id FROM merchants WHERE email = auth.jwt() ->> 'email')
);
CREATE POLICY "Merchants can view own coupons" ON claimed_coupons FOR SELECT USING (
  merchant_id IN (SELECT id FROM merchants WHERE email = auth.jwt() ->> 'email')
);
CREATE POLICY "Merchants can view own payouts" ON payouts FOR SELECT USING (
  merchant_id IN (SELECT id FROM merchants WHERE email = auth.jwt() ->> 'email')
);

-- Admin policies (full access for authenticated admins)
CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access merchants" ON merchants FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access deals" ON deals FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access user_profiles" ON user_profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access coupons" ON claimed_coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access payouts" ON payouts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access complaints" ON complaints FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access app_settings" ON app_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access notifications" ON notifications FOR ALL TO authenticated USING (true);

-- ============================================================================
-- Sample Data for Testing
-- ============================================================================

-- Sample Merchant
INSERT INTO merchants (name, name_en, name_ar, email, phone, category_id, city, status, verification_status, rating, logo_url) 
SELECT 
  'مطعم الدوحة الملكي',
  'Royal Doha Restaurant', 
  'مطعم الدوحة الملكي',
  'royal@qreeb.qa',
  '+97450000001', 
  (SELECT id FROM categories WHERE slug = 'restaurants' LIMIT 1),
  'الدوحة',
  'active',
  'verified',
  4.7,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'
WHERE NOT EXISTS (SELECT 1 FROM merchants WHERE email = 'royal@qreeb.qa');

-- Sample Deal
INSERT INTO deals (
  merchant_id, title, title_en, title_ar, description, category, deal_type,
  original_price, discount_percent, final_price, max_coupons, expires_at, is_active, is_featured
)
SELECT 
  m.id,
  'برجر شيف + بطاطس + مشروب',
  'Chef Burger + Fries + Drink',
  'برجر شيف + بطاطس + مشروب',
  'وجبة كاملة للغداء مع مشروب غازي وبطاطس مقلية',
  'مطاعم',
  'product',
  45.00,
  30,
  31.50,
  100,
  NOW() + INTERVAL '30 days',
  true,
  true
FROM merchants m 
WHERE m.email = 'royal@qreeb.qa'
AND NOT EXISTS (SELECT 1 FROM deals WHERE title = 'برجر شيف + بطاطس + مشروب');

-- ============================================================================
-- Performance Optimizations
-- ============================================================================

-- Analyze tables for better query planning
ANALYZE categories;
ANALYZE merchants;
ANALYZE deals;
ANALYZE user_profiles;
ANALYZE claimed_coupons;

-- ============================================================================
-- End of Schema
-- ============================================================================

COMMENT ON DATABASE postgres IS 'Qreeb - Complete coupon platform database with Arabic/English support';
