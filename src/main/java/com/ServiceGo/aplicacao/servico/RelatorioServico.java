package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.resposta.relatorio.FluxoCaixaItemResponse;
import com.ServiceGo.api.dto.resposta.relatorio.FluxoCaixaResumoResponse;
import com.ServiceGo.aplicacao.porta.saida.CorridaPortaSaida;
import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import com.ServiceGo.dominio.excecao.RegraNegocioException;
import com.ServiceGo.dominio.modelo.Corrida;
import com.ServiceGo.compartilhado.validacao.ValidadorPeriodo;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RelatorioServico {

    private final CorridaPortaSaida corridaPortaSaida;

    public RelatorioServico(CorridaPortaSaida corridaPortaSaida) {
        this.corridaPortaSaida = corridaPortaSaida;
    }

    @Transactional(readOnly = true)
    public Page<Corrida> buscarItensFluxoCaixa(
            OffsetDateTime dataHoraInicio,
            OffsetDateTime dataHoraFim,
            FonteCorrida fonte,
            TipoCorrida tipo,
            Long clienteId,
            Long veiculoId,
            Pageable pageable
    ) {
        validarPeriodo(dataHoraInicio, dataHoraFim);

        Specification<Corrida> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.greaterThanOrEqualTo(root.get("dataHoraAgendada"), dataHoraInicio));
            predicates.add(cb.lessThanOrEqualTo(root.get("dataHoraAgendada"), dataHoraFim));
            if (fonte != null) {
                predicates.add(cb.equal(root.get("fonte"), fonte));
            }
            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
            }
            if (clienteId != null) {
                predicates.add(cb.equal(root.get("cliente").get("clienteId"), clienteId));
            }
            if (veiculoId != null) {
                predicates.add(cb.equal(root.get("veiculo").get("veiculoId"), veiculoId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return corridaPortaSaida.listar(spec, pageable);
    }

    @Transactional(readOnly = true)
    public FluxoCaixaResumoResponse gerarResumo(OffsetDateTime dataHoraInicio, OffsetDateTime dataHoraFim, List<Corrida> corridas) {
        validarPeriodo(dataHoraInicio, dataHoraFim);

        BigDecimal totalValorBruto = somar(corridas, Corrida::getValorBruto);
        BigDecimal totalTaxaPlataforma = somar(corridas, Corrida::getTaxaPlataforma);
        BigDecimal totalValorLiquido = somar(corridas, Corrida::getValorLiquido);
        BigDecimal totalDespesas = somar(corridas, Corrida::getDespesas);
        BigDecimal totalLucro = somar(corridas, Corrida::getLucro);
        BigDecimal ticketMedioLiquido = corridas.isEmpty()
                ? BigDecimal.ZERO
                : totalValorLiquido.divide(BigDecimal.valueOf(corridas.size()), 2, java.math.RoundingMode.HALF_UP);

        return new FluxoCaixaResumoResponse(
                dataHoraInicio,
                dataHoraFim,
                corridas.size(),
                totalValorBruto,
                totalTaxaPlataforma,
                totalValorLiquido,
                totalDespesas,
                totalLucro,
                ticketMedioLiquido
        );
    }

    public FluxoCaixaItemResponse paraItem(Corrida corrida) {
        return new FluxoCaixaItemResponse(
                corrida.getCorridaId(),
                corrida.getDataHoraAgendada(),
                corrida.getCliente().getClienteId(),
                corrida.getFonte(),
                corrida.getTipo(),
                nvl(corrida.getValorBruto()),
                nvl(corrida.getTaxaPlataforma()),
                nvl(corrida.getValorLiquido()),
                nvl(corrida.getDespesas()),
                nvl(corrida.getLucro()),
                corrida.getStatus()
        );
    }

    private void validarPeriodo(OffsetDateTime dataHoraInicio, OffsetDateTime dataHoraFim) {
        ValidadorPeriodo.validarInicioFim(dataHoraInicio, dataHoraFim, "dataHoraInicio", "dataHoraFim");
        ValidadorPeriodo.validarJanelaMaximaMeses(dataHoraInicio, dataHoraFim, 12);
    }

    private BigDecimal somar(List<Corrida> corridas, java.util.function.Function<Corrida, BigDecimal> getter) {
        return corridas.stream().map(getter).map(this::nvl).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal nvl(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }
}
