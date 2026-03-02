package com.ServiceGo.aplicacao.porta.saida;

import com.ServiceGo.dominio.modelo.DespesaCorrida;
import java.math.BigDecimal;
import java.util.List;

public interface DespesaCorridaPortaSaida {

    DespesaCorrida salvar(DespesaCorrida despesaCorrida);

    List<DespesaCorrida> listarPorCorrida(Long corridaId);

    DespesaCorrida buscarPorId(Long corridaId, Long despesaId);

    void remover(DespesaCorrida despesaCorrida);

    BigDecimal somarPorCorridaId(Long corridaId);
}
