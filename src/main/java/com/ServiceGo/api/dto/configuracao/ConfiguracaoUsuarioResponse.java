package com.ServiceGo.api.dto.configuracao;

import com.ServiceGo.domain.enums.DepreciacaoAlocacao;
import com.ServiceGo.domain.enums.DepreciacaoModo;
import java.math.BigDecimal;

public record ConfiguracaoUsuarioResponse(
        Long id,
        Long usuarioId,
        boolean sincronizarCalendario,
        boolean lembreteAtivo,
        Integer minutosAntecedenciaLembrete,
        String fusoHorario,
        DepreciacaoModo depreciacaoModo,
        DepreciacaoAlocacao depreciacaoAlocacao,
        BigDecimal valorAtualVeiculo,
        BigDecimal valorEstimadoVeiculo,
        BigDecimal kmBaseDepreciacao,
        Integer mesesBaseDepreciacao,
        BigDecimal anosBaseDepreciacao,
        BigDecimal valorManualPorKm,
        BigDecimal valorManualMensal,
        BigDecimal valorManualAnual
) {
}
