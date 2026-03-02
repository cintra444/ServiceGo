package com.ServiceGo.aplicacao.porta.saida;

import com.ServiceGo.dominio.modelo.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientePortaSaida {

    Page<Cliente> listar(String nome, String email, Pageable pageable);

    Cliente buscarPorId(Long clienteId);

    Cliente salvar(Cliente cliente);

    void remover(Cliente cliente);

    boolean existeEmail(String email);

    boolean existeEmailOutroCliente(String email, Long clienteId);
}
