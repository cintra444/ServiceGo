package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.ConfiguracaoUsuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracaoUsuarioRepository extends JpaRepository<ConfiguracaoUsuario, Long> {

    Optional<ConfiguracaoUsuario> findByUsuarioId(Long usuarioId);
}
