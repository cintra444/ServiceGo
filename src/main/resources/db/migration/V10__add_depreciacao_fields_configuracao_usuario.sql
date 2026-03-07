ALTER TABLE configuracoes_usuario
    ADD COLUMN depreciacao_modo VARCHAR(20) NOT NULL DEFAULT 'AUTOMATICA',
    ADD COLUMN depreciacao_alocacao VARCHAR(20) NOT NULL DEFAULT 'POR_KM',
    ADD COLUMN valor_atual_veiculo NUMERIC(12,2),
    ADD COLUMN valor_estimado_veiculo NUMERIC(12,2),
    ADD COLUMN km_base_depreciacao NUMERIC(12,2),
    ADD COLUMN meses_base_depreciacao INTEGER,
    ADD COLUMN anos_base_depreciacao NUMERIC(10,2),
    ADD COLUMN valor_manual_por_km NUMERIC(12,6),
    ADD COLUMN valor_manual_mensal NUMERIC(12,2),
    ADD COLUMN valor_manual_anual NUMERIC(12,2);
