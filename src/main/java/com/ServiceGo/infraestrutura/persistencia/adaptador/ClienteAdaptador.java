package com.ServiceGo.infraestrutura.persistencia.adaptador;

import com.ServiceGo.aplicacao.porta.saida.ClientePortaSaida;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import com.ServiceGo.dominio.modelo.Cliente;
import com.ServiceGo.infraestrutura.persistencia.repositorio.ClienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
public class ClienteAdaptador implements ClientePortaSaida {

    private final ClienteRepository clienteRepository;

    public ClienteAdaptador(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    public Page<Cliente> listar(String nome, String email, Pageable pageable) {
        String nomeFiltro = nome == null ? "" : nome.trim();
        String emailFiltro = email == null ? "" : email.trim();
        if (nomeFiltro.isBlank() && emailFiltro.isBlank()) {
            return clienteRepository.findAll(pageable);
        }
        if (!nomeFiltro.isBlank() && emailFiltro.isBlank()) {
            return clienteRepository.findByNomeContainingIgnoreCase(nomeFiltro, pageable);
        }
        if (nomeFiltro.isBlank()) {
            return clienteRepository.findByEmailContainingIgnoreCase(emailFiltro, pageable);
        }
        return clienteRepository.findByNomeContainingIgnoreCaseAndEmailContainingIgnoreCase(nomeFiltro, emailFiltro, pageable);
    }

    @Override
    public Cliente buscarPorId(Long clienteId) {
        return clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente nao encontrado"));
    }

    @Override
    public Cliente salvar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @Override
    public void remover(Cliente cliente) {
        clienteRepository.delete(cliente);
    }

    @Override
    public boolean existeEmail(String email) {
        return clienteRepository.existsByEmailIgnoreCase(email);
    }

    @Override
    public boolean existeEmailOutroCliente(String email, Long clienteId) {
        return clienteRepository.existsByEmailIgnoreCaseAndClienteIdNot(email, clienteId);
    }
}
