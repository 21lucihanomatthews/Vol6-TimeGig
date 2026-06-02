-- TimeGIG SA Complete Database Setup 🇿🇦
-- Copy and paste this ENTIRE script into your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Create Profile Table
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  name text NOT NULL,
  surname text,
  avatar text,
  title text NOT NULL DEFAULT 'Member',
  hourly_rate numeric NOT NULL DEFAULT 0,
  bio text,
  skills jsonb NOT NULL DEFAULT '[]',
  email text NOT NULL,
  website text,
  github text,
  metrics jsonb NOT NULL DEFAULT '{"rating": 5, "gigsCompleted": 0, "hourlyRateHistory": []}',
  coin_balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for Profile
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profile access" ON profile;
CREATE POLICY "Public profile access" ON profile FOR ALL USING (true) WITH CHECK (true);

-- 2. Create Gigs Table
CREATE TABLE IF NOT EXISTS gigs (
  id text PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL,
  payment_type text NOT NULL,
  duration text NOT NULL,
  tags jsonb NOT NULL,
  location text NOT NULL,
  difficulty text NOT NULL,
  created_at text NOT NULL,
  picture text,
  pictures jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public gigs access" ON gigs;
CREATE POLICY "Public gigs access" ON gigs FOR ALL USING (true) WITH CHECK (true);

-- 3. Create Seekers Table
CREATE TABLE IF NOT EXISTS seekers (
  id text PRIMARY KEY,
  name text NOT NULL,
  company text NOT NULL,
  avatar text,
  title text NOT NULL,
  description text NOT NULL,
  budget text NOT NULL,
  skills_needed jsonb NOT NULL,
  contact_status text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seekers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public seekers access" ON seekers;
CREATE POLICY "Public seekers access" ON seekers FOR ALL USING (true) WITH CHECK (true);

-- 4. Create Applied Gigs Table
CREATE TABLE IF NOT EXISTS applied_gigs (
  id text PRIMARY KEY,
  gig_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE applied_gigs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public applications access" ON applied_gigs;
CREATE POLICY "Public applications access" ON applied_gigs FOR ALL USING (true) WITH CHECK (true);

-- 5. Create Payment Requests Table
CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profile(id),
  coin_package_id text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  proof_of_payment_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON payment_requests;
CREATE POLICY "Users can create their own payment requests" ON payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own payment requests" ON payment_requests;
CREATE POLICY "Users can view their own payment requests" ON payment_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all payment requests" ON payment_requests;
CREATE POLICY "Admins can view all payment requests" ON payment_requests FOR SELECT USING (true);

-- 6. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  type text CHECK (type IN ('text', 'image')) DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public chat access" ON chat_messages;
CREATE POLICY "Public chat access" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- 7. Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE payment_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE profile;

-- 8. Seed a demo user (Optional, replace with your Auth ID if needed)
-- Note: '00000000-0000-0000-0000-000000000000' is a placeholder UUID if you want to seed a system account
