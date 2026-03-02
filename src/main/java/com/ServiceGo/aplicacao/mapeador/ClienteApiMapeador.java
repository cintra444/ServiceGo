package com.ServiceGo.aplicacao.mapeador;

import com.ServiceGo.api.dto.resposta.cliente.ClienteResponse;
import com.ServiceGo.dominio.modelo.Cliente;
import org.springframework.stereotype.Component;

@Component
public class ClienteApiMapeador {

    public ClienteResponse paraResponse(Cliente cliente) {
        return new ClienteResponse(
                cliente.getClienteId(),
                cliente.getNome(),
                cliente.getTelefone(),
                cliente.getEmail(),
                cliente.getObservacoes(),
                cliente.getCriadoEm(),
                cliente.getAtualizadoEm()
        );
    }
}
