CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  supplier_id TEXT REFERENCES users(id),
  product_id TEXT NOT NULL,
  freshness TEXT,
  amount INTEGER NOT NULL,
  expiry_date DATE NOT NULL,
  end_user TEXT NOT NULL,
  end_user_wallet TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
