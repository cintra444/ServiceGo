package com.ServiceGo.api.controlador.v1;

import com.ServiceGo.api.dto.requisicao.corrida.CorridaAgendamentoRequest;
import com.ServiceGo.api.dto.requisicao.corrida.CorridaCancelamentoRequest;
import com.ServiceGo.api.dto.requisicao.corrida.CorridaConclusaoRequest;
import com.ServiceGo.api.dto.resposta.compartilhado.PaginacaoResponse;
import com.ServiceGo.api.dto.resposta.corrida.CorridaResponse;
import com.ServiceGo.aplicacao.mapeador.CorridaApiMapeador;
import com.ServiceGo.aplicacao.servico.CorridaServico;
import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.StatusCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.OffsetDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/corridas")
public class CorridaControladorV1 {

    private final CorridaServico corridaServico;
    private final CorridaApiMapeador corridaApiMapeador;

    public CorridaControladorV1(CorridaServico corridaServico, CorridaApiMapeador corridaApiMapeador) {
        this.corridaServico = corridaServico;
        this.corridaApiMapeador = corridaApiMapeador;
    }

    @PostMapping
    public ResponseEntity<CorridaResponse> agendarCorrida(@Valid @RequestBody CorridaAgendamentoRequest request) {
        var corrida = corridaServico.agendarCorrida(request);
        var response = corridaApiMapeador.paraResponse(corrida);
        return ResponseEntity.created(URI.create("/api/v1/corridas/" + response.corridaId())).body(response);
    }

    @GetMapping
    public PaginacaoResponse<CorridaResponse> listar(
            @RequestParam(required = false) StatusCorrida status,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Long veiculoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataHoraInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataHoraFim,
            @RequestParam(required = false) FonteCorrida fonte,
            @RequestParam(required = false) TipoCorrida tipo,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<CorridaResponse> page = corridaServico
                .listar(status, clienteId, veiculoId, dataHoraInicio, dataHoraFim, fonte, tipo, pageable)
                .map(corridaApiMapeador::paraResponse);
        return new PaginacaoResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @GetMapping("/{corridaId}")
    public CorridaResponse buscarPorId(@PathVariable Long corridaId) {
        return corridaApiMapeador.paraResponse(corridaServico.buscarPorId(corridaId));
    }

    @PatchMapping("/{corridaId}/conclusao")
    public CorridaResponse concluirCorrida(@PathVariable Long corridaId, @Valid @RequestBody CorridaConclusaoRequest request) {
        return corridaApiMapeador.paraResponse(corridaServico.concluirCorrida(corridaId, request));
    }

    @PatchMapping("/{corridaId}/cancelamento")
    public CorridaResponse cancelarCorrida(@PathVariable Long corridaId, @Valid @RequestBody CorridaCancelamentoRequest request) {
        return corridaApiMapeador.paraResponse(corridaServico.cancelarCorrida(corridaId, request));
    }
}
