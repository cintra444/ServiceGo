UPDATE customers
SET
    nome = COALESCE(nome, name),
    telefone = COALESCE(telefone, phone),
    observacoes = COALESCE(observacoes, notes),
    criado_em = COALESCE(criado_em, created_at)
WHERE
    nome IS NULL
    OR telefone IS NULL
    OR observacoes IS NULL
    OR criado_em IS NULL;

UPDATE trips
SET
    cliente_id = COALESCE(cliente_id, customer_id),
    data_hora_agendada = COALESCE(data_hora_agendada, start_at),
    km_rodados = COALESCE(km_rodados, distance_km),
    valor_bruto = COALESCE(valor_bruto, actual_amount),
    valor_liquido = COALESCE(valor_liquido, actual_amount),
    despesas = COALESCE(despesas, 0),
    lucro = COALESCE(lucro, COALESCE(actual_amount, 0))
WHERE
    cliente_id IS NULL
    OR data_hora_agendada IS NULL
    OR km_rodados IS NULL
    OR valor_bruto IS NULL
    OR valor_liquido IS NULL
    OR despesas IS NULL
    OR lucro IS NULL;

UPDATE expenses
SET
    corrida_id = COALESCE(corrida_id, trip_id),
    tipo_despesa = COALESCE(tipo_despesa, category),
    valor = COALESCE(valor, amount),
    data_hora = COALESCE(data_hora, occurred_at)
WHERE
    corrida_id IS NULL
    OR tipo_despesa IS NULL
    OR valor IS NULL
    OR data_hora IS NULL;

UPDATE payments
SET
    corrida_id = COALESCE(corrida_id, trip_id),
    cliente_id = COALESCE(cliente_id, customer_id),
    valor = COALESCE(valor, amount),
    data_hora_pagamento = COALESCE(data_hora_pagamento, paid_at),
    data_hora_vencimento = COALESCE(data_hora_vencimento, due_at)
WHERE
    corrida_id IS NULL
    OR cliente_id IS NULL
    OR valor IS NULL
    OR data_hora_pagamento IS NULL
    OR data_hora_vencimento IS NULL;

UPDATE app_users
SET
    nome = COALESCE(nome, name),
    criado_em = COALESCE(criado_em, created_at)
WHERE
    nome IS NULL
    OR criado_em IS NULL;
