CREATE TABLE configuracoes_usuario (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES app_users(id),
    sincronizar_calendario BOOLEAN NOT NULL DEFAULT TRUE,
    lembrete_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    minutos_antecedencia_lembrete INTEGER NOT NULL DEFAULT 30,
    fuso_horario VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo'
);

CREATE UNIQUE INDEX ux_configuracoes_usuario_usuario_id ON configuracoes_usuario(usuario_id);

CREATE TABLE agendamentos_viagem (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(id),
    usuario_id BIGINT NOT NULL REFERENCES app_users(id),
    titulo VARCHAR(180) NOT NULL,
    descricao VARCHAR(600),
    local_evento VARCHAR(180),
    inicio_em TIMESTAMP WITH TIME ZONE NOT NULL,
    fim_em TIMESTAMP WITH TIME ZONE,
    fuso_horario VARCHAR(80) NOT NULL,
    lembrete_minutos INTEGER,
    id_evento_externo VARCHAR(160),
    status VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX ux_agendamentos_viagem_trip_id ON agendamentos_viagem(trip_id);
CREATE INDEX idx_agendamentos_viagem_usuario_id_inicio_em ON agendamentos_viagem(usuario_id, inicio_em);
