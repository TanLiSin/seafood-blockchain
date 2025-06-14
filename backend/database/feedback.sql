CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  transaction_id TEXT REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);