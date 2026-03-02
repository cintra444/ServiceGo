package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.requisicao.cliente.ClienteAtualizacaoRequest;
import com.ServiceGo.api.dto.requisicao.cliente.ClienteCriacaoRequest;
import com.ServiceGo.aplicacao.porta.saida.ClientePortaSaida;
import com.ServiceGo.dominio.excecao.ConflitoNegocioException;
import com.ServiceGo.dominio.modelo.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteServico {

    private final ClientePortaSaida clientePortaSaida;

    public ClienteServico(ClientePortaSaida clientePortaSaida) {
        this.clientePortaSaida = clientePortaSaida;
    }

    @Transactional(readOnly = true)
    public Page<Cliente> listar(String nome, String email, Pageable pageable) {
        return clientePortaSaida.listar(nome, email, pageable);
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorId(Long clienteId) {
        return clientePortaSaida.buscarPorId(clienteId);
    }

    @Transactional
    public Cliente criar(ClienteCriacaoRequest request) {
        if (request.email() != null && !request.email().isBlank() && clientePortaSaida.existeEmail(request.email())) {
            throw new ConflitoNegocioException("Email ja cadastrado para outro cliente");
        }
        Cliente cliente = new Cliente();
        preencherDados(cliente, request.nome(), request.telefone(), request.email(), request.observacoes());
        return clientePortaSaida.salvar(cliente);
    }

    @Transactional
    public Cliente atualizar(Long clienteId, ClienteAtualizacaoRequest request) {
        Cliente cliente = buscarPorId(clienteId);
        if (request.email() != null && !request.email().isBlank() &&
                clientePortaSaida.existeEmailOutroCliente(request.email(), clienteId)) {
            throw new ConflitoNegocioException("Email ja cadastrado para outro cliente");
        }
        preencherDados(cliente, request.nome(), request.telefone(), request.email(), request.observacoes());
        return clientePortaSaida.salvar(cliente);
    }

    @Transactional
    public void remover(Long clienteId) {
        Cliente cliente = buscarPorId(clienteId);
        clientePortaSaida.remover(cliente);
    }

    private void preencherDados(Cliente cliente, String nome, String telefone, String email, String observacoes) {
        cliente.setNome(nome.trim());
        cliente.setTelefone(telefone);
        cliente.setEmail(email == null ? null : email.trim().toLowerCase());
        cliente.setObservacoes(observacoes);
    }
}
