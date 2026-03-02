package com.ServiceGo.api.controlador.v1;

import com.ServiceGo.api.dto.requisicao.veiculo.VeiculoAtualizacaoRequest;
import com.ServiceGo.api.dto.requisicao.veiculo.VeiculoCriacaoRequest;
import com.ServiceGo.api.dto.requisicao.veiculo.VeiculoKmAtualizacaoRequest;
import com.ServiceGo.api.dto.resposta.compartilhado.PaginacaoResponse;
import com.ServiceGo.api.dto.resposta.veiculo.VeiculoResponse;
import com.ServiceGo.aplicacao.mapeador.VeiculoApiMapeador;
import com.ServiceGo.aplicacao.servico.VeiculoServico;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/veiculos")
public class VeiculoControladorV1 {

    private final VeiculoServico veiculoServico;
    private final VeiculoApiMapeador veiculoApiMapeador;

    public VeiculoControladorV1(VeiculoServico veiculoServico, VeiculoApiMapeador veiculoApiMapeador) {
        this.veiculoServico = veiculoServico;
        this.veiculoApiMapeador = veiculoApiMapeador;
    }

    @PostMapping
    public ResponseEntity<VeiculoResponse> criar(@Valid @RequestBody VeiculoCriacaoRequest request) {
        var veiculo = veiculoServico.criar(request);
        var response = veiculoApiMapeador.paraResponse(veiculo);
        return ResponseEntity.created(URI.create("/api/v1/veiculos/" + response.veiculoId())).body(response);
    }

    @GetMapping
    public PaginacaoResponse<VeiculoResponse> listar(
            @RequestParam(required = false) String placa,
            @RequestParam(required = false) String modelo,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<VeiculoResponse> page = veiculoServico.listar(placa, modelo, pageable).map(veiculoApiMapeador::paraResponse);
        return new PaginacaoResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @GetMapping("/{veiculoId}")
    public VeiculoResponse buscarPorId(@PathVariable Long veiculoId) {
        return veiculoApiMapeador.paraResponse(veiculoServico.buscarPorId(veiculoId));
    }

    @PutMapping("/{veiculoId}")
    public VeiculoResponse atualizar(@PathVariable Long veiculoId, @Valid @RequestBody VeiculoAtualizacaoRequest request) {
        return veiculoApiMapeador.paraResponse(veiculoServico.atualizar(veiculoId, request));
    }

    @PatchMapping("/{veiculoId}/km-atual")
    public VeiculoResponse atualizarKm(@PathVariable Long veiculoId, @Valid @RequestBody VeiculoKmAtualizacaoRequest request) {
        return veiculoApiMapeador.paraResponse(veiculoServico.atualizarKm(veiculoId, request.kmAtual()));
    }

    @DeleteMapping("/{veiculoId}")
    public ResponseEntity<Void> remover(@PathVariable Long veiculoId) {
        veiculoServico.remover(veiculoId);
        return ResponseEntity.noContent().build();
    }
}
