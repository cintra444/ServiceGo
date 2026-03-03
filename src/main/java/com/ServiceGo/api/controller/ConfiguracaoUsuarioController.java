package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.configuracao.ConfiguracaoUsuarioRequest;
import com.ServiceGo.api.dto.configuracao.ConfiguracaoUsuarioResponse;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.ConfiguracaoUsuario;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.domain.repository.ConfiguracaoUsuarioRepository;
import jakarta.validation.Valid;
import java.time.ZoneId;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/configuracoes-usuario")
public class ConfiguracaoUsuarioController {

    private final ConfiguracaoUsuarioRepository configuracaoRepository;
    private final AppUserRepository appUserRepository;

    public ConfiguracaoUsuarioController(
            ConfiguracaoUsuarioRepository configuracaoRepository,
            AppUserRepository appUserRepository
    ) {
        this.configuracaoRepository = configuracaoRepository;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/{usuarioId}")
    public ConfiguracaoUsuarioResponse getByUsuario(@PathVariable Long usuarioId) {
        ConfiguracaoUsuario configuracao = obterOuCriarConfiguracao(usuarioId);
        return toResponse(configuracao);
    }

    @PutMapping("/{usuarioId}")
    @ResponseStatus(HttpStatus.OK)
    public ConfiguracaoUsuarioResponse update(
            @PathVariable Long usuarioId,
            @Valid @RequestBody ConfiguracaoUsuarioRequest request
    ) {
        validarFusoHorario(request.fusoHorario());
        ConfiguracaoUsuario configuracao = obterOuCriarConfiguracao(usuarioId);
        configuracao.setSincronizarCalendario(request.sincronizarCalendario());
        configuracao.setLembreteAtivo(request.lembreteAtivo());
        configuracao.setMinutosAntecedenciaLembrete(request.minutosAntecedenciaLembrete());
        configuracao.setFusoHorario(request.fusoHorario().trim());
        return toResponse(configuracaoRepository.save(configuracao));
    }

    private ConfiguracaoUsuario obterOuCriarConfiguracao(Long usuarioId) {
        return configuracaoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> configuracaoRepository.save(novaConfiguracaoDefault(usuarioId)));
    }

    private ConfiguracaoUsuario novaConfiguracaoDefault(Long usuarioId) {
        AppUser usuario = appUserRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));
        ConfiguracaoUsuario config = new ConfiguracaoUsuario();
        config.setUsuario(usuario);
        config.setSincronizarCalendario(true);
        config.setLembreteAtivo(true);
        config.setMinutosAntecedenciaLembrete(30);
        config.setFusoHorario("America/Sao_Paulo");
        return config;
    }

    private void validarFusoHorario(String fusoHorario) {
        try {
            ZoneId.of(fusoHorario.trim());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fuso horario invalido");
        }
    }

    private ConfiguracaoUsuarioResponse toResponse(ConfiguracaoUsuario config) {
        return new ConfiguracaoUsuarioResponse(
                config.getId(),
                config.getUsuario().getId(),
                config.isSincronizarCalendario(),
                config.isLembreteAtivo(),
                config.getMinutosAntecedenciaLembrete(),
                config.getFusoHorario()
        );
    }
}
