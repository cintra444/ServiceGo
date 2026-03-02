CREATE OR REPLACE FUNCTION fn_sync_customers_ptbr_alias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nome := COALESCE(NEW.nome, NEW.name);
    NEW.name := COALESCE(NEW.name, NEW.nome);
    NEW.telefone := COALESCE(NEW.telefone, NEW.phone);
    NEW.phone := COALESCE(NEW.phone, NEW.telefone);
    NEW.observacoes := COALESCE(NEW.observacoes, NEW.notes);
    NEW.notes := COALESCE(NEW.notes, NEW.observacoes);
    NEW.criado_em := COALESCE(NEW.criado_em, NEW.created_at);
    NEW.created_at := COALESCE(NEW.created_at, NEW.criado_em);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_customers_ptbr_alias ON customers;
CREATE TRIGGER trg_sync_customers_ptbr_alias
BEFORE INSERT OR UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION fn_sync_customers_ptbr_alias();

CREATE OR REPLACE FUNCTION fn_sync_trips_ptbr_alias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cliente_id := COALESCE(NEW.cliente_id, NEW.customer_id);
    NEW.customer_id := COALESCE(NEW.customer_id, NEW.cliente_id);

    NEW.data_hora_agendada := COALESCE(NEW.data_hora_agendada, NEW.start_at);
    NEW.start_at := COALESCE(NEW.start_at, NEW.data_hora_agendada);

    NEW.km_rodados := COALESCE(NEW.km_rodados, NEW.distance_km);
    NEW.distance_km := COALESCE(NEW.distance_km, NEW.km_rodados);

    NEW.valor_bruto := COALESCE(NEW.valor_bruto, NEW.actual_amount);
    NEW.actual_amount := COALESCE(NEW.actual_amount, NEW.valor_bruto);

    NEW.taxa_plataforma := COALESCE(NEW.taxa_plataforma, 0);
    NEW.valor_liquido := COALESCE(NEW.valor_liquido, NEW.actual_amount);
    NEW.despesas := COALESCE(NEW.despesas, 0);
    NEW.lucro := COALESCE(NEW.lucro, COALESCE(NEW.valor_liquido, 0) - COALESCE(NEW.despesas, 0));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_trips_ptbr_alias ON trips;
CREATE TRIGGER trg_sync_trips_ptbr_alias
BEFORE INSERT OR UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION fn_sync_trips_ptbr_alias();

CREATE OR REPLACE FUNCTION fn_sync_expenses_ptbr_alias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.corrida_id := COALESCE(NEW.corrida_id, NEW.trip_id);
    NEW.trip_id := COALESCE(NEW.trip_id, NEW.corrida_id);

    NEW.tipo_despesa := COALESCE(NEW.tipo_despesa, NEW.category);
    NEW.category := COALESCE(NEW.category, NEW.tipo_despesa);

    NEW.valor := COALESCE(NEW.valor, NEW.amount);
    NEW.amount := COALESCE(NEW.amount, NEW.valor);

    NEW.data_hora := COALESCE(NEW.data_hora, NEW.occurred_at);
    NEW.occurred_at := COALESCE(NEW.occurred_at, NEW.data_hora);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_expenses_ptbr_alias ON expenses;
CREATE TRIGGER trg_sync_expenses_ptbr_alias
BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION fn_sync_expenses_ptbr_alias();

CREATE OR REPLACE FUNCTION fn_sync_payments_ptbr_alias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.corrida_id := COALESCE(NEW.corrida_id, NEW.trip_id);
    NEW.trip_id := COALESCE(NEW.trip_id, NEW.corrida_id);

    NEW.cliente_id := COALESCE(NEW.cliente_id, NEW.customer_id);
    NEW.customer_id := COALESCE(NEW.customer_id, NEW.cliente_id);

    NEW.valor := COALESCE(NEW.valor, NEW.amount);
    NEW.amount := COALESCE(NEW.amount, NEW.valor);

    NEW.data_hora_pagamento := COALESCE(NEW.data_hora_pagamento, NEW.paid_at);
    NEW.paid_at := COALESCE(NEW.paid_at, NEW.data_hora_pagamento);

    NEW.data_hora_vencimento := COALESCE(NEW.data_hora_vencimento, NEW.due_at);
    NEW.due_at := COALESCE(NEW.due_at, NEW.data_hora_vencimento);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_payments_ptbr_alias ON payments;
CREATE TRIGGER trg_sync_payments_ptbr_alias
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION fn_sync_payments_ptbr_alias();

CREATE OR REPLACE FUNCTION fn_sync_app_users_ptbr_alias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nome := COALESCE(NEW.nome, NEW.name);
    NEW.name := COALESCE(NEW.name, NEW.nome);

    NEW.criado_em := COALESCE(NEW.criado_em, NEW.created_at);
    NEW.created_at := COALESCE(NEW.created_at, NEW.criado_em);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_app_users_ptbr_alias ON app_users;
CREATE TRIGGER trg_sync_app_users_ptbr_alias
BEFORE INSERT OR UPDATE ON app_users
FOR EACH ROW EXECUTE FUNCTION fn_sync_app_users_ptbr_alias();

CREATE INDEX IF NOT EXISTS idx_customers_nome ON customers (nome);
CREATE INDEX IF NOT EXISTS idx_trips_cliente_id_ptbr ON trips (cliente_id);
CREATE INDEX IF NOT EXISTS idx_trips_data_hora_agendada ON trips (data_hora_agendada);
CREATE INDEX IF NOT EXISTS idx_expenses_corrida_id ON expenses (corrida_id);
CREATE INDEX IF NOT EXISTS idx_payments_corrida_id ON payments (corrida_id);
CREATE INDEX IF NOT EXISTS idx_payments_cliente_id_ptbr ON payments (cliente_id);
