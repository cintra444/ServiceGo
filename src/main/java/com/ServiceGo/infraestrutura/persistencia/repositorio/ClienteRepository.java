package com.ServiceGo.infraestrutura.persistencia.repositorio;

import com.ServiceGo.dominio.modelo.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Page<Cliente> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Cliente> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    Page<Cliente> findByNomeContainingIgnoreCaseAndEmailContainingIgnoreCase(String nome, String email, Pageable pageable);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndClienteIdNot(String email, Long clienteId);
}
