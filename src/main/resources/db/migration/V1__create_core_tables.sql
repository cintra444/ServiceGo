CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(160),
    notes VARCHAR(600),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE trips (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    trip_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    origin VARCHAR(180) NOT NULL,
    destination VARCHAR(180) NOT NULL,
    app_platform VARCHAR(40),
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE,
    distance_km NUMERIC(10,2),
    estimated_amount NUMERIC(12,2),
    actual_amount NUMERIC(12,2),
    notes VARCHAR(600),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT REFERENCES trips(id),
    category VARCHAR(30) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    description VARCHAR(600),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT REFERENCES trips(id),
    customer_id BIGINT REFERENCES customers(id),
    method VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    due_at TIMESTAMP WITH TIME ZONE,
    reference_code VARCHAR(100),
    notes VARCHAR(600)
);

CREATE INDEX idx_trips_customer_id ON trips (customer_id);
CREATE INDEX idx_trips_start_at ON trips (start_at);
CREATE INDEX idx_expenses_trip_id ON expenses (trip_id);
CREATE INDEX idx_payments_trip_id ON payments (trip_id);
CREATE INDEX idx_payments_customer_id ON payments (customer_id);
