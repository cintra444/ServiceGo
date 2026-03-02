package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.requisicao.despesa.DespesaCorridaAtualizacaoRequest;
import com.ServiceGo.api.dto.requisicao.despesa.DespesaCorridaCriacaoRequest;
import com.ServiceGo.aplicacao.porta.saida.DespesaCorridaPortaSaida;
import com.ServiceGo.dominio.enumeracao.StatusCorrida;
import com.ServiceGo.dominio.excecao.RegraNegocioException;
import com.ServiceGo.dominio.modelo.Corrida;
import com.ServiceGo.dominio.modelo.DespesaCorrida;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DespesaCorridaServico {

    private final DespesaCorridaPortaSaida despesaCorridaPortaSaida;
    private final CorridaServico corridaServico;

    public DespesaCorridaServico(DespesaCorridaPortaSaida despesaCorridaPortaSaida, CorridaServico corridaServico) {
        this.despesaCorridaPortaSaida = despesaCorridaPortaSaida;
        this.corridaServico = corridaServico;
    }

    @Transactional
    public DespesaCorrida adicionarDespesa(Long corridaId, DespesaCorridaCriacaoRequest request) {
        Corrida corrida = corridaServico.buscarPorId(corridaId);
        validarCorridaParaDespesa(corrida);

        DespesaCorrida despesa = new DespesaCorrida();
        despesa.setCorrida(corrida);
        despesa.setTipoDespesa(request.tipoDespesa());
        despesa.setDescricao(request.descricao());
        despesa.setValor(request.valor());
        despesa.setDataHora(request.dataHora());

        DespesaCorrida salva = despesaCorridaPortaSaida.salvar(despesa);
        recalcularCorrida(corridaId);
        return salva;
    }

    @Transactional(readOnly = true)
    public List<DespesaCorrida> listarPorCorrida(Long corridaId) {
        corridaServico.buscarPorId(corridaId);
        return despesaCorridaPortaSaida.listarPorCorrida(corridaId);
    }

    @Transactional(readOnly = true)
    public DespesaCorrida buscarPorId(Long corridaId, Long despesaId) {
        corridaServico.buscarPorId(corridaId);
        return despesaCorridaPortaSaida.buscarPorId(corridaId, despesaId);
    }

    @Transactional
    public DespesaCorrida atualizar(Long corridaId, Long despesaId, DespesaCorridaAtualizacaoRequest request) {
        DespesaCorrida despesa = buscarPorId(corridaId, despesaId);
        validarCorridaParaDespesa(despesa.getCorrida());
        despesa.setTipoDespesa(request.tipoDespesa());
        despesa.setDescricao(request.descricao());
        despesa.setValor(request.valor());
        despesa.setDataHora(request.dataHora());

        DespesaCorrida salva = despesaCorridaPortaSaida.salvar(despesa);
        recalcularCorrida(corridaId);
        return salva;
    }

    @Transactional
    public void remover(Long corridaId, Long despesaId) {
        DespesaCorrida despesa = buscarPorId(corridaId, despesaId);
        validarCorridaParaDespesa(despesa.getCorrida());
        despesaCorridaPortaSaida.remover(despesa);
        recalcularCorrida(corridaId);
    }

    private void recalcularCorrida(Long corridaId) {
        BigDecimal totalDespesas = despesaCorridaPortaSaida.somarPorCorridaId(corridaId);
        corridaServico.recalcularFinanceiro(corridaId, totalDespesas);
    }

    private void validarCorridaParaDespesa(Corrida corrida) {
        if (corrida.getStatus() == StatusCorrida.CANCELADA) {
            throw new RegraNegocioException("Nao e permitido lancar despesa em corrida cancelada");
        }
    }
}
