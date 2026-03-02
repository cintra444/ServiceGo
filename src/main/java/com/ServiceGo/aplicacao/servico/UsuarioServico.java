package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.dominio.excecao.RegraNegocioException;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioServico {

    private final AppUserRepository appUserRepository;

    public UsuarioServico(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public AppUser buscarPorId(Long usuarioId) {
        return appUserRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado"));
    }

    @Transactional(readOnly = true)
    public void validarDesativacaoUltimoAdmin(Long usuarioIdDesconsiderado) {
        boolean existeOutroAdminAtivo = appUserRepository.findAll().stream()
                .filter(AppUser::isActive)
                .filter(user -> user.getRole() == UserRole.ADMIN)
                .filter(user -> !user.getId().equals(usuarioIdDesconsiderado))
                .findAny()
                .isPresent();

        if (!existeOutroAdminAtivo) {
            throw new RegraNegocioException("Nao e permitido desativar o ultimo admin ativo");
        }
    }
}
