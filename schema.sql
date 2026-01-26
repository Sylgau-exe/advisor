-- ApexValue PMO Advisor Database Schema
-- Run this in Neon SQL Editor

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  has_purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Verify table was created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
