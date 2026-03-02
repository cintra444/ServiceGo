package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.resposta.relatorio.FluxoCaixaResumoResponse;
import com.ServiceGo.aplicacao.porta.saida.CorridaPortaSaida;
import com.ServiceGo.dominio.modelo.Corrida;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RelatorioServicoTests {

    @Test
    void deveCalcularResumoDeFluxoCaixa() {
        RelatorioServico relatorioServico = new RelatorioServico(Mockito.mock(CorridaPortaSaida.class));

        Corrida corridaA = new Corrida();
        corridaA.setValorBruto(new BigDecimal("100.00"));
        corridaA.setTaxaPlataforma(new BigDecimal("20.00"));
        corridaA.setValorLiquido(new BigDecimal("80.00"));
        corridaA.setDespesas(new BigDecimal("10.00"));
        corridaA.setLucro(new BigDecimal("70.00"));

        Corrida corridaB = new Corrida();
        corridaB.setValorBruto(new BigDecimal("200.00"));
        corridaB.setTaxaPlataforma(new BigDecimal("40.00"));
        corridaB.setValorLiquido(new BigDecimal("160.00"));
        corridaB.setDespesas(new BigDecimal("30.00"));
        corridaB.setLucro(new BigDecimal("130.00"));

        FluxoCaixaResumoResponse resumo = relatorioServico.gerarResumo(
                OffsetDateTime.parse("2026-03-01T00:00:00-03:00"),
                OffsetDateTime.parse("2026-03-31T23:59:59-03:00"),
                List.of(corridaA, corridaB)
        );

        assertEquals(2, resumo.totalCorridas());
        assertEquals(new BigDecimal("300.00"), resumo.totalValorBruto());
        assertEquals(new BigDecimal("60.00"), resumo.totalTaxaPlataforma());
        assertEquals(new BigDecimal("240.00"), resumo.totalValorLiquido());
        assertEquals(new BigDecimal("40.00"), resumo.totalDespesas());
        assertEquals(new BigDecimal("200.00"), resumo.totalLucro());
        assertEquals(new BigDecimal("120.00"), resumo.ticketMedioLiquido());
    }
}
