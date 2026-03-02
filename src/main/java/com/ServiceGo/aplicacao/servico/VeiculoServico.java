package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.requisicao.veiculo.VeiculoAtualizacaoRequest;
import com.ServiceGo.api.dto.requisicao.veiculo.VeiculoCriacaoRequest;
import com.ServiceGo.aplicacao.porta.saida.VeiculoPortaSaida;
import com.ServiceGo.dominio.excecao.ConflitoNegocioException;
import com.ServiceGo.dominio.excecao.RegraNegocioException;
import com.ServiceGo.dominio.modelo.Veiculo;
import java.time.Year;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VeiculoServico {

    private final VeiculoPortaSaida veiculoPortaSaida;

    public VeiculoServico(VeiculoPortaSaida veiculoPortaSaida) {
        this.veiculoPortaSaida = veiculoPortaSaida;
    }

    @Transactional(readOnly = true)
    public Page<Veiculo> listar(String placa, String modelo, Pageable pageable) {
        return veiculoPortaSaida.listar(placa, modelo, pageable);
    }

    @Transactional(readOnly = true)
    public Veiculo buscarPorId(Long veiculoId) {
        return veiculoPortaSaida.buscarPorId(veiculoId);
    }

    @Transactional
    public Veiculo criar(VeiculoCriacaoRequest request) {
        validarAno(request.ano());
        if (veiculoPortaSaida.existePlaca(request.placa())) {
            throw new ConflitoNegocioException("Placa ja cadastrada");
        }
        Veiculo veiculo = new Veiculo();
        preencherDados(veiculo, request.placa(), request.modelo(), request.ano(), request.kmAtual());
        return veiculoPortaSaida.salvar(veiculo);
    }

    @Transactional
    public Veiculo atualizar(Long veiculoId, VeiculoAtualizacaoRequest request) {
        validarAno(request.ano());
        Veiculo veiculo = buscarPorId(veiculoId);
        if (veiculoPortaSaida.existePlacaOutroVeiculo(request.placa(), veiculoId)) {
            throw new ConflitoNegocioException("Placa ja cadastrada");
        }
        if (request.kmAtual() < veiculo.getKmAtual()) {
            throw new RegraNegocioException("Nao e permitido reduzir kmAtual");
        }
        preencherDados(veiculo, request.placa(), request.modelo(), request.ano(), request.kmAtual());
        return veiculoPortaSaida.salvar(veiculo);
    }

    @Transactional
    public Veiculo atualizarKm(Long veiculoId, Long kmAtual) {
        Veiculo veiculo = buscarPorId(veiculoId);
        if (kmAtual < veiculo.getKmAtual()) {
            throw new RegraNegocioException("Nao e permitido reduzir kmAtual");
        }
        veiculo.setKmAtual(kmAtual);
        return veiculoPortaSaida.salvar(veiculo);
    }

    @Transactional
    public void remover(Long veiculoId) {
        Veiculo veiculo = buscarPorId(veiculoId);
        veiculoPortaSaida.remover(veiculo);
    }

    private void preencherDados(Veiculo veiculo, String placa, String modelo, Integer ano, Long kmAtual) {
        veiculo.setPlaca(placa.trim().toUpperCase());
        veiculo.setModelo(modelo.trim());
        veiculo.setAno(ano);
        veiculo.setKmAtual(kmAtual);
    }

    private void validarAno(Integer ano) {
        int limite = Year.now().getValue() + 1;
        if (ano < 1980 || ano > limite) {
            throw new RegraNegocioException("Ano do veiculo invalido");
        }
    }
}
