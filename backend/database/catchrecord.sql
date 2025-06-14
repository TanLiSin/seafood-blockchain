CREATE TABLE catch_records (
    id SERIAL PRIMARY KEY,
    product_id TEXT UNIQUE NOT NULL, -- e.g., 'PID1684903201011'
    product_name TEXT NOT NULL,
    source TEXT NOT NULL, -- supplier username instead of location
    quantity NUMERIC(10, 2) NOT NULL, -- weight in kg

    -- Freshness characteristics
    dissolved_oxygen NUMERIC(5, 2) NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL,
    ph_level NUMERIC(5, 2) NOT NULL,
    ammonia NUMERIC(5, 2) NOT NULL,
    metals NUMERIC(5, 2) NOT NULL,
    bacteria NUMERIC(5, 2) NOT NULL,

    -- Blockchain results
    freshness_score NUMERIC(5, 2),
    freshness_label TEXT,
    blockchain_tx_id TEXT, -- 🟢 NEW FIELD

    -- Optional: Traceability
    supplier_id TEXT REFERENCES users(id) ON DELETE SET NULL,

    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);
