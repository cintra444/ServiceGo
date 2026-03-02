CREATE TABLE clientes_v1 (
    cliente_id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(160),
    observacoes VARCHAR(600),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX uk_clientes_v1_email ON clientes_v1 (LOWER(email));

CREATE TABLE veiculos_v1 (
    veiculo_id BIGSERIAL PRIMARY KEY,
    placa VARCHAR(8) NOT NULL,
    modelo VARCHAR(120) NOT NULL,
    ano INTEGER NOT NULL,
    km_atual BIGINT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX uk_veiculos_v1_placa ON veiculos_v1 (UPPER(placa));

CREATE TABLE corridas_v1 (
    corrida_id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes_v1(cliente_id),
    veiculo_id BIGINT NOT NULL REFERENCES veiculos_v1(veiculo_id),
    origem VARCHAR(180) NOT NULL,
    destino VARCHAR(180) NOT NULL,
    data_hora_agendada TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    fonte VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor_bruto NUMERIC(12,2),
    taxa_plataforma NUMERIC(12,2),
    km_rodados NUMERIC(10,2),
    valor_liquido NUMERIC(12,2),
    despesas NUMERIC(12,2) NOT NULL,
    lucro NUMERIC(12,2) NOT NULL,
    observacoes VARCHAR(600),
    motivo_cancelamento VARCHAR(600),
    data_hora_cancelamento TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_corridas_v1_data_hora_agendada ON corridas_v1 (data_hora_agendada);
CREATE INDEX idx_corridas_v1_cliente_id ON corridas_v1 (cliente_id);
CREATE INDEX idx_corridas_v1_veiculo_id ON corridas_v1 (veiculo_id);
CREATE INDEX idx_corridas_v1_status ON corridas_v1 (status);

CREATE TABLE despesas_corrida_v1 (
    despesa_id BIGSERIAL PRIMARY KEY,
    corrida_id BIGINT NOT NULL REFERENCES corridas_v1(corrida_id) ON DELETE CASCADE,
    tipo_despesa VARCHAR(30) NOT NULL,
    descricao VARCHAR(600),
    valor NUMERIC(12,2) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_despesas_corrida_v1_corrida_id ON despesas_corrida_v1 (corrida_id);
