package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.requisicao.corrida.CorridaAgendamentoRequest;
import com.ServiceGo.api.dto.requisicao.corrida.CorridaCancelamentoRequest;
import com.ServiceGo.api.dto.requisicao.corrida.CorridaConclusaoRequest;
import com.ServiceGo.aplicacao.porta.saida.CorridaPortaSaida;
import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.StatusCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import com.ServiceGo.dominio.excecao.RegraNegocioException;
import com.ServiceGo.dominio.modelo.Cliente;
import com.ServiceGo.dominio.modelo.Corrida;
import com.ServiceGo.dominio.modelo.Veiculo;
import com.ServiceGo.compartilhado.validacao.ValidadorNumero;
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
public class CorridaServico {

    private final CorridaPortaSaida corridaPortaSaida;
    private final ClienteServico clienteServico;
    private final VeiculoServico veiculoServico;

    public CorridaServico(CorridaPortaSaida corridaPortaSaida, ClienteServico clienteServico, VeiculoServico veiculoServico) {
        this.corridaPortaSaida = corridaPortaSaida;
        this.clienteServico = clienteServico;
        this.veiculoServico = veiculoServico;
    }

    @Transactional
    public Corrida agendarCorrida(CorridaAgendamentoRequest request) {
        Cliente cliente = clienteServico.buscarPorId(request.clienteId());
        Veiculo veiculo = veiculoServico.buscarPorId(request.veiculoId());

        Corrida corrida = new Corrida();
        corrida.setCliente(cliente);
        corrida.setVeiculo(veiculo);
        corrida.setOrigem(request.origem().trim());
        corrida.setDestino(request.destino().trim());
        corrida.setDataHoraAgendada(request.dataHoraAgendada());
        corrida.setFonte(request.fonte());
        corrida.setTipo(request.tipo());
        corrida.setStatus(StatusCorrida.AGENDADA);
        corrida.setValorBruto(request.valorBrutoEstimado());
        corrida.setTaxaPlataforma(request.taxaPlataformaEstimada());
        corrida.setKmRodados(BigDecimal.ZERO);
        corrida.setValorLiquido(calcularValorLiquido(request.valorBrutoEstimado(), request.taxaPlataformaEstimada()));
        corrida.setDespesas(BigDecimal.ZERO);
        corrida.setLucro(corrida.getValorLiquido());
        corrida.setObservacoes(request.observacoes());
        return corridaPortaSaida.salvar(corrida);
    }

    @Transactional(readOnly = true)
    public Page<Corrida> listar(
            StatusCorrida status,
            Long clienteId,
            Long veiculoId,
            OffsetDateTime dataHoraInicio,
            OffsetDateTime dataHoraFim,
            FonteCorrida fonte,
            TipoCorrida tipo,
            Pageable pageable
    ) {
        Specification<Corrida> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (clienteId != null) {
                predicates.add(cb.equal(root.get("cliente").get("clienteId"), clienteId));
            }
            if (veiculoId != null) {
                predicates.add(cb.equal(root.get("veiculo").get("veiculoId"), veiculoId));
            }
            if (dataHoraInicio != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataHoraAgendada"), dataHoraInicio));
            }
            if (dataHoraFim != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataHoraAgendada"), dataHoraFim));
            }
            if (fonte != null) {
                predicates.add(cb.equal(root.get("fonte"), fonte));
            }
            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return corridaPortaSaida.listar(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Corrida buscarPorId(Long corridaId) {
        return corridaPortaSaida.buscarPorId(corridaId);
    }

    @Transactional
    public Corrida concluirCorrida(Long corridaId, CorridaConclusaoRequest request) {
        Corrida corrida = buscarPorId(corridaId);
        if (corrida.getStatus() == StatusCorrida.CANCELADA) {
            throw new RegraNegocioException("Corrida cancelada nao pode ser concluida");
        }
        if (corrida.getStatus() == StatusCorrida.CONCLUIDA) {
            throw new RegraNegocioException("Corrida ja concluida");
        }
        ValidadorPeriodo.validarInicioFim(request.dataHoraInicio(), request.dataHoraFim(), "dataHoraInicio", "dataHoraFim");
        ValidadorNumero.validarNaoNuloENaoNegativo(request.valorBruto(), "valorBruto");
        ValidadorNumero.validarNaoNuloENaoNegativo(request.taxaPlataforma(), "taxaPlataforma");
        ValidadorNumero.validarNaoNuloENaoNegativo(request.kmRodados(), "kmRodados");

        corrida.setStatus(StatusCorrida.CONCLUIDA);
        corrida.setValorBruto(request.valorBruto());
        corrida.setTaxaPlataforma(request.taxaPlataforma());
        corrida.setKmRodados(request.kmRodados());
        corrida.setValorLiquido(calcularValorLiquido(request.valorBruto(), request.taxaPlataforma()));
        corrida.setLucro(corrida.getValorLiquido().subtract(valorSeguro(corrida.getDespesas())));
        corrida.setObservacoes(request.observacoesConclusao());

        Veiculo veiculo = corrida.getVeiculo();
        long kmAtualizado = veiculo.getKmAtual() + request.kmRodados().longValue();
        veiculoServico.atualizarKm(veiculo.getVeiculoId(), kmAtualizado);

        return corridaPortaSaida.salvar(corrida);
    }

    @Transactional
    public Corrida cancelarCorrida(Long corridaId, CorridaCancelamentoRequest request) {
        Corrida corrida = buscarPorId(corridaId);
        if (corrida.getStatus() == StatusCorrida.CONCLUIDA) {
            throw new RegraNegocioException("Corrida concluida nao pode ser cancelada");
        }
        corrida.setStatus(StatusCorrida.CANCELADA);
        corrida.setMotivoCancelamento(request.motivoCancelamento());
        corrida.setDataHoraCancelamento(request.dataHoraCancelamento());
        return corridaPortaSaida.salvar(corrida);
    }

    @Transactional
    public Corrida recalcularFinanceiro(Long corridaId, BigDecimal despesas) {
        Corrida corrida = buscarPorId(corridaId);
        corrida.setDespesas(valorSeguro(despesas));
        corrida.setValorLiquido(calcularValorLiquido(corrida.getValorBruto(), corrida.getTaxaPlataforma()));
        corrida.setLucro(corrida.getValorLiquido().subtract(corrida.getDespesas()));
        return corridaPortaSaida.salvar(corrida);
    }

    private BigDecimal calcularValorLiquido(BigDecimal valorBruto, BigDecimal taxaPlataforma) {
        return valorSeguro(valorBruto).subtract(valorSeguro(taxaPlataforma));
    }

    private BigDecimal valorSeguro(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }
}
