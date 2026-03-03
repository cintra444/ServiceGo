CREATE TABLE veiculos (
    id BIGSERIAL PRIMARY KEY,
    modelo VARCHAR(120) NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    ano INTEGER NOT NULL,
    cor VARCHAR(40),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    km_atual NUMERIC(12,2) NOT NULL DEFAULT 0,
    dono_usuario_id BIGINT NOT NULL REFERENCES app_users(id)
);

ALTER TABLE trips ADD COLUMN vehicle_id BIGINT REFERENCES veiculos(id);
CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);

ALTER TABLE expenses ADD COLUMN vehicle_id BIGINT REFERENCES veiculos(id);
CREATE INDEX idx_expenses_vehicle_id ON expenses(vehicle_id);

ALTER TABLE payments ADD COLUMN pagamento_parcial BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN numero_parcela INTEGER;

UPDATE app_users SET role = 'ADMINISTRADOR' WHERE role = 'ADMIN';
UPDATE app_users SET role = 'MOTORISTA' WHERE role = 'DRIVER';

UPDATE trips SET trip_type = 'TRASLADO_AEROPORTO' WHERE trip_type = 'AIRPORT_TRANSFER';
UPDATE trips SET trip_type = 'INTERMUNICIPAL' WHERE trip_type = 'INTERCITY';
UPDATE trips SET trip_type = 'LOCAL_ESPECIFICO' WHERE trip_type = 'SPECIFIC_LOCATION';
UPDATE trips SET trip_type = 'CORRIDA_APP' WHERE trip_type = 'APP_RIDE';

UPDATE trips SET status = 'AGENDADA' WHERE status = 'SCHEDULED';
UPDATE trips SET status = 'EM_ANDAMENTO' WHERE status = 'IN_PROGRESS';
UPDATE trips SET status = 'CONCLUIDA' WHERE status = 'COMPLETED';
UPDATE trips SET status = 'CANCELADA' WHERE status = 'CANCELED';

UPDATE expenses SET category = 'COMBUSTIVEL' WHERE category = 'FUEL';
UPDATE expenses SET category = 'ALIMENTACAO' WHERE category = 'FOOD';
UPDATE expenses SET category = 'AGUA' WHERE category = 'WATER';
UPDATE expenses SET category = 'PEDAGIO' WHERE category = 'TOLL';
UPDATE expenses SET category = 'MANUTENCAO' WHERE category = 'MAINTENANCE';
UPDATE expenses SET category = 'ESTACIONAMENTO' WHERE category = 'PARKING';
UPDATE expenses SET category = 'OUTRO' WHERE category = 'OTHER';

UPDATE payments SET method = 'DINHEIRO' WHERE method = 'CASH';
UPDATE payments SET method = 'CARTAO_CREDITO' WHERE method = 'CREDIT_CARD';
UPDATE payments SET method = 'CARTAO_DEBITO' WHERE method = 'DEBIT_CARD';
UPDATE payments SET method = 'TRANSFERENCIA' WHERE method = 'TRANSFER';
UPDATE payments SET method = 'OUTRO' WHERE method = 'OTHER';

UPDATE payments SET status = 'PENDENTE' WHERE status = 'PENDING';
UPDATE payments SET status = 'PAGO_PARCIAL' WHERE status = 'PARTIALLY_PAID';
UPDATE payments SET status = 'PAGO' WHERE status = 'PAID';
UPDATE payments SET status = 'CANCELADO' WHERE status = 'CANCELED';
