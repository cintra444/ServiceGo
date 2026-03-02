package com.ServiceGo.api.controlador.v1;

import com.ServiceGo.api.dto.requisicao.cliente.ClienteAtualizacaoRequest;
import com.ServiceGo.api.dto.requisicao.cliente.ClienteCriacaoRequest;
import com.ServiceGo.api.dto.resposta.cliente.ClienteResponse;
import com.ServiceGo.api.dto.resposta.compartilhado.PaginacaoResponse;
import com.ServiceGo.aplicacao.mapeador.ClienteApiMapeador;
import com.ServiceGo.aplicacao.servico.ClienteServico;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteControladorV1 {

    private final ClienteServico clienteServico;
    private final ClienteApiMapeador clienteApiMapeador;

    public ClienteControladorV1(ClienteServico clienteServico, ClienteApiMapeador clienteApiMapeador) {
        this.clienteServico = clienteServico;
        this.clienteApiMapeador = clienteApiMapeador;
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(@Valid @RequestBody ClienteCriacaoRequest request) {
        var cliente = clienteServico.criar(request);
        var response = clienteApiMapeador.paraResponse(cliente);
        return ResponseEntity.created(URI.create("/api/v1/clientes/" + response.clienteId())).body(response);
    }

    @GetMapping
    public PaginacaoResponse<ClienteResponse> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String email,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ClienteResponse> page = clienteServico.listar(nome, email, pageable).map(clienteApiMapeador::paraResponse);
        return new PaginacaoResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @GetMapping("/{clienteId}")
    public ClienteResponse buscarPorId(@PathVariable Long clienteId) {
        return clienteApiMapeador.paraResponse(clienteServico.buscarPorId(clienteId));
    }

    @PutMapping("/{clienteId}")
    public ClienteResponse atualizar(@PathVariable Long clienteId, @Valid @RequestBody ClienteAtualizacaoRequest request) {
        return clienteApiMapeador.paraResponse(clienteServico.atualizar(clienteId, request));
    }

    @DeleteMapping("/{clienteId}")
    public ResponseEntity<Void> remover(@PathVariable Long clienteId) {
        clienteServico.remover(clienteId);
        return ResponseEntity.noContent().build();
    }
}
