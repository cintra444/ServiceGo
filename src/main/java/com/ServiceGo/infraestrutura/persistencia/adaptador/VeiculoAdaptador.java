package com.ServiceGo.infraestrutura.persistencia.adaptador;

import com.ServiceGo.aplicacao.porta.saida.VeiculoPortaSaida;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import com.ServiceGo.dominio.modelo.Veiculo;
import com.ServiceGo.infraestrutura.persistencia.repositorio.VeiculoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
public class VeiculoAdaptador implements VeiculoPortaSaida {

    private final VeiculoRepository veiculoRepository;

    public VeiculoAdaptador(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
    }

    @Override
    public Page<Veiculo> listar(String placa, String modelo, Pageable pageable) {
        String placaFiltro = placa == null ? "" : placa.trim();
        String modeloFiltro = modelo == null ? "" : modelo.trim();
        return veiculoRepository.findByPlacaContainingIgnoreCaseAndModeloContainingIgnoreCase(placaFiltro, modeloFiltro, pageable);
    }

    @Override
    public Veiculo buscarPorId(Long veiculoId) {
        return veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Veiculo nao encontrado"));
    }

    @Override
    public Veiculo salvar(Veiculo veiculo) {
        return veiculoRepository.save(veiculo);
    }

    @Override
    public void remover(Veiculo veiculo) {
        veiculoRepository.delete(veiculo);
    }

    @Override
    public boolean existePlaca(String placa) {
        return veiculoRepository.existsByPlacaIgnoreCase(placa);
    }

    @Override
    public boolean existePlacaOutroVeiculo(String placa, Long veiculoId) {
        return veiculoRepository.existsByPlacaIgnoreCaseAndVeiculoIdNot(placa, veiculoId);
    }
}
