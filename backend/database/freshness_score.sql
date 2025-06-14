CREATE TABLE freshness_records (
    product_id VARCHAR(50) NOT NULL,
    dissolved_oxygen INTEGER NOT NULL,
    temperature INTEGER NOT NULL,
    pH_level INTEGER NOT NULL,
    ammonia INTEGER NOT NULL,
    metals INTEGER NOT NULL,
    bacteria INTEGER NOT NULL,
    tx_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
