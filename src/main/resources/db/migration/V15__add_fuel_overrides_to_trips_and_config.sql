ALTER TABLE configuracoes_usuario
    ADD COLUMN fuel_type VARCHAR(20);

ALTER TABLE trips
    ADD COLUMN fuel_type VARCHAR(20),
    ADD COLUMN fuel_price DECIMAL(12, 2),
    ADD COLUMN fuel_efficiency_km_liter DECIMAL(12, 4);
