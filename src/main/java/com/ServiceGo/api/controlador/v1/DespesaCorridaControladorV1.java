package com.ServiceGo.api.controlador.v1;

import com.ServiceGo.api.dto.requisicao.despesa.DespesaCorridaAtualizacaoRequest;
import com.ServiceGo.api.dto.requisicao.despesa.DespesaCorridaCriacaoRequest;
import com.ServiceGo.api.dto.resposta.despesa.DespesaCorridaResponse;
import com.ServiceGo.aplicacao.mapeador.DespesaApiMapeador;
import com.ServiceGo.aplicacao.servico.DespesaCorridaServico;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/corridas/{corridaId}/despesas")
public class DespesaCorridaControladorV1 {

    private final DespesaCorridaServico despesaCorridaServico;
    private final DespesaApiMapeador despesaApiMapeador;

    public DespesaCorridaControladorV1(DespesaCorridaServico despesaCorridaServico, DespesaApiMapeador despesaApiMapeador) {
        this.despesaCorridaServico = despesaCorridaServico;
        this.despesaApiMapeador = despesaApiMapeador;
    }

    @PostMapping
    public ResponseEntity<DespesaCorridaResponse> adicionarDespesa(
            @PathVariable Long corridaId,
            @Valid @RequestBody DespesaCorridaCriacaoRequest request
    ) {
        var despesa = despesaCorridaServico.adicionarDespesa(corridaId, request);
        var response = despesaApiMapeador.paraResponse(despesa);
        return ResponseEntity
                .created(URI.create("/api/v1/corridas/" + corridaId + "/despesas/" + response.despesaId()))
                .body(response);
    }

    @GetMapping
    public List<DespesaCorridaResponse> listar(@PathVariable Long corridaId) {
        return despesaCorridaServico.listarPorCorrida(corridaId).stream().map(despesaApiMapeador::paraResponse).toList();
    }

    @GetMapping("/{despesaId}")
    public DespesaCorridaResponse buscarPorId(@PathVariable Long corridaId, @PathVariable Long despesaId) {
        return despesaApiMapeador.paraResponse(despesaCorridaServico.buscarPorId(corridaId, despesaId));
    }

    @PutMapping("/{despesaId}")
    public DespesaCorridaResponse atualizar(
            @PathVariable Long corridaId,
            @PathVariable Long despesaId,
            @Valid @RequestBody DespesaCorridaAtualizacaoRequest request
    ) {
        return despesaApiMapeador.paraResponse(despesaCorridaServico.atualizar(corridaId, despesaId, request));
    }

    @DeleteMapping("/{despesaId}")
    public ResponseEntity<Void> remover(@PathVariable Long corridaId, @PathVariable Long despesaId) {
        despesaCorridaServico.remover(corridaId, despesaId);
        return ResponseEntity.noContent().build();
    }
}
