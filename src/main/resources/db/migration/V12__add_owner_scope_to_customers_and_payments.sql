ALTER TABLE customers ADD COLUMN owner_user_id BIGINT;

UPDATE customers c
SET owner_user_id = source.owner_user_id
FROM (
    SELECT DISTINCT ON (t.customer_id)
        t.customer_id,
        v.dono_usuario_id AS owner_user_id
    FROM trips t
    JOIN veiculos v ON v.id = t.vehicle_id
    WHERE t.customer_id IS NOT NULL
    ORDER BY t.customer_id, t.created_at DESC NULLS LAST, t.id DESC
) AS source
WHERE c.id = source.customer_id;

UPDATE customers
SET owner_user_id = (
    SELECT id
    FROM app_users
    WHERE role = 'ADMINISTRADOR'
    ORDER BY id
    LIMIT 1
)
WHERE owner_user_id IS NULL;

ALTER TABLE customers
    ALTER COLUMN owner_user_id SET NOT NULL;

ALTER TABLE customers
    ADD CONSTRAINT fk_customers_owner_user
    FOREIGN KEY (owner_user_id) REFERENCES app_users(id);

CREATE INDEX idx_customers_owner_user_id ON customers(owner_user_id);

ALTER TABLE payments ADD COLUMN owner_user_id BIGINT;

UPDATE payments p
SET owner_user_id = source.owner_user_id
FROM (
    SELECT
        p_inner.id AS payment_id,
        COALESCE(v.dono_usuario_id, c.owner_user_id) AS owner_user_id
    FROM payments p_inner
    LEFT JOIN trips t ON t.id = p_inner.trip_id
    LEFT JOIN veiculos v ON v.id = t.vehicle_id
    LEFT JOIN customers c ON c.id = p_inner.customer_id
) AS source
WHERE p.id = source.payment_id
  AND source.owner_user_id IS NOT NULL;

UPDATE payments
SET owner_user_id = (
    SELECT id
    FROM app_users
    WHERE role = 'ADMINISTRADOR'
    ORDER BY id
    LIMIT 1
)
WHERE owner_user_id IS NULL;

ALTER TABLE payments
    ALTER COLUMN owner_user_id SET NOT NULL;

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_owner_user
    FOREIGN KEY (owner_user_id) REFERENCES app_users(id);

CREATE INDEX idx_payments_owner_user_id ON payments(owner_user_id);
