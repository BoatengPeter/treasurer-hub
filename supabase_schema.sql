-- SQL Schema for Supabase Setup
-- You can run this in the Supabase SQL Editor to create the necessary tables.

-- 1. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  reference VARCHAR(100),
  description TEXT,
  meeting_id UUID,
  lodgment_id UUID,
  receipt_image TEXT, -- Stored as compressed base64 data URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  title VARCHAR(100) NOT NULL,
  dues_collected DECIMAL(12, 2) DEFAULT 0.00,
  offering_collected DECIMAL(12, 2) DEFAULT 0.00,
  other_collected DECIMAL(12, 2) DEFAULT 0.00,
  total_collected DECIMAL(12, 2) DEFAULT 0.00,
  president_name VARCHAR(100),
  president_signature TEXT, -- Stored as dataURL (Base64 PNG)
  signed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LODGMENTS TABLE
CREATE TABLE IF NOT EXISTS lodgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  church_receipt_no VARCHAR(100) NOT NULL,
  treasurer_name VARCHAR(100) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'Lodged' CHECK (status IN ('Pending', 'Lodged', 'Reconciled')),
  receipt_image TEXT, -- Stored as compressed base64 data URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CHURCH STATEMENTS TABLE
CREATE TABLE IF NOT EXISTS church_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  statement_type VARCHAR(25) NOT NULL CHECK (statement_type IN ('Monthly', 'Quarterly', 'Half-Yearly', 'Yearly')),
  opening_balance DECIMAL(12, 2) NOT NULL,
  closing_balance DECIMAL(12, 2) NOT NULL,
  lodgments_recorded DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) optionally
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_statements ENABLE ROW LEVEL SECURITY;

-- Simple public policies allowing all operations (for personal use/treasurer private dashboard)
CREATE POLICY "Allow anonymous select" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select" ON meetings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON meetings FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON meetings FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select" ON lodgments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON lodgments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON lodgments FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON lodgments FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select" ON church_statements FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON church_statements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON church_statements FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON church_statements FOR DELETE USING (true);
