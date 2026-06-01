-- 8. Add Coin Balance to Profile Table (if not exists)
ALTER TABLE profile ADD COLUMN IF NOT EXISTS coin_balance numeric DEFAULT 0;

-- 9. Create Payment Requests Table
CREATE TABLE IF NOT EXISTS payment_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  coin_package_id text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  proof_of_payment_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
-- 10. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id text NOT NULL,
  recipient_id text NOT NULL,
  content text NOT NULL,
  type text CHECK (type IN ('text', 'image')) DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public chat access" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
